/**
 * WK 2026 Poule — Express Server
 * API routes for authentication, matches, predictions, standings, and admin.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
const { recalculateAllPoints, recalculateMatchPoints } = require('./scoring');
const { startLiveScoreUpdater } = require('./live-scores');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Auth middleware — extracts participant from Bearer token.
 * Sets req.participant if valid token found.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Geen authenticatie token meegegeven.' });
  }

  const token = authHeader.substring(7);
  const participant = db.getParticipantByToken(token);

  if (!participant) {
    return res.status(401).json({ error: 'Ongeldig token.' });
  }

  req.participant = participant;
  next();
}

/**
 * Optional auth middleware — sets req.participant if token present, but doesn't require it.
 */
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const participant = db.getParticipantByToken(token);
    if (participant) {
      req.participant = participant;
    }
  }
  next();
}

/**
 * Admin middleware — must be used after authMiddleware.
 * Checks if participant is admin.
 */
function adminMiddleware(req, res, next) {
  if (!req.participant || req.participant.is_admin !== 1) {
    return res.status(403).json({ error: 'Alleen beheerders hebben toegang.' });
  }
  next();
}

// ==========================================
// AUTH ROUTES
// ==========================================

/**
 * POST /api/join
 * Join the pool with a name and invite code.
 */
