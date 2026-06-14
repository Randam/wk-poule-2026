require('dotenv').config();
const apiKey = process.env.FOOTBALL_API_KEY;
const db = require('./database');

const STAGE_MAP = {
  'GROUP_STAGE': 'group',
  'LAST_32': 'round_of_32',
  'LAST_16': 'round_of_16',
  'QUARTER_FINALS': 'quarterfinal',
  'SEMI_FINALS': 'semifinal',
  'THIRD_PLACE': 'third_place',
  'FINAL': 'final'
};

const TEAM_NAME_MAP = {
  'Mexico': 'MEX', 'South Africa': 'RSA', 'Korea Republic': 'KOR', 'South Korea': 'KOR',
  'Czech Republic': 'CZE', 'Czechia': 'CZE', 'Canada': 'CAN', 'Bosnia-Herzegovina': 'BIH',
  'Bosnia and Herzegovina': 'BIH', 'Qatar': 'QAT', 'Switzerland': 'SUI', 'Brazil': 'BRA',
  'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO', 'United States': 'USA', 'USA': 'USA',
  'Paraguay': 'PAR', 'Australia': 'AUS', 'Turkey': 'TUR', 'Türkiye': 'TUR', 'Germany': 'GER',
  'Curaçao': 'CUW', 'Curacao': 'CUW', 'Côte d\'Ivoire': 'CIV', 'Ivory Coast': 'CIV',
  'Ecuador': 'ECU', 'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP',
  'Cape Verde': 'CPV', 'Cabo Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
  'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ', 'Norway': 'NOR', 'Argentina': 'ARG',
  'Algeria': 'ALG', 'Austria': 'AUT', 'Jordan': 'JOR', 'Portugal': 'POR', 'DR Congo': 'COD',
  'Congo DR': 'COD', 'Uzbekistan': 'UZB', 'Colombia': 'COL', 'England': 'ENG', 'Croatia': 'CRO',
  'Ghana': 'GHA', 'Panama': 'PAN'
};

async function run() {
  await db.initDb();
  
  if (!apiKey) {
    console.error('No FOOTBALL_API_KEY found in .env');
    return;
  }

  console.log('Fetching correct match dates from football-data.org...');
  const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
    headers: { 'X-Auth-Token': apiKey }
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const ourMatches = db.getAllMatches();
  console.log(`Fetched ${data.matches.length} matches from API. Updating database...`);

  let updatedCount = 0;

  for (const apiMatch of data.matches) {
    let matched = null;
    
    if (apiMatch.stage === 'GROUP_STAGE') {
      const homeCode = TEAM_NAME_MAP[apiMatch.homeTeam?.name];
      const awayCode = TEAM_NAME_MAP[apiMatch.awayTeam?.name];
      matched = ourMatches.find(m => m.home_team_code === homeCode && m.away_team_code === awayCode);
    } else {
      const dbStage = STAGE_MAP[apiMatch.stage];
      const stageMatches = ourMatches.filter(m => m.stage === dbStage);
      
      const apiStageMatches = data.matches
        .filter(m => m.stage === apiMatch.stage)
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
      
      const index = apiStageMatches.findIndex(m => m.id === apiMatch.id);
      if (index !== -1 && stageMatches[index]) {
        matched = stageMatches[index];
      }
    }

    if (matched) {
      const newDate = apiMatch.utcDate; // Format: 2026-06-11T19:00:00Z
      if (matched.match_date !== newDate) {
        db.updateMatchDate(matched.id, newDate);
        updatedCount++;
      }
    }
  }

  console.log(`Successfully updated kickoff dates for ${updatedCount} matches!`);
}

run().catch(console.error);
