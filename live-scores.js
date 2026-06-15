/**
 * Live Scores module for WK 2026 Poule
 * Auto-fetches match results from football-data.org API v4.
 * 
 * Falls back gracefully — if no API key is set, scores can be entered manually by admin.
 */

const { recalculateMatchPoints } = require('./scoring');

const API_BASE = 'https://api.football-data.org/v4';
const COMPETITION_CODE = 'WC'; // FIFA World Cup

let updateInterval = null;
let dbRef = null;

// Mapping from football-data.org team names to our team codes
const TEAM_NAME_MAP = {
  'Mexico': 'MEX',
  'South Africa': 'RSA',
  'Korea Republic': 'KOR',
  'South Korea': 'KOR',
  'Czech Republic': 'CZE',
  'Czechia': 'CZE',
  'Canada': 'CAN',
  'Bosnia-Herzegovina': 'BIH',
  'Bosnia and Herzegovina': 'BIH',
  'Qatar': 'QAT',
  'Switzerland': 'SUI',
  'Brazil': 'BRA',
  'Morocco': 'MAR',
  'Haiti': 'HAI',
  'Scotland': 'SCO',
  'United States': 'USA',
  'USA': 'USA',
  'Paraguay': 'PAR',
  'Australia': 'AUS',
  'Turkey': 'TUR',
  'Türkiye': 'TUR',
  'Germany': 'GER',
  'Curaçao': 'CUW',
  'Curacao': 'CUW',
  'Côte d\'Ivoire': 'CIV',
  'Ivory Coast': 'CIV',
  'Ecuador': 'ECU',
  'Netherlands': 'NED',
  'Japan': 'JPN',
  'Sweden': 'SWE',
  'Tunisia': 'TUN',
  'Belgium': 'BEL',
  'Egypt': 'EGY',
  'Iran': 'IRN',
  'New Zealand': 'NZL',
  'Spain': 'ESP',
  'Cape Verde': 'CPV',
  'Cabo Verde': 'CPV',
  'Cape Verde Islands': 'CPV',
  'Saudi Arabia': 'KSA',
  'Uruguay': 'URU',
  'France': 'FRA',
  'Senegal': 'SEN',
  'Iraq': 'IRQ',
  'Norway': 'NOR',
  'Argentina': 'ARG',
  'Algeria': 'ALG',
  'Austria': 'AUT',
  'Jordan': 'JOR',
  'Portugal': 'POR',
  'DR Congo': 'COD',
  'Congo DR': 'COD',
  'Uzbekistan': 'UZB',
  'Colombia': 'COL',
  'England': 'ENG',
  'Croatia': 'CRO',
  'Ghana': 'GHA',
  'Panama': 'PAN',
};

/**
 * Start the live score updater.
 * Checks periodically for match results and updates the database.
 */
function startLiveScoreUpdater(db) {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.log('[Live Scores] No FOOTBALL_API_KEY set — live score updates disabled.');
    console.log('[Live Scores] Scores can be entered manually via the admin panel.');
    return;
  }

  dbRef = db;
  console.log('[Live Scores] Live score updater started.');

  // Initial check
  scheduleNextCheck();
}

/**
 * Stop the live score updater.
 */
function stopLiveScoreUpdater() {
  if (updateInterval) {
    clearTimeout(updateInterval);
    updateInterval = null;
    console.log('[Live Scores] Live score updater stopped.');
  }
}

/**
 * Schedule the next check based on whether matches are being played.
 */
function scheduleNextCheck() {
  const now = new Date();
  const matches = dbRef.getAllMatches();

  // Check if any match is within 3 hours of now (before or after)
  const threeHours = 3 * 60 * 60 * 1000;
  const hasActiveMatches = matches.some(m => {
    if (m.status === 'finished') return false;
    const matchTime = new Date(m.match_date).getTime();
    const diff = Math.abs(matchTime - now.getTime());
    return diff < threeHours;
  });

  // 5 minutes when active, 30 minutes otherwise
  const intervalMs = hasActiveMatches ? 5 * 60 * 1000 : 30 * 60 * 1000;

  updateInterval = setTimeout(async () => {
    await fetchAndUpdateScores(dbRef);
    scheduleNextCheck();
  }, intervalMs);

  const minutes = intervalMs / 60000;
  console.log(`[Live Scores] Next check in ${minutes} minutes (${hasActiveMatches ? 'active matches nearby' : 'idle mode'}).`);
}

/**
 * Fetch scores from football-data.org and update the database.
 */
async function fetchAndUpdateScores(db) {
  const apiKey = process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    console.log('[Live Scores] No API key configured, skipping fetch.');
    return;
  }

  try {
    console.log('[Live Scores] Fetching match results from football-data.org...');

    const response = await fetch(`${API_BASE}/competitions/${COMPETITION_CODE}/matches`, {
      headers: {
        'X-Auth-Token': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Live Scores] API error ${response.status}: ${errorText}`);
      return;
    }

    const data = await response.json();

    if (!data.matches || !Array.isArray(data.matches)) {
      console.log('[Live Scores] No matches data in API response.');
      return;
    }

    let updatedCount = 0;

    for (const apiMatch of data.matches) {
      try {
        const result = processApiMatch(db, apiMatch);
        if (result) updatedCount++;
      } catch (err) {
        console.error(`[Live Scores] Error processing match:`, err.message);
      }
    }

    if (updatedCount > 0) {
      console.log(`[Live Scores] Updated ${updatedCount} match(es).`);
    } else {
      console.log('[Live Scores] No new results to update.');
    }
  } catch (error) {
    console.error('[Live Scores] Failed to fetch scores:', error.message);
  }
}

/**
 * Process a single API match result.
 * Returns true if the database was updated.
 */
function processApiMatch(db, apiMatch) {
  // Only process finished matches
  if (apiMatch.status !== 'FINISHED') return false;

  const homeTeamName = apiMatch.homeTeam?.name || apiMatch.homeTeam?.shortName;
  const awayTeamName = apiMatch.awayTeam?.name || apiMatch.awayTeam?.shortName;

  if (!homeTeamName || !awayTeamName) return false;

  const homeCode = TEAM_NAME_MAP[homeTeamName];
  const awayCode = TEAM_NAME_MAP[awayTeamName];

  if (!homeCode || !awayCode) {
    console.log(`[Live Scores] Unknown team mapping: ${homeTeamName} or ${awayTeamName}`);
    return false;
  }

  // Find the match in our database by team codes
  const ourMatches = db.getAllMatches();
  const ourMatch = ourMatches.find(m =>
    m.home_team_code === homeCode &&
    m.away_team_code === awayCode &&
    m.status !== 'finished'
  );

  if (!ourMatch) return false;

  // Get the final score (full time or after penalties)
  const score = apiMatch.score;
  const homeScore = score?.fullTime?.home ?? score?.regularTime?.home;
  const awayScore = score?.fullTime?.away ?? score?.regularTime?.away;

  if (homeScore === null || homeScore === undefined ||
      awayScore === null || awayScore === undefined) {
    return false;
  }

  // Update the match result
  db.updateMatchResult(ourMatch.id, homeScore, awayScore);

  // Recalculate points for all predictions on this match
  const updatedMatch = db.getMatch(ourMatch.id);
  recalculateMatchPoints(db, updatedMatch);

  console.log(`[Live Scores] Updated: ${homeCode} ${homeScore}-${awayScore} ${awayCode} (Match #${ourMatch.match_number})`);
  return true;
}

module.exports = {
  startLiveScoreUpdater,
  stopLiveScoreUpdater,
  fetchAndUpdateScores
};