app.post('/api/join', (req, res) => {
  try {
    const { name, inviteCode } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Naam is verplicht.' });
    }

    if (!inviteCode) {
      return res.status(400).json({ error: 'Uitnodigingscode is verplicht.' });
    }

    if (inviteCode !== process.env.INVITE_CODE) {
      return res.status(403).json({ error: 'Ongeldige uitnodigingscode.' });
    }

    const trimmedName = name.trim();

    // Check if name already exists
    const existing = db.getParticipantByName(trimmedName);
    if (existing) {
      return res.json({
        token: existing.session_token,
        participant: {
          id: existing.id,
          name: existing.name,
          isAdmin: existing.is_admin === 1
        }
      });
    }

    const token = uuidv4();
    db.addParticipant(trimmedName, token);

    const participant = db.getParticipantByToken(token);

    res.json({
      token,
      participant: {
        id: participant.id,
        name: participant.name,
        isAdmin: participant.is_admin === 1
      }
    });
  } catch (error) {
    console.error('Error in /api/join:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * POST /api/admin/login
 * Login as admin with admin code.
 */
app.post('/api/admin/login', (req, res) => {
  try {
    const { adminCode } = req.body;

    if (!adminCode) {
      return res.status(400).json({ error: 'Admin code is verplicht.' });
    }

    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(403).json({ error: 'Ongeldige admin code.' });
    }

    // Get or create admin participant
    let admin = db.getParticipantByName('Admin');

    if (!admin) {
      const token = uuidv4();
      db.addParticipant('Admin', token);
      admin = db.getParticipantByToken(token);
      db.setAdmin(admin.id);
      admin = db.getParticipantByToken(token);
    } else if (admin.is_admin !== 1) {
      db.setAdmin(admin.id);
      admin = db.getParticipantByName('Admin');
    }

    res.json({
      token: admin.session_token,
      participant: {
        id: admin.id,
        name: admin.name,
        isAdmin: true
      }
    });
  } catch (error) {
    console.error('Error in /api/admin/login:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * GET /api/me
 * Get current participant info.
 */
app.get('/api/me', authMiddleware, (req, res) => {
  res.json({
    participant: {
      id: req.participant.id,
      name: req.participant.name,
      isAdmin: req.participant.is_admin === 1
    }
  });
});

// ==========================================
// MATCH ROUTES
// ==========================================

/**
 * GET /api/matches
 * Get all matches with team data. Optional filters: stage, group.
 * If authenticated, includes user's predictions.
 */
app.get('/api/matches', optionalAuthMiddleware, (req, res) => {
  try {
    const { stage, group, participantId } = req.query;
    const matches = db.getAllMatches(stage || null, group || null);

    // If user is authenticated, attach predictions
    let predictionsMap = {};
    if (req.participant) {
      const targetParticipantId = (req.participant.is_admin === 1 && participantId)
        ? parseInt(participantId)
        : req.participant.id;

      const predictions = db.getPredictions(targetParticipantId);
      for (const pred of predictions) {
        predictionsMap[pred.match_id] = {
          homeScore: pred.home_score,
          awayScore: pred.away_score,
          pointsEarned: pred.points_earned
        };
      }
    }

    const enrichedMatches = matches.map(match => {
      const pred = predictionsMap[match.id] || null;
      return {
        ...match,
        pred_home_score: pred ? pred.homeScore : null,
        pred_away_score: pred ? pred.awayScore : null,
        pred_points: pred ? pred.pointsEarned : null,
        prediction: pred
      };
    });

    res.json({ matches: enrichedMatches });
  } catch (error) {
    console.error('Error in GET /api/matches:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * GET /api/matches/:id
 * Get a single match with details.
 */
app.get('/api/matches/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const match = db.getMatch(parseInt(req.params.id));

    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    // Include prediction if authenticated
    let prediction = null;
    if (req.participant) {
      const predictions = db.getPredictions(req.participant.id);
      const pred = predictions.find(p => p.match_id === match.id);
      if (pred) {
        prediction = {
          homeScore: pred.home_score,
          awayScore: pred.away_score,
          pointsEarned: pred.points_earned
        };
      }
    }

    res.json({
      match: {
        ...match,
        pred_home_score: prediction ? prediction.homeScore : null,
        pred_away_score: prediction ? prediction.awayScore : null,
        pred_points: prediction ? prediction.pointsEarned : null,
        prediction
      }
    });
  } catch (error) {
    console.error('Error in GET /api/matches/:id:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

// ==========================================
// PREDICTION ROUTES (require auth)
// ==========================================

/**
 * GET /api/predictions
 * Get all predictions for the current participant.
 */
app.get('/api/predictions', authMiddleware, (req, res) => {
  try {
    const predictions = db.getPredictions(req.participant.id);
    const predictionsMap = {};

    for (const pred of predictions) {
      predictionsMap[pred.match_id] = {
        homeScore: pred.home_score,
        awayScore: pred.away_score,
        pointsEarned: pred.points_earned
      };
    }

    res.json({ predictions: predictionsMap });
  } catch (error) {
    console.error('Error in GET /api/predictions:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * POST /api/predictions
 * Batch save predictions.
 * Body: { predictions: [{ matchId, homeScore, awayScore }] }
 */
app.post('/api/predictions', authMiddleware, (req, res) => {
  try {
    const { predictions } = req.body;

    if (!predictions || !Array.isArray(predictions)) {
      return res.status(400).json({ error: 'Voorspellingen array is verplicht.' });
    }

    const isAdmin = req.participant.is_admin === 1;
    const errors = [];
    const validPredictions = [];

    for (const pred of predictions) {
      const { matchId, homeScore, awayScore } = pred;

      if (matchId === undefined || homeScore === undefined || awayScore === undefined) {
        errors.push(`Ongeldige voorspelling: ontbrekende velden.`);
        continue;
      }

      if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
        errors.push(`Wedstrijd ${matchId}: ongeldige score.`);
        continue;
      }

      // Check if match exists
      const match = db.getMatch(matchId);
      if (!match) {
        errors.push(`Wedstrijd ${matchId} niet gevonden.`);
        continue;
      }

      // Check if match is locked (unless admin)
      if (!isAdmin && db.isMatchLocked(matchId)) {
        errors.push(`Wedstrijd ${matchId}: voorspelling is gesloten (wedstrijd is al begonnen).`);
        continue;
      }

      validPredictions.push({ matchId, homeScore, awayScore });
    }

    if (validPredictions.length > 0) {
      db.savePredictions(req.participant.id, validPredictions);
    }

    res.json({
      saved: validPredictions.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error in POST /api/predictions:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * PUT /api/predictions/:matchId
 * Update a single prediction.
 */
app.put('/api/predictions/:matchId', authMiddleware, (req, res) => {
  try {
    const matchId = parseInt(req.params.matchId);
    const { homeScore, awayScore } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'homeScore en awayScore zijn verplicht.' });
    }

    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return res.status(400).json({ error: 'Ongeldige score waarden.' });
    }

    const match = db.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    const isAdmin = req.participant.is_admin === 1;
    if (!isAdmin && db.isMatchLocked(matchId)) {
      return res.status(403).json({ error: 'Voorspelling is gesloten — wedstrijd is al begonnen.' });
    }

    db.savePrediction(req.participant.id, matchId, homeScore, awayScore);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/predictions/:matchId:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

// ==========================================
// STANDINGS ROUTES
// ==========================================

/**
 * GET /api/standings
 * Get the leaderboard. No auth required.
 */
app.get('/api/standings', (req, res) => {
  try {
    const standings = db.getStandings();

    // Add rank
    const rankedStandings = standings.map((entry, index) => ({
      rank: index + 1,
      ...entry
    }));

    res.json({ standings: rankedStandings });
  } catch (error) {
    console.error('Error in GET /api/standings:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * PUT /api/admin/matches/:id/result
 * Set match result and recalculate points.
 */
app.put('/api/admin/matches/:id/result', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const { homeScore, awayScore } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'homeScore en awayScore zijn verplicht.' });
    }

    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return res.status(400).json({ error: 'Ongeldige score waarden.' });
    }

    const match = db.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    // Update the match result
    db.updateMatchResult(matchId, homeScore, awayScore);

    // Recalculate points for this match
    const updatedMatch = db.getMatch(matchId);
    recalculateMatchPoints(db, updatedMatch);

    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error in PUT /api/admin/matches/:id/result:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * PUT /api/admin/matches/:id/teams
 * Assign teams to a knockout match.
 */
app.put('/api/admin/matches/:id/teams', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const { homeTeamId, awayTeamId } = req.body;

    if (!homeTeamId || !awayTeamId) {
      return res.status(400).json({ error: 'homeTeamId en awayTeamId zijn verplicht.' });
    }

    const match = db.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    db.updateMatchTeams(matchId, homeTeamId, awayTeamId);

    const updatedMatch = db.getMatch(matchId);
    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error in PUT /api/admin/matches/:id/teams:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * PUT /api/admin/matches/:id/status
 * Change match status.
 */
app.put('/api/admin/matches/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['upcoming', 'live', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Status moet "upcoming", "live" of "finished" zijn.' });
    }

    const match = db.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    db.updateMatchStatus(matchId, status);

    const updatedMatch = db.getMatch(matchId);
    res.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error in PUT /api/admin/matches/:id/status:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * POST /api/admin/recalculate
 * Recalculate all points for all finished matches.
 */
app.post('/api/admin/recalculate', authMiddleware, adminMiddleware, (req, res) => {
  try {
    recalculateAllPoints(db);
    res.json({ success: true, message: 'Alle punten zijn herberekend.' });
  } catch (error) {
    console.error('Error in POST /api/admin/recalculate:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * PUT /api/admin/predictions/:participantId/:matchId
 * Edit a prediction on behalf of a participant (admin only, bypasses locks).
 */
app.put('/api/admin/predictions/:participantId/:matchId', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const participantId = parseInt(req.params.participantId);
    const matchId = parseInt(req.params.matchId);
    const { homeScore, awayScore } = req.body;

    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: 'homeScore en awayScore zijn verplicht.' });
    }

    if (homeScore < 0 || awayScore < 0 || !Number.isInteger(homeScore) || !Number.isInteger(awayScore)) {
      return res.status(400).json({ error: 'Ongeldige score waarden.' });
    }

    const match = db.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Wedstrijd niet gevonden.' });
    }

    // Save prediction for the target participant
    db.savePrediction(participantId, matchId, homeScore, awayScore);

    // If match is finished, recalculate points
    if (match.status === 'finished') {
      recalculateMatchPoints(db, match);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/admin/predictions:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * POST /api/admin/fetch-next-round
 * Fetch knockout match teams from football-data.org for a given stage
 * and update the database. Matches are paired by kick-off time.
 */
app.post('/api/admin/fetch-next-round', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ error: 'stage is verplicht.' });
    }

    const validStages = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Ongeldige stage.' });
    }

    const apiKey = process.env.FOOTBALL_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'Geen FOOTBALL_API_KEY geconfigureerd. Voeg de API-sleutel toe aan .env.' });
    }

    // Map our stage names to football-data.org round names
    const STAGE_MAP = {
      'round_of_32': 'LAST_32',
      'round_of_16': 'LAST_16',
      'quarterfinal': 'QUARTER_FINALS',
      'semifinal': 'SEMI_FINALS',
      'third_place': 'THIRD_PLACE',
      'final': 'FINAL',
    };

    // Team name → our code mapping (reuse from live-scores.js logic)
    const TEAM_NAME_MAP = {
      'Mexico': 'MEX', 'South Africa': 'RSA', 'Korea Republic': 'KOR', 'South Korea': 'KOR',
      'Czech Republic': 'CZE', 'Czechia': 'CZE', 'Canada': 'CAN',
      'Bosnia-Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT',
      'Switzerland': 'SUI', 'Brazil': 'BRA', 'Morocco': 'MAR', 'Haiti': 'HAI',
      'Scotland': 'SCO', 'United States': 'USA', 'USA': 'USA', 'Paraguay': 'PAR',
      'Australia': 'AUS', 'Turkey': 'TUR', 'Türkiye': 'TUR', 'Germany': 'GER',
      'Curaçao': 'CUW', 'Curacao': 'CUW', "Côte d'Ivoire": 'CIV', 'Ivory Coast': 'CIV',
      'Ecuador': 'ECU', 'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE',
      'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN',
      'New Zealand': 'NZL', 'Spain': 'ESP', 'Cape Verde': 'CPV', 'Cabo Verde': 'CPV',
      'Cape Verde Islands': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
      'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ', 'Norway': 'NOR',
      'Argentina': 'ARG', 'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR',
      'Portugal': 'POR', 'DR Congo': 'COD', 'Congo DR': 'COD', 'Uzbekistan': 'UZB',
      'Colombia': 'COL', 'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA',
      'Panama': 'PAN',
    };

    const apiRound = STAGE_MAP[stage];
    const apiUrl = `https://api.football-data.org/v4/competitions/WC/matches?stage=${apiRound}`;

    console.log(`[fetch-next-round] Fetching ${apiRound} from football-data.org...`);

    const response = await fetch(apiUrl, {
      headers: { 'X-Auth-Token': apiKey }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[fetch-next-round] API error ${response.status}: ${errorText}`);
      return res.status(502).json({ error: `football-data.org API fout ${response.status}: ${errorText}` });
    }

    const data = await response.json();
    const apiMatches = data.matches || [];

    if (apiMatches.length === 0) {
      return res.json({ updated: 0, message: 'Geen wedstrijden gevonden bij de API voor deze ronde.' });
    }

    // Get our matches for this stage that still have no teams assigned
    const ourMatches = db.getAllMatches(stage);
    const matchesNeedingTeams = ourMatches.filter(m => !m.home_team_id || !m.away_team_id);

    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (const apiMatch of apiMatches) {
      const homeTeamName = apiMatch.homeTeam?.name || apiMatch.homeTeam?.shortName;
      const awayTeamName = apiMatch.awayTeam?.name || apiMatch.awayTeam?.shortName;

      // Skip matches where teams are not yet known (TBD)
      if (!homeTeamName || !awayTeamName || homeTeamName === 'TBD' || awayTeamName === 'TBD') {
        skipped++;
        continue;
      }

      const homeCode = TEAM_NAME_MAP[homeTeamName];
      const awayCode = TEAM_NAME_MAP[awayTeamName];

      if (!homeCode) {
        errors.push(`Onbekend team: ${homeTeamName}`);
        continue;
      }
      if (!awayCode) {
        errors.push(`Onbekend team: ${awayTeamName}`);
        continue;
      }

      // Match by UTC date (compare date portion, ±30 min tolerance)
      const apiDate = new Date(apiMatch.utcDate);

      const ourMatch = matchesNeedingTeams.find(m => {
        const ourDate = new Date(m.match_date);
        return Math.abs(ourDate.getTime() - apiDate.getTime()) < 30 * 60 * 1000;
      });

      if (!ourMatch) {
        // Try to find among all matches for this stage (might already have teams)
        const existing = ourMatches.find(m => {
          const ourDate = new Date(m.match_date);
          return Math.abs(ourDate.getTime() - apiDate.getTime()) < 30 * 60 * 1000;
        });
        if (existing) {
          skipped++; // Already has teams assigned
        } else {
          errors.push(`Geen overeenkomst gevonden voor ${homeTeamName} vs ${awayTeamName} op ${apiDate.toISOString()}`);
        }
        continue;
      }

      const homeTeam = db.getTeamByCode(homeCode);
      const awayTeam = db.getTeamByCode(awayCode);

      if (!homeTeam) { errors.push(`Team niet gevonden: ${homeCode}`); continue; }
      if (!awayTeam) { errors.push(`Team niet gevonden: ${awayCode}`); continue; }

      db.updateMatchTeams(ourMatch.id, homeTeam.id, awayTeam.id);
      console.log(`[fetch-next-round] Bijgewerkt: ${homeCode} vs ${awayCode} (wedstrijd #${ourMatch.match_number})`);
      updated++;
    }

    res.json({
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      message: `${updated} wedstrijd(en) bijgewerkt, ${skipped} overgeslagen.`
    });
  } catch (error) {
    console.error('Error in POST /api/admin/fetch-next-round:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

/**
 * GET /api/admin/participants
 * List all participants.
 */
app.get('/api/admin/participants', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const participants = db.getAllParticipants();
    res.json({ participants });
  } catch (error) {
    console.error('Error in GET /api/admin/participants:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

// ==========================================
// TEAMS ROUTE
// ==========================================

/**
 * GET /api/teams
 * Get all teams.
 */
app.get('/api/teams', (req, res) => {
  try {
    const teams = db.getAllTeams();
    res.json({ teams });
  } catch (error) {
    console.error('Error in GET /api/teams:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden.' });
  }
});

// ==========================================
// DATABASE DOWNLOAD
// ==========================================

/**
 * GET /api/admin/download-db
 * Stream the SQLite database file as a download (admin only).
 */
app.get('/api/admin/download-db', authMiddleware, adminMiddleware, (req, res) => {
  try {
    // Persist latest in-memory state to disk before sending
    db.persist();

    const fileName = `poule-backup-${new Date().toISOString().slice(0, 10)}.db`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(db.dbPath, { root: '/' });
  } catch (error) {
    console.error('Error in GET /api/admin/download-db:', error);
    res.status(500).json({ error: 'Er is een fout opgetreden bij het downloaden van de database.' });
  }
});

// ==========================================
// SPA CATCH-ALL
// ==========================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// START SERVER
// ==========================================

db.initDb().then(() => {
  startLiveScoreUpdater(db);

  app.listen(PORT, () => {
    console.log(`WK 2026 Poule server running on port ${PORT}`);
    console.log(`Admin code: ${process.env.ADMIN_CODE}`);
    console.log(`Invite code: ${process.env.INVITE_CODE}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
