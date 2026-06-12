/**
 * WK 2026 Seed Data
 * All 48 teams and 104 matches (72 group stage + 32 knockout)
 */

const teams = [
  // Group A
  { name: 'Mexico', nameNl: 'Mexico', code: 'MEX', flagCode: 'mx', group: 'A' },
  { name: 'South Africa', nameNl: 'Zuid-Afrika', code: 'RSA', flagCode: 'za', group: 'A' },
  { name: 'South Korea', nameNl: 'Zuid-Korea', code: 'KOR', flagCode: 'kr', group: 'A' },
  { name: 'Czechia', nameNl: 'Tsjechië', code: 'CZE', flagCode: 'cz', group: 'A' },

  // Group B
  { name: 'Canada', nameNl: 'Canada', code: 'CAN', flagCode: 'ca', group: 'B' },
  { name: 'Bosnia and Herzegovina', nameNl: 'Bosnië en Herzegovina', code: 'BIH', flagCode: 'ba', group: 'B' },
  { name: 'Qatar', nameNl: 'Qatar', code: 'QAT', flagCode: 'qa', group: 'B' },
  { name: 'Switzerland', nameNl: 'Zwitserland', code: 'SUI', flagCode: 'ch', group: 'B' },

  // Group C
  { name: 'Brazil', nameNl: 'Brazilië', code: 'BRA', flagCode: 'br', group: 'C' },
  { name: 'Morocco', nameNl: 'Marokko', code: 'MAR', flagCode: 'ma', group: 'C' },
  { name: 'Haiti', nameNl: 'Haïti', code: 'HAI', flagCode: 'ht', group: 'C' },
  { name: 'Scotland', nameNl: 'Schotland', code: 'SCO', flagCode: 'gb-sct', group: 'C' },

  // Group D
  { name: 'United States', nameNl: 'Verenigde Staten', code: 'USA', flagCode: 'us', group: 'D' },
  { name: 'Paraguay', nameNl: 'Paraguay', code: 'PAR', flagCode: 'py', group: 'D' },
  { name: 'Australia', nameNl: 'Australië', code: 'AUS', flagCode: 'au', group: 'D' },
  { name: 'Türkiye', nameNl: 'Turkije', code: 'TUR', flagCode: 'tr', group: 'D' },

  // Group E
  { name: 'Germany', nameNl: 'Duitsland', code: 'GER', flagCode: 'de', group: 'E' },
  { name: 'Curaçao', nameNl: 'Curaçao', code: 'CUW', flagCode: 'cw', group: 'E' },
  { name: 'Ivory Coast', nameNl: 'Ivoorkust', code: 'CIV', flagCode: 'ci', group: 'E' },
  { name: 'Ecuador', nameNl: 'Ecuador', code: 'ECU', flagCode: 'ec', group: 'E' },

  // Group F
  { name: 'Netherlands', nameNl: 'Nederland', code: 'NED', flagCode: 'nl', group: 'F' },
  { name: 'Japan', nameNl: 'Japan', code: 'JPN', flagCode: 'jp', group: 'F' },
  { name: 'Sweden', nameNl: 'Zweden', code: 'SWE', flagCode: 'se', group: 'F' },
  { name: 'Tunisia', nameNl: 'Tunesië', code: 'TUN', flagCode: 'tn', group: 'F' },

  // Group G
  { name: 'Belgium', nameNl: 'België', code: 'BEL', flagCode: 'be', group: 'G' },
  { name: 'Egypt', nameNl: 'Egypte', code: 'EGY', flagCode: 'eg', group: 'G' },
  { name: 'Iran', nameNl: 'Iran', code: 'IRN', flagCode: 'ir', group: 'G' },
  { name: 'New Zealand', nameNl: 'Nieuw-Zeeland', code: 'NZL', flagCode: 'nz', group: 'G' },

  // Group H
  { name: 'Spain', nameNl: 'Spanje', code: 'ESP', flagCode: 'es', group: 'H' },
  { name: 'Cape Verde', nameNl: 'Kaapverdië', code: 'CPV', flagCode: 'cv', group: 'H' },
  { name: 'Saudi Arabia', nameNl: 'Saoedi-Arabië', code: 'KSA', flagCode: 'sa', group: 'H' },
  { name: 'Uruguay', nameNl: 'Uruguay', code: 'URU', flagCode: 'uy', group: 'H' },

  // Group I
  { name: 'France', nameNl: 'Frankrijk', code: 'FRA', flagCode: 'fr', group: 'I' },
  { name: 'Senegal', nameNl: 'Senegal', code: 'SEN', flagCode: 'sn', group: 'I' },
  { name: 'Iraq', nameNl: 'Irak', code: 'IRQ', flagCode: 'iq', group: 'I' },
  { name: 'Norway', nameNl: 'Noorwegen', code: 'NOR', flagCode: 'no', group: 'I' },

  // Group J
  { name: 'Argentina', nameNl: 'Argentinië', code: 'ARG', flagCode: 'ar', group: 'J' },
  { name: 'Algeria', nameNl: 'Algerije', code: 'ALG', flagCode: 'dz', group: 'J' },
  { name: 'Austria', nameNl: 'Oostenrijk', code: 'AUT', flagCode: 'at', group: 'J' },
  { name: 'Jordan', nameNl: 'Jordanië', code: 'JOR', flagCode: 'jo', group: 'J' },

  // Group K
  { name: 'Portugal', nameNl: 'Portugal', code: 'POR', flagCode: 'pt', group: 'K' },
  { name: 'DR Congo', nameNl: 'DR Congo', code: 'COD', flagCode: 'cd', group: 'K' },
  { name: 'Uzbekistan', nameNl: 'Oezbekistan', code: 'UZB', flagCode: 'uz', group: 'K' },
  { name: 'Colombia', nameNl: 'Colombia', code: 'COL', flagCode: 'co', group: 'K' },

  // Group L
  { name: 'England', nameNl: 'Engeland', code: 'ENG', flagCode: 'gb-eng', group: 'L' },
  { name: 'Croatia', nameNl: 'Kroatië', code: 'CRO', flagCode: 'hr', group: 'L' },
  { name: 'Ghana', nameNl: 'Ghana', code: 'GHA', flagCode: 'gh', group: 'L' },
  { name: 'Panama', nameNl: 'Panama', code: 'PAN', flagCode: 'pa', group: 'L' },
];

