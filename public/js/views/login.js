import API from '../api.js';

export function renderLogin(onLogin) {
  const content = document.getElementById('app-content');
  const header = document.getElementById('app-header');
  const nav = document.getElementById('bottom-nav');
  
  header.innerHTML = '';
  nav.innerHTML = '';
  nav.style.display = 'none';
  
  content.innerHTML = `
    <div class="login-container">
      <div class="login-logo fade-in">⚽</div>
      <h1 class="login-title fade-in">WK 2026</h1>
      <p class="login-subtitle fade-in">Voorspellingspoule</p>
      
      <div class="login-card glass-card fade-in">
        <div class="login-tabs">
          <button class="login-tab active" data-mode="join">Deelnemen</button>
          <button class="login-tab" data-mode="admin">Beheerder</button>
        </div>
        
        <form id="login-form">
          <div id="join-fields">
            <div class="form-group">
              <label class="form-label" for="input-name">Naam</label>
              <input class="form-input" type="text" id="input-name" placeholder="Jouw naam" required autocomplete="name">
            </div>
            <div class="form-group">
              <label class="form-label" for="input-invite">Uitnodigingscode</label>
              <input class="form-input" type="text" id="input-invite" placeholder="Code van de organisator" required autocomplete="off">
            </div>
          </div>
          
          <div id="admin-fields" class="hidden">
            <div class="form-group">
              <label class="form-label" for="input-admin-code">Beheerderscode</label>
              <input class="form-input" type="password" id="input-admin-code" placeholder="Admin wachtwoord" autocomplete="current-password">
            </div>
          </div>
          
          <div id="login-error" class="form-error hidden"></div>
          
          <button type="submit" class="btn-primary" id="login-submit" style="width:100%;margin-top:16px">
            Deelnemen
          </button>
        </form>
      </div>
    </div>
  `;
  
  let currentMode = 'join';
  
  // Tab switching
  content.querySelectorAll('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentMode = tab.dataset.mode;
      content.querySelectorAll('.login-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === currentMode));
      
      const joinFields = document.getElementById('join-fields');
      const adminFields = document.getElementById('admin-fields');
      joinFields.classList.toggle('hidden', currentMode !== 'join');
      adminFields.classList.toggle('hidden', currentMode !== 'admin');
      
      const inputName = document.getElementById('input-name');
      const inputInvite = document.getElementById('input-invite');
      const inputAdminCode = document.getElementById('input-admin-code');
      
      if (currentMode === 'join') {
        inputName.setAttribute('required', '');
        inputInvite.setAttribute('required', '');
        inputAdminCode.removeAttribute('required');
      } else {
        inputName.removeAttribute('required');
        inputInvite.removeAttribute('required');
        inputAdminCode.setAttribute('required', '');
      }
      
      document.getElementById('login-submit').textContent = currentMode === 'join' ? 'Deelnemen' : 'Inloggen';
      document.getElementById('login-error').classList.add('hidden');
    });
  });
  
  // Form submit
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');
    const submitBtn = document.getElementById('login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Even geduld...';
    
    try {
      let data;
      if (currentMode === 'join') {
        const name = document.getElementById('input-name').value.trim();
        const inviteCode = document.getElementById('input-invite').value.trim();
        if (!name || !inviteCode) throw new Error('Vul alle velden in');
        data = await API.join(name, inviteCode);
      } else {
        const adminCode = document.getElementById('input-admin-code').value.trim();
        if (!adminCode) throw new Error('Vul de beheerderscode in');
        data = await API.adminLogin(adminCode);
      }
      onLogin(data);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = currentMode === 'join' ? 'Deelnemen' : 'Inloggen';
    }
  });
}
