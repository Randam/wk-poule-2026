/**
 * Match Card Component – WK 2026 Poule
 *
 * Renders an individual match prediction card. The card adapts its
 * appearance and behaviour based on match state:
 *
 *  • **Open**     – editable score inputs with auto-save (debounced)
 *  • **Locked**   – prediction is read-only once the match has started
 *  • **Finished** – shows final result and awarded points
 *  • **TBD**      – knockout placeholder when teams are not yet known
 *
 * Usage:
 *   import { createMatchCard } from './components/match-card.js';
 *
 *   const card = createMatchCard(match, {
 *     onSave: (matchId, home, away) => API.savePrediction(matchId, home, away),
 *   });
 *   container.appendChild(card);
 */

/* ------------------------------------------------------------------ */
/*  Main factory                                                       */
/* ------------------------------------------------------------------ */

/**
 * Creates a fully wired match card DOM element.
 *
 * @param   {Object}  match              – Match data object from the API
 * @param   {Object}  [options]
 * @param   {Function} [options.onSave]  – Async callback (matchId, homeScore, awayScore) => Promise
 * @param   {boolean}  [options.isAdmin] – Whether the current user is an admin
 * @returns {HTMLElement}                 The card element ready for insertion
 */
export function createMatchCard(match, options = {}) {
  const { onSave, isAdmin = false } = options;

  const card = document.createElement('div');
  card.className = 'match-card';
  card.dataset.matchId = match.id;

  /* ---- Determine card state ---- */
  const isLockedReal = new Date(match.match_date) <= new Date();
  const isLocked    = isLockedReal && !isAdmin;
  const isFinished  = match.status === 'finished';
  const hasPrediction = match.pred_home_score !== null && match.pred_away_score !== null;
  const hasTBD      = !match.home_team_code || !match.away_team_code;

  if (hasPrediction) card.classList.add('saved');
  if (isLocked)      card.classList.add('locked');
  if (isFinished)    card.classList.add('finished');

  /* ---- Format date/time in Dutch locale ---- */
  const matchDate = new Date(match.match_date);
  const dateStr   = matchDate.toLocaleDateString('nl-NL', {
    weekday: 'short',
    day:     'numeric',
    month:   'short',
  });
  const timeStr = matchDate.toLocaleTimeString('nl-NL', {
    hour:   '2-digit',
    minute: '2-digit',
  });

  /* ---- Stage / group label ---- */
  const stageInfo = match.group_letter
    ? `Groep ${match.group_letter}`
    : (match.description || getStageName(match.stage));

  /* ---- Flags ---- */
  const homeFlag = hasTBD
    ? '<div class="team-flag-placeholder"></div>'
    : `<img class="team-flag" src="https://flagcdn.com/w40/${match.home_team_flag}.png" alt="${match.home_team_code}" loading="lazy">`;
  const awayFlag = hasTBD
    ? '<div class="team-flag-placeholder"></div>'
    : `<img class="team-flag" src="https://flagcdn.com/w40/${match.away_team_flag}.png" alt="${match.away_team_code}" loading="lazy">`;

  /* ---- Team names ---- */
  const homeName = hasTBD
    ? '<span class="team-name team-tbd">NTB</span>'
    : `<span class="team-name">${match.home_team_name_nl}</span>`;
  const awayName = hasTBD
    ? '<span class="team-name team-tbd">NTB</span>'
    : `<span class="team-name">${match.away_team_name_nl}</span>`;

  /* ---- Scores: read-only display or editable inputs ---- */
  let scoresHTML;
  if (isLocked || hasTBD) {
    const hScore = hasPrediction ? match.pred_home_score : '--';
    const aScore = hasPrediction ? match.pred_away_score : '--';
    scoresHTML = `
      <div class="match-card__scores">
        <span class="score-display">${hScore}</span>
        <span class="score-separator">-</span>
        <span class="score-display">${aScore}</span>
      </div>
    `;
  } else {
    scoresHTML = `
      <div class="match-card__scores">
        <input type="number" class="score-input" inputmode="numeric" pattern="[0-9]*"
               min="0" max="20" placeholder="-" data-side="home"
               value="${match.pred_home_score !== null ? match.pred_home_score : ''}">
        <span class="score-separator">-</span>
        <input type="number" class="score-input" inputmode="numeric" pattern="[0-9]*"
               min="0" max="20" placeholder="-" data-side="away"
               value="${match.pred_away_score !== null ? match.pred_away_score : ''}">
      </div>
    `;
  }

  /* ---- Footer: result + earned points (only for finished matches) ---- */
  let footerHTML = '';
  if (isFinished && match.home_score !== null) {
    const points      = match.pred_points !== null ? match.pred_points : 0;
    const pointsClass = getPointsClass(points);
    footerHTML = `
      <div class="match-card__footer">
        <span class="match-card__result">Uitslag: <strong>${match.home_score} - ${match.away_score}</strong></span>
        <span class="points-badge ${pointsClass}">${points} pt${points === 5 ? ' ★' : ''}</span>
      </div>
    `;
  }

  /* ---- Lock indicator ---- */
  const lockIcon = isLockedReal ? '<span class="lock-icon" title="Vergrendeld voor deelnemers">🔒</span>' : '';

  /* ---- Saving animation (shown during auto-save) ---- */
  const savingHTML = `
    <div class="saving-indicator hidden" data-saving>
      <span class="saving-dot"></span>
      <span class="saving-dot"></span>
      <span class="saving-dot"></span> Opslaan...
    </div>
  `;

  /* ---- Assemble card markup ---- */
  card.innerHTML = `
    <div class="match-card__header">
      <span class="match-card__header-left">${stageInfo} · ${dateStr} · ${timeStr}</span>
      <span class="match-card__header-right">${lockIcon}${savingHTML}</span>
    </div>
    <div class="match-card__body">
      <div class="match-card__team match-card__team--home">
        ${homeName}
        ${homeFlag}
      </div>
      ${scoresHTML}
      <div class="match-card__team match-card__team--away">
        ${awayFlag}
        ${awayName}
      </div>
    </div>
    ${footerHTML}
  `;

  /* ---- Auto-save with debounce ---- */
  if (!isLocked && !hasTBD && onSave) {
    attachAutoSave(card, match.id, onSave);
  }

  return card;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Attach debounced auto-save behaviour to the score inputs inside a card.
 * Waits 1500 ms after the last input event before persisting.
 *
 * @param {HTMLElement} card    – The match card element
 * @param {number}      matchId – Match ID
 * @param {Function}    onSave  – Async save callback
 */
function attachAutoSave(card, matchId, onSave) {
  let debounceTimer = null;
  const inputs = card.querySelectorAll('.score-input');

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);

      const homeInput = card.querySelector('.score-input[data-side="home"]');
      const awayInput = card.querySelector('.score-input[data-side="away"]');
      const hVal = homeInput.value;
      const aVal = awayInput.value;

      // Only save when both fields have values
      if (hVal !== '' && aVal !== '') {
        const savingEl = card.querySelector('[data-saving]');
        savingEl.classList.remove('hidden');

        debounceTimer = setTimeout(async () => {
          try {
            await onSave(matchId, parseInt(hVal, 10), parseInt(aVal, 10));
            card.classList.add('saved');
            savingEl.classList.add('hidden');
          } catch (err) {
            savingEl.classList.add('hidden');
            // Error is expected to be handled by the parent via a toast
            // or global error handler – we intentionally do not swallow it.
            console.error(`[match-card] Save failed for match ${matchId}:`, err);
          }
        }, 1500);
      }
    });
  });
}

/**
 * Map a stage key to its Dutch display name.
 *
 * @param   {string} stage – Stage identifier from the database
 * @returns {string}        Human-readable Dutch stage name
 */
function getStageName(stage) {
  const names = {
    'group':         'Groepsfase',
    'round_of_32':   'Ronde van 32',
    'round_of_16':   'Achtste Finale',
    'quarter_final':  'Kwartfinale',
    'semi_final':     'Halve Finale',
    'third_place':    'Troostfinale',
    'final':          'Finale',
  };
  return names[stage] || stage;
}

/**
 * Return a CSS class reflecting the number of points earned.
 * Used to colour-code the points badge.
 *
 * @param   {number} points – Points awarded for a prediction
 * @returns {string}         CSS class name
 */
function getPointsClass(points) {
  if (points >= 5) return 'points-5';
  if (points >= 3) return 'points-3';
  if (points >= 1) return 'points-1';
  return 'points-0';
}
