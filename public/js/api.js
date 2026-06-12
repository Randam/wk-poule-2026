/**
 * API Client Module – WK 2026 Poule
 * 
 * Centralised HTTP client for all communication with the backend REST API.
 * Handles JWT token persistence, request/response processing, and provides
 * convenience methods for every API endpoint used by the application.
 * 
 * Usage:
 *   import API from './api.js';
 *   const matches = await API.getMatches({ stage: 'group' });
 */

const API = {
  /** @type {string|null} Current JWT bearer token */
  token: localStorage.getItem('wk_token'),

  /* ------------------------------------------------------------------ */
  /*  Token helpers                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Persist a new JWT token in memory and localStorage.
   * @param {string} token – JWT returned by /join or /admin/login
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('wk_token', token);
  },

  /**
   * Remove the JWT token from memory and localStorage (logout).
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('wk_token');
  },

  /* ------------------------------------------------------------------ */
  /*  Generic request helper                                             */
  /* ------------------------------------------------------------------ */

  /**
   * Execute an authenticated JSON request against the backend API.
   *
   * @param   {string}       method – HTTP verb (GET, POST, PUT, DELETE …)
   * @param   {string}       url    – Path relative to /api (e.g. '/matches')
   * @param   {Object|null}  body   – Optional JSON body for POST/PUT
   * @returns {Promise<Object>}      Parsed JSON response
   * @throws  {Error}                When the response status is not 2xx
   */
  async request(method, url, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`/api${url}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || 'Er is iets misgegaan');
    }

    return data;
  },

  /* ------------------------------------------------------------------ */
  /*  Auth endpoints                                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Join the poule as a new participant.
   *
   * @param   {string} name       – Display name
   * @param   {string} inviteCode – Shared invite code
   * @returns {Promise<Object>}    { token, user }
   */
  async join(name, inviteCode) {
    const data = await this.request('POST', '/join', { name, inviteCode });
    this.setToken(data.token);
    return data;
  },

  /**
   * Authenticate as the poule administrator.
   *
   * @param   {string} adminCode – Secret admin code
   * @returns {Promise<Object>}   { token, user }
   */
  async adminLogin(adminCode) {
    const data = await this.request('POST', '/admin/login', { adminCode });
    this.setToken(data.token);
    return data;
  },

  /**
   * Retrieve the currently authenticated user's profile.
   *
   * @returns {Promise<Object>} User object
   */
  async getMe() {
    return this.request('GET', '/me');
  },

  /* ------------------------------------------------------------------ */
  /*  Match endpoints                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Fetch matches, optionally filtered by stage and/or group.
   *
   * @param   {Object}  params
   * @param   {string}  [params.stage] – e.g. 'group', 'round_of_16'
   * @param   {string}  [params.group] – e.g. 'A', 'B'
   * @returns {Promise<Array>}          Array of match objects
   */
  async getMatches(params = {}) {
    const query = new URLSearchParams();
    if (params.stage) query.set('stage', params.stage);
    if (params.group) query.set('group', params.group);
    const qs = query.toString();
    return this.request('GET', `/matches${qs ? '?' + qs : ''}`);
  },

  /* ------------------------------------------------------------------ */
  /*  Prediction endpoints                                               */
  /* ------------------------------------------------------------------ */

  /**
   * Save a single match prediction (auto-save from match card).
   *
   * @param   {number} matchId   – Match ID
   * @param   {number} homeScore – Predicted home score
   * @param   {number} awayScore – Predicted away score
   * @returns {Promise<Object>}   Saved prediction
   */
  async savePrediction(matchId, homeScore, awayScore) {
    return this.request('PUT', `/predictions/${matchId}`, { homeScore, awayScore });
  },

  /**
   * Bulk-save multiple predictions at once.
   *
   * @param   {Array<{matchId: number, homeScore: number, awayScore: number}>} predictions
   * @returns {Promise<Object>} Result summary
   */
  async savePredictions(predictions) {
    return this.request('POST', '/predictions', { predictions });
  },

  /* ------------------------------------------------------------------ */
  /*  Standings endpoint                                                 */
  /* ------------------------------------------------------------------ */

  /**
   * Fetch the current poule standings / leaderboard.
   *
   * @returns {Promise<Array>} Sorted array of { user, totalPoints, … }
   */
  async getStandings() {
    return this.request('GET', '/standings');
  },

  /* ------------------------------------------------------------------ */
  /*  Admin endpoints                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Record the final result of a match (admin only).
   *
   * @param   {number} matchId   – Match ID
   * @param   {number} homeScore – Actual home score
   * @param   {number} awayScore – Actual away score
   * @returns {Promise<Object>}
   */
  async setMatchResult(matchId, homeScore, awayScore) {
    return this.request('PUT', `/admin/matches/${matchId}/result`, { homeScore, awayScore });
  },

  /**
   * Assign teams to a knockout-stage match (admin only).
   *
   * @param   {number} matchId    – Match ID
   * @param   {number} homeTeamId – Home team ID
   * @param   {number} awayTeamId – Away team ID
   * @returns {Promise<Object>}
   */
  async setMatchTeams(matchId, homeTeamId, awayTeamId) {
    return this.request('PUT', `/admin/matches/${matchId}/teams`, { homeTeamId, awayTeamId });
  },

  /**
   * Trigger a full recalculation of all prediction scores (admin only).
   *
   * @returns {Promise<Object>} Recalculation summary
   */
  async recalculate() {
    return this.request('POST', '/admin/recalculate');
  }
};

export default API;
