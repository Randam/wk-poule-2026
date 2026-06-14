/**
 * Scoring module for WK 2026 Poule
 * 
 * Points per match (max 5):
 * - Correct result (win/draw/loss): +2
 * - Correct home goals: +1
 * - Correct away goals: +1
 * - Correct goal difference: +1
 */

/**
 * Calculate points for a single prediction.
 * @param {number} predHome - Predicted home score
 * @param {number} predAway - Predicted away score
 * @param {number} actualHome - Actual home score
 * @param {number} actualAway - Actual away score
 * @returns {number} Points earned (0-5)
 */
function calculatePoints(predHome, predAway, actualHome, actualAway) {
  if (actualHome === null || actualHome === undefined ||
      actualAway === null || actualAway === undefined) {
    return 0;
  }

  let points = 0;

  // Correct result (win/draw/loss): +2
  const predResult = Math.sign(predHome - predAway);
  const actualResult = Math.sign(actualHome - actualAway);
  if (predResult === actualResult) points += 2;

  // Correct home goals: +1
  if (predHome === actualHome) points += 1;

  // Correct away goals: +1
  if (predAway === actualAway) points += 1;

  // Correct goal difference: +1
  if ((predHome - predAway) === (actualHome - actualAway)) points += 1;

  return points;
}

/**
 * Get point multiplier for a given stage.
 * @param {string} stage - Stage key
 * @returns {number} Multiplier (1-6)
 */
function getStageMultiplier(stage) {
  const multipliers = {
    'group': 1,
    'round_of_32': 2,
    'round_of_16': 3,
    'quarterfinal': 4,
    'quarter_final': 4,
    'semifinal': 5,
    'semi_final': 5,
    'third_place': 6,
    'final': 6
  };
  return multipliers[stage] || 1;
}

/**
 * Recalculate points for ALL predictions on finished matches.
 * @param {object} db - Database module
 */
function recalculateAllPoints(db) {
  const finishedMatches = db.getAllMatches().filter(m => m.status === 'finished');

  for (const match of finishedMatches) {
    recalculateMatchPoints(db, match);
  }
}

/**
 * Recalculate points for all predictions on a single match.
 * @param {object} db - Database module
 * @param {object} match - Match object with home_score and away_score
 */
function recalculateMatchPoints(db, match) {
  if (match.home_score === null || match.away_score === null) return;

  const predictions = db.getPredictionsForMatch(match.id);
  const multiplier = getStageMultiplier(match.stage);

  for (const pred of predictions) {
    const points = calculatePoints(
      pred.home_score,
      pred.away_score,
      match.home_score,
      match.away_score
    );
    db.updatePredictionPoints(pred.id, points * multiplier);
  }
}

module.exports = {
  calculatePoints,
  recalculateAllPoints,
  recalculateMatchPoints,
  getStageMultiplier
};

