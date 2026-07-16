import API from '../api.js';
import { createMatchCard } from '../components/match-card.js';

export async function renderAdmin() {
  const content = document.getElementById('app-content');
  const header = document.getElementById('app-header');
  
  header.innerHTML = `
    <div class="header-title">⚙️ Beheer</div>
    <div class="header-subtitle">Uitslagen & instellingen</div>
  `;
  
  // State
  let currentStage = 'group';
  let currentGroup = null;
  let allTeams = [];
  
  try {
    const data = await API.request('GET', '/teams');
    allTeams = data.teams || [];
  } catch (err) {
    console.error('Fout bij laden van teams:', err);
  }
  
  const stages = [
    { id: 'group', label: 'Groepsfase' },
    { id: 'round_of_32', label: 'Ronde van 32' },
    { id: 'round_of_16', label: 'Achtste Finale' },
    { id: 'quarterfinal', label: 'Kwartfinale' },
    { id: 'semifinal', label: 'Halve Finale' },
    { id: 'third_place', label: 'Troostfinale' },
    { id: 'final', label: 'Finale' },
  ];
  
  content.innerHTML = `
    <div class="admin-section">
      <h2 class="admin-section-title">📋 Uitslagen Invullen</h2>
      <div class="stage-tabs" id="admin-stage-tabs"></div>
      <div class="group-tabs" id="admin-group-tabs"></div>
      <div id="admin-matches-list"></div>
    </div>
    
    <div class="admin-section" style="padding: 0 16px">
      <h2 class="admin-section-title">👤 Voorspellingen Deelnemers Aanpassen</h2>
      <div class="form-group" style="margin-bottom:16px">
        <label class="form-label" for="select-participant">Selecteer Deelnemer</label>
        <select class="admin-select" id="select-participant" style="width:100%">
          <option value="">-- Kies Deelnemer --</option>
        </select>
      </div>
      <div class="stage-tabs" id="participant-stage-tabs" style="display:none;margin-bottom:12px"></div>
      <div class="group-tabs" id="participant-group-tabs" style="display:none;margin-bottom:16px"></div>
      <div id="participant-matches-list" style="margin-top:12px"></div>
    </div>

    <div class="admin-section" style="padding: 0 16px 24px">
      <h2 class="admin-section-title">📡 Wedstrijden Ophalen</h2>
      <p style="color:var(--text-muted,#888);font-size:0.875rem;margin-bottom:12px">
        Haal de deelnemende teams voor de volgende knockoutronde op via football-data.org en sla ze op.
      </p>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="admin-select" id="select-fetch-stage" style="flex:1;min-width:180px">
          <option value="round_of_32">Ronde van 32</option>
          <option value="round_of_16" selected>Achtste Finale</option>
          <option value="quarterfinal">Kwartfinale</option>
          <option value="semifinal">Halve Finale</option>
          <option value="third_place">Troostfinale</option>
          <option value="final">Finale</option>
        </select>
        <button class="btn-primary" id="btn-fetch-round" style="flex:0 0 auto">🔄 Teams Ophalen</button>
      </div>
      <div id="fetch-round-result" style="margin-top:10px;font-size:0.875rem"></div>
    </div>

    <div class="admin-section" style="padding: 0 16px 24px">
      <h2 class="admin-section-title">🔄 Herbereken Punten</h2>
      <button class="btn-primary" id="btn-recalculate" style="width:100%">Punten Herberekenen</button>
    </div>

    <div class="admin-section" style="padding: 0 16px 24px">
      <h2 class="admin-section-title">💾 Database Backup</h2>
      <p style="color:var(--text-muted,#888);font-size:0.875rem;margin-bottom:12px">
        Download een volledige backup van de SQLite-database inclusief alle wedstrijden, voorspellingen en standen.
      </p>
      <button class="btn-outline" id="btn-download-db" style="width:100%">⬇️ Database Downloaden</button>
    </div>
  `;
  
  // Stage tabs
  function renderStageTabs() {
    const container = document.getElementById('admin-stage-tabs');
    container.innerHTML = stages.map(s => 
      `<button class="stage-tab ${s.id === currentStage ? 'active' : ''}" data-stage="${s.id}">${s.label}</button>`
    ).join('');
    
    container.querySelectorAll('.stage-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentStage = btn.dataset.stage;
        currentGroup = null;
        renderStageTabs();
        renderGroupTabs();
        loadAdminMatches();
      });
    });
  }
  
  // Group tabs
  function renderGroupTabs() {
    const container = document.getElementById('admin-group-tabs');
    if (currentStage !== 'group') {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    const groups = ['Alle', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    container.innerHTML = groups.map(g => {
      const isActive = (g === 'Alle' && !currentGroup) || g === currentGroup;
      return `<button class="group-tab ${isActive ? 'active' : ''}" data-group="${g}">${g}</button>`;
    }).join('');
    
    container.querySelectorAll('.group-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentGroup = btn.dataset.group === 'Alle' ? null : btn.dataset.group;
        renderGroupTabs();
        loadAdminMatches();
      });
    });
  }
  
  // Load matches for admin
  async function loadAdminMatches() {
    const list = document.getElementById('admin-matches-list');
    list.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Laden...</p></div>';
    
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
      
      list.innerHTML = '';
      const container = document.createElement('div');
      container.style.padding = '0 16px';
      
      matches.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card admin-match-card';
        if (match.status === 'finished') card.classList.add('finished');
        
        const matchDate = new Date(match.match_date);
        const dateStr = matchDate.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Amsterdam' });
        const timeStr = matchDate.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' });
        const stageInfo = match.group_letter ? `Groep ${match.group_letter}` : (match.description || '');
        
        const isKnockout = match.stage !== 'group';
        let teamsSelectorHTML = '';
        if (isKnockout) {
          const homeOptions = allTeams.map(t => 
            `<option value="${t.id}" ${match.home_team_id === t.id ? 'selected' : ''}>${t.name_nl} (${t.code})</option>`
          ).join('');
          const awayOptions = allTeams.map(t => 
            `<option value="${t.id}" ${match.away_team_id === t.id ? 'selected' : ''}>${t.name_nl} (${t.code})</option>`
          ).join('');
          
          teamsSelectorHTML = `
            <div class="admin-teams-selector">
              <select class="admin-select" data-select-side="home">
                <option value="">-- Thuisploeg --</option>
                ${homeOptions}
              </select>
              <span class="vs-label">vs</span>
              <select class="admin-select" data-select-side="away">
                <option value="">-- Uitploeg --</option>
                ${awayOptions}
              </select>
              <button class="btn-outline btn-sm btn-save-teams" style="flex:0 auto" data-match-id="${match.id}">Teams Opslaan</button>
            </div>
          `;
        }

        const hasTBD = !match.home_team_code;
        const homeFlag = hasTBD ? '' : `<img class="team-flag" src="https://flagcdn.com/w40/${match.home_team_flag}.png" alt="${match.home_team_code}" loading="lazy">`;
        const awayFlag = hasTBD ? '' : `<img class="team-flag" src="https://flagcdn.com/w40/${match.away_team_flag}.png" alt="${match.away_team_code}" loading="lazy">`;
        
        card.innerHTML = `
          <div class="match-card__header">
            <span class="match-card__header-left">#${match.match_number} · ${stageInfo} · ${dateStr} · ${timeStr}</span>
            <span class="match-card__header-right">${match.status === 'finished' ? '✅' : ''}</span>
          </div>
          <div class="match-card__body">
            <div class="match-card__team match-card__team--home">
              <span class="team-name">${match.home_team_name_nl || 'NTB'}</span>
              ${homeFlag}
            </div>
            <div class="match-card__scores">
              <input type="number" class="score-input" inputmode="numeric" min="0" max="20" 
                     data-field="home" value="${match.home_score !== null ? match.home_score : ''}" placeholder="-">
              <span class="score-separator">-</span>
              <input type="number" class="score-input" inputmode="numeric" min="0" max="20" 
                     data-field="away" value="${match.away_score !== null ? match.away_score : ''}" placeholder="-">
            </div>
            <div class="match-card__team match-card__team--away">
              ${awayFlag}
              <span class="team-name">${match.away_team_name_nl || 'NTB'}</span>
            </div>
          </div>
          <div class="admin-actions">
            ${teamsSelectorHTML}
            <button class="btn-primary btn-sm btn-confirm" data-match-id="${match.id}">Bevestig Uitslag</button>
          </div>
        `;
        
        // Save result handler
        card.querySelector('.btn-confirm').addEventListener('click', async () => {
          const homeScore = card.querySelector('[data-field="home"]').value;
          const awayScore = card.querySelector('[data-field="away"]').value;
          
          if (homeScore === '' || awayScore === '') {
            if (window.__showToast) window.__showToast('Vul beide scores in', 'error');
            return;
          }
          
          try {
            await API.setMatchResult(match.id, parseInt(homeScore), parseInt(awayScore));
            card.classList.add('finished');
            if (window.__showToast) window.__showToast('Uitslag opgeslagen!', 'success');
          } catch (err) {
            if (window.__showToast) window.__showToast(err.message, 'error');
          }
        });

        // Save teams handler
        if (isKnockout) {
          card.querySelector('.btn-save-teams').addEventListener('click', async () => {
            const homeTeamId = card.querySelector('[data-select-side="home"]').value;
            const awayTeamId = card.querySelector('[data-select-side="away"]').value;
            
            if (!homeTeamId || !awayTeamId) {
              if (window.__showToast) window.__showToast('Selecteer beide teams', 'error');
              return;
            }
            
            try {
              await API.setMatchTeams(match.id, parseInt(homeTeamId), parseInt(awayTeamId));
              if (window.__showToast) window.__showToast('Teams opgeslagen!', 'success');
              loadAdminMatches();
            } catch (err) {
              if (window.__showToast) window.__showToast(err.message, 'error');
            }
          });
        }
        
        container.appendChild(card);
      });
      
      list.appendChild(container);
      
    } catch (err) {
      list.innerHTML = `<div class="loading-container"><p>Fout: ${err.message}</p></div>`;
    }
  }
  
  // Fetch next round button
  document.getElementById('btn-fetch-round').addEventListener('click', async () => {
    const btn = document.getElementById('btn-fetch-round');
    const resultDiv = document.getElementById('fetch-round-result');
    const stage = document.getElementById('select-fetch-stage').value;
    btn.disabled = true;
    btn.textContent = 'Bezig met ophalen...';
    resultDiv.innerHTML = '';
    try {
      const result = await API.fetchNextRound(stage);
      const color = result.updated > 0 ? 'var(--success, #22c55e)' : 'var(--text-muted, #888)';
      resultDiv.innerHTML = `<span style="color:${color}">✅ ${result.message}</span>`;
      if (result.errors && result.errors.length > 0) {
        resultDiv.innerHTML += `<br><span style="color:var(--danger,#ef4444);font-size:0.8rem">${result.errors.join(', ')}</span>`;
      }
      if (window.__showToast) window.__showToast(result.message, result.updated > 0 ? 'success' : 'info');
      // Reload matches if the current stage is the one we just fetched
      if (currentStage === stage) loadAdminMatches();
    } catch (err) {
      resultDiv.innerHTML = `<span style="color:var(--danger,#ef4444)">❌ ${err.message}</span>`;
      if (window.__showToast) window.__showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🔄 Teams Ophalen';
    }
  });

  // Recalculate button
  document.getElementById('btn-recalculate').addEventListener('click', async () => {
    const btn = document.getElementById('btn-recalculate');
    btn.disabled = true;
    btn.textContent = 'Bezig met herberekenen...';
    try {
      await API.recalculate();
      if (window.__showToast) window.__showToast('Punten herberekend!', 'success');
    } catch (err) {
      if (window.__showToast) window.__showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Punten Herberekenen';
    }
  });

  // Download database button
  document.getElementById('btn-download-db').addEventListener('click', async () => {
    const btn = document.getElementById('btn-download-db');
    btn.disabled = true;
    btn.textContent = 'Bezig met downloaden...';
    try {
      const res = await fetch('/api/admin/download-db', {
        headers: { 'Authorization': `Bearer ${API.token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Download mislukt');
      }
      const blob = await res.blob();
      const date = new Date().toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poule-backup-${date}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (window.__showToast) window.__showToast('Database gedownload!', 'success');
    } catch (err) {
      if (window.__showToast) window.__showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '⬇️ Database Downloaden';
    }
  });
  
  // Load participants and set up prediction override UI
  let participants = [];
  try {
    const pData = await API.request('GET', '/admin/participants');
    participants = pData.participants || [];
  } catch (err) {
    console.error('Fout bij laden van deelnemers:', err);
  }

  const selectParticipant = document.getElementById('select-participant');
  if (selectParticipant) {
    selectParticipant.innerHTML += participants
      .filter(p => p.is_admin !== 1)
      .map(p => `<option value="${p.id}">${p.name}</option>`)
      .join('');
  }

  let selectedParticipantId = null;
  let partStage = 'group';
  let partGroup = null;

  function renderPartStageTabs() {
    const container = document.getElementById('participant-stage-tabs');
    container.style.display = 'flex';
    container.innerHTML = stages.map(s => 
      `<button class="stage-tab ${s.id === partStage ? 'active' : ''}" data-part-stage="${s.id}">${s.label}</button>`
    ).join('');
    
    container.querySelectorAll('[data-part-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        partStage = btn.dataset.partStage;
        partGroup = null;
        renderPartStageTabs();
        renderPartGroupTabs();
        loadParticipantMatches();
      });
    });
  }

  function renderPartGroupTabs() {
    const container = document.getElementById('participant-group-tabs');
    if (partStage !== 'group') {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    const groups = ['Alle', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    container.innerHTML = groups.map(g => {
      const isActive = (g === 'Alle' && !partGroup) || g === partGroup;
      return `<button class="group-tab ${isActive ? 'active' : ''}" data-part-group="${g}">${g}</button>`;
    }).join('');
    
    container.querySelectorAll('[data-part-group]').forEach(btn => {
      btn.addEventListener('click', () => {
        partGroup = btn.dataset.partGroup === 'Alle' ? null : btn.dataset.partGroup;
        renderPartGroupTabs();
        loadParticipantMatches();
      });
    });
  }

  async function loadParticipantMatches() {
    const list = document.getElementById('participant-matches-list');
    if (!selectedParticipantId) {
      list.innerHTML = '';
      return;
    }
    
    list.innerHTML = '<div class="loading-container"><div class="spinner"></div><p>Voorspellingen laden...</p></div>';
    
    try {
      const url = `/matches?stage=${partStage}&participantId=${selectedParticipantId}${partGroup ? '&group=' + partGroup : ''}`;
      const data = await API.request('GET', url);
      const matches = data.matches || [];
      
      if (matches.length === 0) {
        list.innerHTML = '<div class="loading-container"><p>Geen wedstrijden gevonden</p></div>';
        return;
      }
      
      list.innerHTML = '';
      const container = document.createElement('div');
      
      matches.forEach(match => {
        const card = createMatchCard(match, {
          isAdmin: true, // Bypass lock checks in UI so admin can edit
          onSave: async (matchId, homeScore, awayScore) => {
            await API.request('PUT', `/admin/predictions/${selectedParticipantId}/${matchId}`, { homeScore, awayScore });
            if (window.__showToast) window.__showToast('Voorspelling aangepast!', 'success');
          }
        });
        container.appendChild(card);
      });
      
      list.appendChild(container);
    } catch (err) {
      list.innerHTML = `<div class="loading-container"><p>Fout: ${err.message}</p></div>`;
    }
  }

  if (selectParticipant) {
    selectParticipant.addEventListener('change', (e) => {
      selectedParticipantId = e.target.value;
      if (selectedParticipantId) {
        document.getElementById('participant-stage-tabs').style.display = 'flex';
        renderPartStageTabs();
        renderPartGroupTabs();
        loadParticipantMatches();
      } else {
        document.getElementById('participant-stage-tabs').style.display = 'none';
        document.getElementById('participant-group-tabs').style.display = 'none';
        document.getElementById('participant-matches-list').innerHTML = '';
      }
    });
  }

  renderStageTabs();
  renderGroupTabs();
  await loadAdminMatches();
}
