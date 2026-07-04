/**
 * Database module for WK 2026 Poule
 * Uses sql.js (pure JavaScript SQLite — no native compilation needed).
 * Data is persisted to data/poule.db on disk.
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const { teams, matches } = require('./seed-data');

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'poule.db');

let db = null;

/**
 * Save the database to disk.
 */
function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Auto-persist every 30 seconds
setInterval(function () {
  persist();
}, 30000);

// ==========================================
// Helper: run a query that returns rows
// ==========================================

function queryAll(sql, params) {
  const stmt = db.prepare(sql);
  if (params) stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

function runSql(sql, params) {
  if (params) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  persist();
}

// ==========================================
// Schema initialization
// ==========================================

function initDb() {
  return initSqlJs().then(function (SQL) {
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    db.run("PRAGMA foreign_keys = ON;");

    db.run("\n      CREATE TABLE IF NOT EXISTS pool (\n        id TEXT PRIMARY KEY DEFAULT 'main',\n        name TEXT NOT NULL DEFAULT 'WK 2026 Poule',\n        admin_code TEXT NOT NULL,\n        invite_code TEXT NOT NULL,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      );\n    ");

    db.run("\n      CREATE TABLE IF NOT EXISTS participants (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name TEXT NOT NULL UNIQUE COLLATE NOCASE,\n        session_token TEXT NOT NULL UNIQUE,\n        is_admin INTEGER DEFAULT 0,\n        created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n      );\n    ");

    db.run("\n      CREATE TABLE IF NOT EXISTS teams (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        name TEXT NOT NULL,\n        name_nl TEXT NOT NULL,\n        code TEXT NOT NULL UNIQUE,\n        flag_code TEXT NOT NULL,\n        group_letter TEXT NOT NULL\n      );\n    ");

    db.run("\n      CREATE TABLE IF NOT EXISTS matches (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        match_number INTEGER NOT NULL UNIQUE,\n        stage TEXT NOT NULL DEFAULT 'group',\n        group_letter TEXT,\n        home_team_id INTEGER REFERENCES teams(id),\n        away_team_id INTEGER REFERENCES teams(id),\n        match_date TEXT NOT NULL,\n        venue TEXT,\n        description TEXT,\n        home_score INTEGER,\n        away_score INTEGER,\n        status TEXT DEFAULT 'upcoming'\n      );\n    ");

    db.run("\n      CREATE TABLE IF NOT EXISTS predictions (\n        id INTEGER PRIMARY KEY AUTOINCREMENT,\n        participant_id INTEGER NOT NULL REFERENCES participants(id),\n        match_id INTEGER NOT NULL REFERENCES matches(id),\n        home_score INTEGER NOT NULL,\n        away_score INTEGER NOT NULL,\n        points_earned INTEGER DEFAULT 0,\n        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n        UNIQUE(participant_id, match_id)\n      );\n    ");

    // Seed data if not already present
    seedTeams();
    seedMatches();

    persist();
    console.log('Database initialized successfully.');
    return db;
  });
}

// ==========================================
// Seeding
// ==========================================

function seedTeams() {
  var existing = queryOne('SELECT COUNT(*) as count FROM teams');
  if (existing && existing.count > 0) return;

  for (var i = 0; i < teams.length; i++) {
    var team = teams[i];
    db.run(
      'INSERT INTO teams (name, name_nl, code, flag_code, group_letter) VALUES (?, ?, ?, ?, ?)',
      [team.name, team.nameNl, team.code, team.flagCode, team.group]
    );
  }
  console.log('Seeded ' + teams.length + ' teams.');
}

function seedMatches() {
  var existing = queryOne('SELECT COUNT(*) as count FROM matches');
  if (existing && existing.count > 0) return;

  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var homeTeamId = null;
    var awayTeamId = null;

    if (match.homeTeamCode) {
      var homeTeam = getTeamByCode(match.homeTeamCode);
      if (homeTeam) homeTeamId = homeTeam.id;
    }
    if (match.awayTeamCode) {
      var awayTeam = getTeamByCode(match.awayTeamCode);
      if (awayTeam) awayTeamId = awayTeam.id;
    }

    db.run(
      'INSERT INTO matches (match_number, stage, group_letter, home_team_id, away_team_id, match_date, venue, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [match.matchNumber, match.stage, match.groupLetter, homeTeamId, awayTeamId, match.matchDate, match.venue, match.description]
    );
  }
  console.log('Seeded ' + matches.length + ' matches.');
}

