/**
 * Bottom Navigation Component – WK 2026 Poule
 *
 * Renders a fixed bottom tab-bar with configurable tabs.
 * Supports an optional admin tab that is only shown when the current
 * user has administrator privileges.
 *
 * Usage:
 *   import { renderNav, onNavigate, setActiveTab } from './components/nav.js';
 *
 *   onNavigate((tab) => loadPage(tab));
 *   renderNav('matches', isAdmin);
 */

/** @type {Function|null} Callback invoked when the user taps a tab */
let navigateCallback = null;

/** @type {string} Currently active tab id */
let currentTab = 'matches';

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Register a callback that fires whenever the user switches tabs.
 *
 * @param {(tab: string) => void} callback – Receives the selected tab id
 */
export function onNavigate(callback) {
  navigateCallback = callback;
}

/**
 * Programmatically set the active tab without triggering navigation.
 * Useful when the page is changed via another mechanism (e.g. deep-link).
 *
 * @param {string} tab – Tab id to mark as active
 */
export function setActiveTab(tab) {
  currentTab = tab;
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
}

/**
 * Render the bottom navigation bar into the #bottom-nav container.
 *
 * @param {string}  activeTab – Initial active tab id (default: 'matches')
 * @param {boolean} isAdmin   – Whether to show the admin tab
 */
export function renderNav(activeTab = 'matches', isAdmin = false) {
  currentTab = activeTab;
  const nav = document.getElementById('bottom-nav');

  if (!nav) {
    console.warn('[nav] #bottom-nav element not found in the DOM.');
    return;
  }

  // Define visible tabs – admin tab is conditional
  const tabs = [
    { id: 'matches',   icon: '⚽', label: 'Wedstrijden' },
    { id: 'standings', icon: '🏆', label: 'Ranglijst' },
    { id: 'info',      icon: 'ℹ️', label: 'Info' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', icon: '⚙️', label: 'Beheer' });
  }

  // Render tab buttons
  nav.innerHTML = tabs.map(tab => `
    <button class="nav-tab ${tab.id === activeTab ? 'active' : ''}" data-tab="${tab.id}">
      <span class="nav-icon">${tab.icon}</span>
      <span class="nav-label">${tab.label}</span>
    </button>
  `).join('');

  // Attach click handlers
  nav.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      setActiveTab(tab);
      if (navigateCallback) navigateCallback(tab);
    });
  });
}
