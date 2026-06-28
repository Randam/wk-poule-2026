/**
 * update_knockout_teams.js
 * 
 * Haalt de teamkoppels voor knockout-rondes op via football-data.org
 * en vult deze in in de database (op basis van datumvolgorde).
 * 
 * Gebruik: node update_knockout_teams.js
 * 
 * Voer dit script uit nadat de poulefase is afgesloten en de
 * tegenstanders voor de volgende ronde bekend zijn.
 */

require('dotenv').config();
const apiKey = process.env.FOOTBALL_API_KEY;
const db = require('./database');

const STAGE_MAP = {
  'LAST_32': 'round_of_32',
  'LAST_16': 'round_of_16',
  'QUARTER_FINALS': 'quarterfinal',
  'SEMI_FINALS': 'semifinal',
  'THIRD_PLACE': 'third_place',
  'FINAL': 'final'
};

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
  "Côte d'Ivoire": 'CIV',
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

async function run() {
  await db.initDb();

  if (!apiKey) {
    console.error('Geen FOOTBALL_API_KEY gevonden in .env');
    process.exit(1);
  }

  console.log('Ophalen van knockout-wedstrijden van football-data.org...');
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': apiKey }
  });

  if (!res.ok) {
    throw new Error(`API fout: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const allTeams = db.getAllTeams();
  
  let totalUpdated = 0;

  for (const [apiStage, dbStage] of Object.entries(STAGE_MAP)) {
    // Get API matches for this stage that have actual teams (not TBD)
    const apiStageMatches = data.matches
      .filter(m => m.stage === apiStage && m.homeTeam?.name && m.awayTeam?.name)
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    if (apiStageMatches.length === 0) {
      console.log(`[${apiStage}] Nog geen teams bekend, overgeslagen.`);
      continue;
    }

    // Get our DB matches for this stage, sorted by date
    const ourStageMatches = db.getAllMatches(dbStage)
      .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

    console.log(`\n[${apiStage}] ${apiStageMatches.length} wedstrijden met teams gevonden.`);

    for (let i = 0; i < apiStageMatches.length; i++) {
      const apiMatch = apiStageMatches[i];
      const ourMatch = ourStageMatches[i];

      if (!ourMatch) {
        console.log(`  Geen overeenkomende database-wedstrijd voor positie ${i + 1}`);
        continue;
      }

      const homeCode = TEAM_NAME_MAP[apiMatch.homeTeam?.name];
      const awayCode = TEAM_NAME_MAP[apiMatch.awayTeam?.name];

      if (!homeCode || !awayCode) {
        console.log(`  Onbekend team: "${apiMatch.homeTeam?.name}" of "${apiMatch.awayTeam?.name}"`);
        continue;
      }

      const homeTeam = allTeams.find(t => t.code === homeCode);
      const awayTeam = allTeams.find(t => t.code === awayCode);

      if (!homeTeam || !awayTeam) {
        console.log(`  Team niet gevonden in database: ${homeCode} of ${awayCode}`);
        continue;
      }

      // Skip if already correctly set
      if (ourMatch.home_team_id === homeTeam.id && ourMatch.away_team_id === awayTeam.id) {
        console.log(`  Wedstrijd #${ourMatch.match_number}: ${homeTeam.name_nl} vs ${awayTeam.name_nl} ✓ (al ingevuld)`);
        continue;
      }

      console.log(`  Wedstrijd #${ourMatch.match_number} bijwerken: ${homeTeam.name_nl} vs ${awayTeam.name_nl}`);
      db.updateMatchTeams(ourMatch.id, homeTeam.id, awayTeam.id);
      totalUpdated++;
    }
  }

  console.log(`\nKlaar! ${totalUpdated} wedstrijd(en) bijgewerkt met de juiste teams.`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