const matches = [
  // =====================================================
  // GROUP STAGE — MATCHDAY 1 (June 11–17)
  // =====================================================

  // June 11
  { matchNumber: 1,  homeTeamCode: 'MEX', awayTeamCode: 'RSA', stage: 'group', groupLetter: 'A', matchDate: '2026-06-11T22:00:00Z', venue: 'Estadio Azteca, Mexico City', description: null },
  { matchNumber: 2,  homeTeamCode: 'KOR', awayTeamCode: 'CZE', stage: 'group', groupLetter: 'A', matchDate: '2026-06-12T01:00:00Z', venue: 'TBD', description: null },

  // June 12
  { matchNumber: 3,  homeTeamCode: 'CAN', awayTeamCode: 'BIH', stage: 'group', groupLetter: 'B', matchDate: '2026-06-12T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 4,  homeTeamCode: 'USA', awayTeamCode: 'PAR', stage: 'group', groupLetter: 'D', matchDate: '2026-06-13T01:00:00Z', venue: 'TBD', description: null },

  // June 13
  { matchNumber: 5,  homeTeamCode: 'HAI', awayTeamCode: 'SCO', stage: 'group', groupLetter: 'C', matchDate: '2026-06-13T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 6,  homeTeamCode: 'BRA', awayTeamCode: 'MAR', stage: 'group', groupLetter: 'C', matchDate: '2026-06-13T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 7,  homeTeamCode: 'QAT', awayTeamCode: 'SUI', stage: 'group', groupLetter: 'B', matchDate: '2026-06-13T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 8,  homeTeamCode: 'AUS', awayTeamCode: 'TUR', stage: 'group', groupLetter: 'D', matchDate: '2026-06-14T01:00:00Z', venue: 'TBD', description: null },

  // June 14
  { matchNumber: 9,  homeTeamCode: 'CIV', awayTeamCode: 'ECU', stage: 'group', groupLetter: 'E', matchDate: '2026-06-14T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 10, homeTeamCode: 'SWE', awayTeamCode: 'TUN', stage: 'group', groupLetter: 'F', matchDate: '2026-06-14T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 11, homeTeamCode: 'NED', awayTeamCode: 'JPN', stage: 'group', groupLetter: 'F', matchDate: '2026-06-14T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 12, homeTeamCode: 'GER', awayTeamCode: 'CUW', stage: 'group', groupLetter: 'E', matchDate: '2026-06-14T22:00:00Z', venue: 'TBD', description: null },

  // June 15
  { matchNumber: 13, homeTeamCode: 'IRN', awayTeamCode: 'NZL', stage: 'group', groupLetter: 'G', matchDate: '2026-06-15T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 14, homeTeamCode: 'BEL', awayTeamCode: 'EGY', stage: 'group', groupLetter: 'G', matchDate: '2026-06-15T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 15, homeTeamCode: 'KSA', awayTeamCode: 'URU', stage: 'group', groupLetter: 'H', matchDate: '2026-06-15T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 16, homeTeamCode: 'ESP', awayTeamCode: 'CPV', stage: 'group', groupLetter: 'H', matchDate: '2026-06-15T22:00:00Z', venue: 'TBD', description: null },

  // June 16
  { matchNumber: 17, homeTeamCode: 'IRQ', awayTeamCode: 'NOR', stage: 'group', groupLetter: 'I', matchDate: '2026-06-16T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 18, homeTeamCode: 'FRA', awayTeamCode: 'SEN', stage: 'group', groupLetter: 'I', matchDate: '2026-06-16T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 19, homeTeamCode: 'AUT', awayTeamCode: 'JOR', stage: 'group', groupLetter: 'J', matchDate: '2026-06-16T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 20, homeTeamCode: 'ARG', awayTeamCode: 'ALG', stage: 'group', groupLetter: 'J', matchDate: '2026-06-16T22:00:00Z', venue: 'TBD', description: null },

  // June 17
  { matchNumber: 21, homeTeamCode: 'UZB', awayTeamCode: 'COL', stage: 'group', groupLetter: 'K', matchDate: '2026-06-17T16:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 22, homeTeamCode: 'POR', awayTeamCode: 'COD', stage: 'group', groupLetter: 'K', matchDate: '2026-06-17T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 23, homeTeamCode: 'GHA', awayTeamCode: 'PAN', stage: 'group', groupLetter: 'L', matchDate: '2026-06-17T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 24, homeTeamCode: 'ENG', awayTeamCode: 'CRO', stage: 'group', groupLetter: 'L', matchDate: '2026-06-17T22:00:00Z', venue: 'TBD', description: null },

  // =====================================================
  // GROUP STAGE — MATCHDAY 2 (June 18–23)
  // =====================================================

  // June 18
  { matchNumber: 25, homeTeamCode: 'MEX', awayTeamCode: 'KOR', stage: 'group', groupLetter: 'A', matchDate: '2026-06-18T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 26, homeTeamCode: 'CZE', awayTeamCode: 'RSA', stage: 'group', groupLetter: 'A', matchDate: '2026-06-18T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 27, homeTeamCode: 'CAN', awayTeamCode: 'QAT', stage: 'group', groupLetter: 'B', matchDate: '2026-06-18T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 28, homeTeamCode: 'BIH', awayTeamCode: 'SUI', stage: 'group', groupLetter: 'B', matchDate: '2026-06-18T22:00:00Z', venue: 'TBD', description: null },

  // June 19
  { matchNumber: 29, homeTeamCode: 'BRA', awayTeamCode: 'HAI', stage: 'group', groupLetter: 'C', matchDate: '2026-06-19T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 30, homeTeamCode: 'SCO', awayTeamCode: 'MAR', stage: 'group', groupLetter: 'C', matchDate: '2026-06-19T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 31, homeTeamCode: 'USA', awayTeamCode: 'AUS', stage: 'group', groupLetter: 'D', matchDate: '2026-06-19T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 32, homeTeamCode: 'TUR', awayTeamCode: 'PAR', stage: 'group', groupLetter: 'D', matchDate: '2026-06-19T22:00:00Z', venue: 'TBD', description: null },

  // June 20
  { matchNumber: 33, homeTeamCode: 'GER', awayTeamCode: 'CIV', stage: 'group', groupLetter: 'E', matchDate: '2026-06-20T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 34, homeTeamCode: 'ECU', awayTeamCode: 'CUW', stage: 'group', groupLetter: 'E', matchDate: '2026-06-20T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 35, homeTeamCode: 'NED', awayTeamCode: 'SWE', stage: 'group', groupLetter: 'F', matchDate: '2026-06-20T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 36, homeTeamCode: 'TUN', awayTeamCode: 'JPN', stage: 'group', groupLetter: 'F', matchDate: '2026-06-20T22:00:00Z', venue: 'TBD', description: null },

  // June 21
  { matchNumber: 37, homeTeamCode: 'BEL', awayTeamCode: 'IRN', stage: 'group', groupLetter: 'G', matchDate: '2026-06-21T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 38, homeTeamCode: 'NZL', awayTeamCode: 'EGY', stage: 'group', groupLetter: 'G', matchDate: '2026-06-21T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 39, homeTeamCode: 'ESP', awayTeamCode: 'KSA', stage: 'group', groupLetter: 'H', matchDate: '2026-06-21T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 40, homeTeamCode: 'URU', awayTeamCode: 'CPV', stage: 'group', groupLetter: 'H', matchDate: '2026-06-21T22:00:00Z', venue: 'TBD', description: null },

  // June 22
  { matchNumber: 41, homeTeamCode: 'FRA', awayTeamCode: 'IRQ', stage: 'group', groupLetter: 'I', matchDate: '2026-06-22T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 42, homeTeamCode: 'NOR', awayTeamCode: 'SEN', stage: 'group', groupLetter: 'I', matchDate: '2026-06-22T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 43, homeTeamCode: 'ARG', awayTeamCode: 'AUT', stage: 'group', groupLetter: 'J', matchDate: '2026-06-22T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 44, homeTeamCode: 'JOR', awayTeamCode: 'ALG', stage: 'group', groupLetter: 'J', matchDate: '2026-06-22T22:00:00Z', venue: 'TBD', description: null },

  // June 23
  { matchNumber: 45, homeTeamCode: 'POR', awayTeamCode: 'UZB', stage: 'group', groupLetter: 'K', matchDate: '2026-06-23T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 46, homeTeamCode: 'COL', awayTeamCode: 'COD', stage: 'group', groupLetter: 'K', matchDate: '2026-06-23T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 47, homeTeamCode: 'ENG', awayTeamCode: 'GHA', stage: 'group', groupLetter: 'L', matchDate: '2026-06-23T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 48, homeTeamCode: 'PAN', awayTeamCode: 'CRO', stage: 'group', groupLetter: 'L', matchDate: '2026-06-23T22:00:00Z', venue: 'TBD', description: null },

  // =====================================================
  // GROUP STAGE — MATCHDAY 3 (June 24–27)
  // =====================================================

  // June 24
  { matchNumber: 49, homeTeamCode: 'CZE', awayTeamCode: 'MEX', stage: 'group', groupLetter: 'A', matchDate: '2026-06-24T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 50, homeTeamCode: 'RSA', awayTeamCode: 'KOR', stage: 'group', groupLetter: 'A', matchDate: '2026-06-24T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 51, homeTeamCode: 'SUI', awayTeamCode: 'CAN', stage: 'group', groupLetter: 'B', matchDate: '2026-06-24T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 52, homeTeamCode: 'QAT', awayTeamCode: 'BIH', stage: 'group', groupLetter: 'B', matchDate: '2026-06-24T22:00:00Z', venue: 'TBD', description: null },

  // June 25
  { matchNumber: 53, homeTeamCode: 'SCO', awayTeamCode: 'BRA', stage: 'group', groupLetter: 'C', matchDate: '2026-06-25T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 54, homeTeamCode: 'MAR', awayTeamCode: 'HAI', stage: 'group', groupLetter: 'C', matchDate: '2026-06-25T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 55, homeTeamCode: 'TUR', awayTeamCode: 'USA', stage: 'group', groupLetter: 'D', matchDate: '2026-06-25T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 56, homeTeamCode: 'PAR', awayTeamCode: 'AUS', stage: 'group', groupLetter: 'D', matchDate: '2026-06-25T22:00:00Z', venue: 'TBD', description: null },

  // June 26
  { matchNumber: 57, homeTeamCode: 'ECU', awayTeamCode: 'GER', stage: 'group', groupLetter: 'E', matchDate: '2026-06-26T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 58, homeTeamCode: 'CUW', awayTeamCode: 'CIV', stage: 'group', groupLetter: 'E', matchDate: '2026-06-26T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 59, homeTeamCode: 'TUN', awayTeamCode: 'NED', stage: 'group', groupLetter: 'F', matchDate: '2026-06-26T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 60, homeTeamCode: 'JPN', awayTeamCode: 'SWE', stage: 'group', groupLetter: 'F', matchDate: '2026-06-26T22:00:00Z', venue: 'TBD', description: null },

  // June 27
  { matchNumber: 61, homeTeamCode: 'NZL', awayTeamCode: 'BEL', stage: 'group', groupLetter: 'G', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 62, homeTeamCode: 'EGY', awayTeamCode: 'IRN', stage: 'group', groupLetter: 'G', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 63, homeTeamCode: 'URU', awayTeamCode: 'ESP', stage: 'group', groupLetter: 'H', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 64, homeTeamCode: 'CPV', awayTeamCode: 'KSA', stage: 'group', groupLetter: 'H', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 65, homeTeamCode: 'NOR', awayTeamCode: 'FRA', stage: 'group', groupLetter: 'I', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 66, homeTeamCode: 'SEN', awayTeamCode: 'IRQ', stage: 'group', groupLetter: 'I', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 67, homeTeamCode: 'JOR', awayTeamCode: 'ARG', stage: 'group', groupLetter: 'J', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 68, homeTeamCode: 'ALG', awayTeamCode: 'AUT', stage: 'group', groupLetter: 'J', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 69, homeTeamCode: 'COL', awayTeamCode: 'POR', stage: 'group', groupLetter: 'K', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 70, homeTeamCode: 'COD', awayTeamCode: 'UZB', stage: 'group', groupLetter: 'K', matchDate: '2026-06-27T19:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 71, homeTeamCode: 'PAN', awayTeamCode: 'ENG', stage: 'group', groupLetter: 'L', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },
  { matchNumber: 72, homeTeamCode: 'CRO', awayTeamCode: 'GHA', stage: 'group', groupLetter: 'L', matchDate: '2026-06-27T22:00:00Z', venue: 'TBD', description: null },

  // =====================================================
  // KNOCKOUT STAGE — ROUND OF 32 (June 28 – July 3)
  // =====================================================
  { matchNumber: 73,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-28T16:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 1' },
  { matchNumber: 74,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-28T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 2' },
  { matchNumber: 75,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-28T22:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 3' },
  { matchNumber: 76,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-29T16:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 4' },
  { matchNumber: 77,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-29T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 5' },
  { matchNumber: 78,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-29T22:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 6' },
  { matchNumber: 79,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-30T16:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 7' },
  { matchNumber: 80,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-06-30T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 8' },
  { matchNumber: 81,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-01T16:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 9' },
  { matchNumber: 82,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-01T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 10' },
  { matchNumber: 83,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-01T22:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 11' },
  { matchNumber: 84,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-02T16:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 12' },
  { matchNumber: 85,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-02T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 13' },
  { matchNumber: 86,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-02T22:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 14' },
  { matchNumber: 87,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-03T19:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 15' },
  { matchNumber: 88,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_32', groupLetter: null, matchDate: '2026-07-03T22:00:00Z', venue: 'TBD', description: 'Ronde van 32 - Wedstrijd 16' },

  // =====================================================
  // KNOCKOUT STAGE — ROUND OF 16 (July 4–7)
  // =====================================================
  { matchNumber: 89,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-04T19:00:00Z', venue: 'TBD', description: 'Achtste Finale 1' },
  { matchNumber: 90,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-04T22:00:00Z', venue: 'TBD', description: 'Achtste Finale 2' },
  { matchNumber: 91,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-05T19:00:00Z', venue: 'TBD', description: 'Achtste Finale 3' },
  { matchNumber: 92,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-05T22:00:00Z', venue: 'TBD', description: 'Achtste Finale 4' },
  { matchNumber: 93,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-06T19:00:00Z', venue: 'TBD', description: 'Achtste Finale 5' },
  { matchNumber: 94,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-06T22:00:00Z', venue: 'TBD', description: 'Achtste Finale 6' },
  { matchNumber: 95,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-07T19:00:00Z', venue: 'TBD', description: 'Achtste Finale 7' },
  { matchNumber: 96,  homeTeamCode: null, awayTeamCode: null, stage: 'round_of_16', groupLetter: null, matchDate: '2026-07-07T22:00:00Z', venue: 'TBD', description: 'Achtste Finale 8' },

  // =====================================================
  // KNOCKOUT STAGE — QUARTERFINALS (July 9–11)
  // =====================================================
  { matchNumber: 97,  homeTeamCode: null, awayTeamCode: null, stage: 'quarterfinal', groupLetter: null, matchDate: '2026-07-09T22:00:00Z', venue: 'TBD', description: 'Kwartfinale 1' },
  { matchNumber: 98,  homeTeamCode: null, awayTeamCode: null, stage: 'quarterfinal', groupLetter: null, matchDate: '2026-07-10T19:00:00Z', venue: 'TBD', description: 'Kwartfinale 2' },
  { matchNumber: 99,  homeTeamCode: null, awayTeamCode: null, stage: 'quarterfinal', groupLetter: null, matchDate: '2026-07-10T22:00:00Z', venue: 'TBD', description: 'Kwartfinale 3' },
  { matchNumber: 100, homeTeamCode: null, awayTeamCode: null, stage: 'quarterfinal', groupLetter: null, matchDate: '2026-07-11T22:00:00Z', venue: 'TBD', description: 'Kwartfinale 4' },

  // =====================================================
  // KNOCKOUT STAGE — SEMIFINALS (July 14–15)
  // =====================================================
  { matchNumber: 101, homeTeamCode: null, awayTeamCode: null, stage: 'semifinal', groupLetter: null, matchDate: '2026-07-14T22:00:00Z', venue: 'TBD', description: 'Halve Finale 1' },
  { matchNumber: 102, homeTeamCode: null, awayTeamCode: null, stage: 'semifinal', groupLetter: null, matchDate: '2026-07-15T22:00:00Z', venue: 'TBD', description: 'Halve Finale 2' },

  // =====================================================
  // KNOCKOUT STAGE — THIRD PLACE (July 18)
  // =====================================================
  { matchNumber: 103, homeTeamCode: null, awayTeamCode: null, stage: 'third_place', groupLetter: null, matchDate: '2026-07-18T20:00:00Z', venue: 'TBD', description: 'Troostfinale' },

  // =====================================================
  // KNOCKOUT STAGE — FINAL (July 19)
  // =====================================================
  { matchNumber: 104, homeTeamCode: null, awayTeamCode: null, stage: 'final', groupLetter: null, matchDate: '2026-07-19T20:00:00Z', venue: 'TBD', description: 'Finale' },
];

module.exports = { teams, matches };
