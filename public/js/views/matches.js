import API from '../api.js';
import { createMatchCard } from '../components/match-card.js';

let refreshInterval = null;

export async function renderMatches() {
  const content = document.getElementById('app-content');
  const header = document.getElementById('app-header');
  
  header.innerHTML = `
    <div class="header-title">⚽ WK 2026 Poule</div>
    <div class="header-subtitle">Voorspel de uitslagen</div>
  `;
  
  // State
  let currentStage = 'group';
  let currentGroup = null; // null = all
  
  const stages = [
    { id: 'group', label: 'Groepsfase' },
    { id: 'round_of_32', label: 'Ronde van 32' },
    { id: 'round_of_16', label: 'Achtste Finale' },
    { id: 'quarterfinal', label: 'Kwartfinale' },
    { id: 'semifinal', label: 'Halve Finale' },
    { id: 'final', label: 'Finale' },
  ];
  
  const groups = ['Alle', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  
  content.innerHTML = `
    <div class="stage-tabs" id="stage-tabs"></div>
    <div class="group-tabs" id="group-tabs"></div>
    <div class="stats-bar" id="stats-bar"></div>
    <div id="matches-list"></div>
  `;
  
  // Render stage tabs
  function renderStageTabs() {
    document.getElementById('stage-tabs').innerHTML = stages.map(s => 
      `<button class="stage-tab ${s.id === currentStage ? 'active' : ''}" data-stage="${s.id}">${s.label}</button>`
    ).join('');
    
    document.querySelectorAll('.stage-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentStage = btn.dataset.stage;
        currentGroup = null;
        renderStageTabs();
        renderGroupTabs();
        loadMatches();
      });
    });
  }
  
  // Render group filter (only for group stage)
  function renderGroupTabs() {
    const container = document.getElementById('group-tabs');
    if (currentStage !== 'group') {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    container.innerHTML = groups.map(g => {
      const isActive = (g === 'Alle' && !currentGroup) || g === currentGroup;
      return `<button class="group-tab ${isActive ? 'active' : ''}" data-group="${g}">${g}</button>`;
    }).join('');
    
    container.querySelectorAll('.group-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentGroup = btn.dataset.group === 'Alle' ? null : btn.dataset.group;
        renderGroupTabs();
        loadMatches();
      });
    });
  }
  
  // Load and render matches
  async function loadMatches() {
    const list = document.getElementById('matches-list');
    list.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Wedstrijden laden...</p></div>';
    
    try {
      const params = { stage: currentStage };
      if (currentGroup) params.group = currentGroup;
      const data = await API.getMatches(params);
      const matches = data.matches || [];
      
      if (matches.length === 0) {
        list.innerHTML = '<div class="loading-container"><p>Geen wedstrijden gevonden</p></div>';
        return;
      }
      
      // Sort matches chronologically
      matches.sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
      
      // Update stats
      const predicted = matches.filter(m => m.pred_home_score !== null).length;
      document.getElementById('stats-bar').innerHTML = `
        <div class="stat-item"><span class="stat-value">${predicted}/${matches.length}</span> voorspeld</div>
      `;
      
      // Group matches by date
      const grouped = {};
      matches.forEach(m => {
        const dateKey = new Date(m.match_date).toLocaleDateString('nl-NL', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long',
          timeZone: 'Europe/Amsterdam'
        });
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(m);
      });
      
      list.innerHTML = '';
      
      let cardIndex = 0;
      for (const [date, dateMatches] of Object.entries(grouped)) {
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = date;
        list.appendChild(dateHeader);
        
        const cardsContainer = document.createElement('div');
        cardsContainer.style.padding = '0 16px';
        
        dateMatches.forEach(match => {
          const card = createMatchCard(match, {
            onSave: async (matchId, homeScore, awayScore) => {
              await API.savePrediction(matchId, homeScore, awayScore);
              // Show toast via global app
              if (window.__showToast) window.__showToast('Voorspelling opgeslagen!', 'success');
            }
          });
          card.style.animationDelay = `${cardIndex * 0.05}s`;
          cardsContainer.appendChild(card);
          cardIndex++;
        });
        
        list.appendChild(cardsContainer);
      }
      
      // Scroll to first upcoming (not finished) match or the last played match
      let targetMatch = matches.find(m => m.status !== 'finished');
      if (!targetMatch && matches.length > 0) {
        targetMatch = matches[matches.length - 1];
      }
      
      if (targetMatch) {
        const targetEl = list.querySelector(`.match-card[data-match-id="${targetMatch.id}"]`);
        if (targetEl) {
          setTimeout(() => targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 500);
        }
      }
      
    } catch (err) {
      list.innerHTML = `<div class="loading-container"><p>Fout bij laden: ${err.message}</p></div>`;
    }
  }

  // --- Auto-detect the active stage ---
  // Uses kick-off dates rather than match status, so it works correctly even
  // when the live-score updater hasn't processed all results yet.
  //
  // Logic:
  //   1. Find the first match (chronologically) whose kick-off is still in
  //      the future → that is the active stage.
  //   2. If every match is already in the past, use the stage of the most
  //      recently played match (so we land on the last active stage).
  async function detectActiveStage() {
    try {
      const data = await API.getMatches({});
      const allMatches = (data.matches || [])
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));

      if (allMatches.length === 0) return 'group';

      const now = new Date();

      // First match whose kick-off hasn't happened yet
      const nextMatch = allMatches.find(m => new Date(m.match_date) > now);
      if (nextMatch) return nextMatch.stage;

      // All matches are in the past → land on the last stage that has matches
      return allMatches[allMatches.length - 1].stage;
    } catch (e) {
      return 'group';
    }
  }


  // Detect active stage before first render
  currentStage = await detectActiveStage();

  renderStageTabs();
  renderGroupTabs();
  await loadMatches();
  
  // Auto-refresh every 60 seconds
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(loadMatches, 60000);
}

export function cleanupMatches() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
