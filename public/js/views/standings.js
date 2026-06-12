import API from '../api.js';

let refreshInterval = null;

export async function renderStandings() {
  const content = document.getElementById('app-content');
  const header = document.getElementById('app-header');
  
  header.innerHTML = `
    <div class="header-title">🏆 Ranglijst</div>
    <div class="header-subtitle">Wie staat er bovenaan?</div>
  `;
  
  content.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Ranglijst laden...</p></div>';
  
  try {
    const data = await API.getStandings();
    const standings = data.standings || [];
    
    if (standings.length === 0) {
      content.innerHTML = '<div class="loading-container"><p>Nog geen deelnemers</p></div>';
      return;
    }
    
    // Get current user name from the App
    const currentUserName = window.__currentParticipant?.name;
    
    let html = '';
    
    // Podium for top 3
    if (standings.length >= 3) {
      const medals = ['🥇', '🥈', '🥉'];
      const classes = ['gold', 'silver', 'bronze'];
      // Order: silver(2nd) | gold(1st) | bronze(3rd)
      const podiumOrder = [1, 0, 2];
      
      html += '<div class="standings-podium fade-in">';
      podiumOrder.forEach(i => {
        const s = standings[i];
        html += `
          <div class="podium-card ${classes[i]}">
            <span class="podium-medal">${medals[i]}</span>
            <span class="podium-name">${s.name}</span>
            <span class="podium-points">${s.totalPoints}</span>
            <span class="podium-stats">${s.perfectScores || 0} ★</span>
          </div>
        `;
      });
      html += '</div>';
    }
    
    // Full standings list
    html += '<div class="glass-card fade-in" style="margin: 0 16px 24px">';
    standings.forEach((s, i) => {
      const isCurrentUser = s.name === currentUserName;
      html += `
        <div class="standings-row ${isCurrentUser ? 'current-user' : ''}">
          <span class="standings-rank">${s.rank || i + 1}</span>
          <span class="standings-name">${s.name}</span>
          <div style="text-align:right">
            <div class="standings-points">${s.totalPoints}</div>
            <div class="standings-stats">${s.matchesPredicted} voorspeld · ${s.perfectScores || 0} ★</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    
    content.innerHTML = html;
    
  } catch (err) {
    content.innerHTML = `<div class="loading-container"><p>Fout bij laden: ${err.message}</p></div>`;
  }
  
  // Auto-refresh
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(async () => {
    try { await renderStandings(); } catch(e) {}
  }, 30000);
}

export function cleanupStandings() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}