// ==========================================
// Team queries
// ==========================================

function getTeamByCode(code) {
  return queryOne('SELECT * FROM teams WHERE code = ?', [code]);
}

function getAllTeams() {
  return queryAll('SELECT * FROM teams ORDER BY group_letter, name');
}

// ==========================================
// Match queries
// ==========================================

var MATCH_SELECT = "\n  SELECT\n    m.id,\n    m.match_number,\n    m.stage,\n    m.group_letter,\n    m.home_team_id,\n    m.away_team_id,\n    ht.name AS home_team_name,\n    ht.name_nl AS home_team_name_nl,\n    ht.code AS home_team_code,\n    ht.flag_code AS home_team_flag,\n    at2.name AS away_team_name,\n    at2.name_nl AS away_team_name_nl,\n    at2.code AS away_team_code,\n    at2.flag_code AS away_team_flag,\n    m.match_date,\n    m.venue,\n    m.description,\n    m.home_score,\n    m.away_score,\n    m.status\n  FROM matches m\n  LEFT JOIN teams ht ON m.home_team_id = ht.id\n  LEFT JOIN teams at2 ON m.away_team_id = at2.id\n";

function getAllMatches(stage, group) {
  var query = MATCH_SELECT;
  var params = [];
  var conditions = [];

  if (stage) {
    conditions.push('m.stage = ?');
    params.push(stage);
  }
  if (group) {
    conditions.push('m.group_letter = ?');
    params.push(group);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY m.match_number ASC';

  return queryAll(query, params.length > 0 ? params : undefined);
}

function getMatch(id) {
  return queryOne(MATCH_SELECT + ' WHERE m.id = ?', [id]);
}

function updateMatchResult(matchId, homeScore, awayScore) {
  runSql(
    'UPDATE matches SET home_score = ?, away_score = ?, status = ? WHERE id = ?',
    [homeScore, awayScore, 'finished', matchId]
  );
}

function updateMatchTeams(matchId, homeTeamId, awayTeamId) {
  runSql(
    'UPDATE matches SET home_team_id = ?, away_team_id = ? WHERE id = ?',
    [homeTeamId, awayTeamId, matchId]
  );
}

function updateMatchStatus(matchId, status) {
  runSql('UPDATE matches SET status = ? WHERE id = ?', [status, matchId]);
}

function updateMatchDate(matchId, matchDate) {
  runSql('UPDATE matches SET match_date = ? WHERE id = ?', [matchDate, matchId]);
}

// ==========================================
// Participant queries
// ==========================================

function addParticipant(name, token) {
  runSql(
    'INSERT INTO participants (name, session_token) VALUES (?, ?)',
    [name, token]
  );
}

function getParticipantByToken(token) {
  return queryOne('SELECT * FROM participants WHERE session_token = ?', [token]);
}

function getParticipantByName(name) {
  return queryOne('SELECT * FROM participants WHERE name = ? COLLATE NOCASE', [name]);
}

function getAllParticipants() {
  return queryAll('SELECT id, name, is_admin, created_at FROM participants ORDER BY name');
}

function setAdmin(participantId) {
  runSql('UPDATE participants SET is_admin = 1 WHERE id = ?', [participantId]);
}

// ==========================================
// Prediction queries
// ==========================================

function getPredictions(participantId) {
  return queryAll(
    'SELECT * FROM predictions WHERE participant_id = ? ORDER BY match_id',
    [participantId]
  );
}

function getPredictionsForMatch(matchId) {
  return queryAll(
    'SELECT * FROM predictions WHERE match_id = ?',
    [matchId]
  );
}

function savePrediction(participantId, matchId, homeScore, awayScore) {
  // Check if prediction exists
  var existing = queryOne(
    'SELECT id FROM predictions WHERE participant_id = ? AND match_id = ?',
    [participantId, matchId]
  );

  if (existing) {
    runSql(
      "UPDATE predictions SET home_score = ?, away_score = ?, updated_at = datetime('now') WHERE participant_id = ? AND match_id = ?",
      [homeScore, awayScore, participantId, matchId]
    );
  } else {
    runSql(
      "INSERT INTO predictions (participant_id, match_id, home_score, away_score, updated_at) VALUES (?, ?, ?, ?, datetime('now'))",
      [participantId, matchId, homeScore, awayScore]
    );
  }
}

function savePredictions(participantId, predictions) {
  for (var i = 0; i < predictions.length; i++) {
    var pred = predictions[i];
    savePrediction(participantId, pred.matchId, pred.homeScore, pred.awayScore);
  }
  persist();
}

function updatePredictionPoints(predictionId, points) {
  runSql('UPDATE predictions SET points_earned = ? WHERE id = ?', [points, predictionId]);
}

// ==========================================
// Standings
// ==========================================

function getStandings() {
  return queryAll(`
    SELECT
      p.name,
      COALESCE(SUM(pr.points_earned), 0) AS totalPoints,
      COUNT(pr.id) AS matchesPredicted,
      COALESCE(SUM(CASE 
        WHEN m.stage = 'group' AND pr.points_earned = 5 THEN 1
        WHEN m.stage = 'round_of_32' AND pr.points_earned = 10 THEN 1
        WHEN m.stage = 'round_of_16' AND pr.points_earned = 15 THEN 1
        WHEN m.stage IN ('quarterfinal', 'quarter_final') AND pr.points_earned = 20 THEN 1
        WHEN m.stage IN ('semifinal', 'semi_final') AND pr.points_earned = 25 THEN 1
        WHEN m.stage IN ('third_place', 'final') AND pr.points_earned = 30 THEN 1
        ELSE 0 
      END), 0) AS perfectScores
    FROM participants p
    LEFT JOIN predictions pr ON p.id = pr.participant_id
    LEFT JOIN matches m ON pr.match_id = m.id
    WHERE p.is_admin = 0
    GROUP BY p.id, p.name
    ORDER BY totalPoints DESC, perfectScores DESC, p.name ASC
  `);
}

// ==========================================
// Utility queries
// ==========================================

function getMatchesNeedingUpdate() {
  return queryAll("\n    SELECT m.*, ht.code AS home_team_code, at2.code AS away_team_code\n    FROM matches m\n    LEFT JOIN teams ht ON m.home_team_id = ht.id\n    LEFT JOIN teams at2 ON m.away_team_id = at2.id\n    WHERE m.status != 'finished'\n      AND m.match_date < datetime('now')\n      AND m.home_team_id IS NOT NULL\n      AND m.away_team_id IS NOT NULL\n  ");
}

function isMatchLocked(matchId) {
  var match = queryOne('SELECT match_date FROM matches WHERE id = ?', [matchId]);
  if (!match) return true;
  return new Date(match.match_date) < new Date();
}

module.exports = {
  initDb: initDb,
  dbPath: dbPath,
  persist: persist,
  getTeamByCode: getTeamByCode,
  getAllTeams: getAllTeams,
  getAllMatches: getAllMatches,
  getMatch: getMatch,
  updateMatchResult: updateMatchResult,
  updateMatchTeams: updateMatchTeams,
  updateMatchStatus: updateMatchStatus,
  updateMatchDate: updateMatchDate,
  addParticipant: addParticipant,
  getParticipantByToken: getParticipantByToken,
  getParticipantByName: getParticipantByName,
  getAllParticipants: getAllParticipants,
  setAdmin: setAdmin,
  getPredictions: getPredictions,
  getPredictionsForMatch: getPredictionsForMatch,
  savePrediction: savePrediction,
  savePredictions: savePredictions,
  updatePredictionPoints: updatePredictionPoints,
  getStandings: getStandings,
  getMatchesNeedingUpdate: getMatchesNeedingUpdate,
  isMatchLocked: isMatchLocked
};
