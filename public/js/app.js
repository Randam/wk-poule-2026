import API from './api.js';
import { renderNav, onNavigate, setActiveTab } from './components/nav.js';
import { renderLogin } from './views/login.js';
import { renderMatches, cleanupMatches } from './views/matches.js';
import { renderStandings, cleanupStandings } from './views/standings.js';
import { renderAdmin } from './views/admin.js';

const App = {
  currentView: null,
  participant: null,
  
  async init() {
    // Expose toast globally for components
    window.__showToast = (msg, type) => this.showToast(msg, type);
    
    // Check for existing token
    if (API.token) {
      try {
        const data = await API.getMe();
        this.participant = data.participant;
        window.__currentParticipant = this.participant;
        this.showApp('matches');
      } catch (err) {
        // Token invalid
        API.clearToken();
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  },
  
  showLogin() {
    document.getElementById('bottom-nav').style.display = 'none';
    renderLogin((data) => {
      this.participant = data.participant;
      window.__currentParticipant = this.participant;
      this.showApp('matches');
    });
  },
  
  showApp(view = 'matches') {
    const nav = document.getElementById('bottom-nav');
    nav.style.display = 'flex';
    
    renderNav(view, this.participant?.isAdmin);
    
    onNavigate((tab) => {
      this.navigate(tab);
    });
    
    this.navigate(view);
  },
  
  navigate(view) {
    // Cleanup previous view intervals
    cleanupMatches();
    cleanupStandings();
    
    this.currentView = view;
    setActiveTab(view);
    
    const content = document.getElementById('app-content');
    content.innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    
    switch (view) {
      case 'matches':
        renderMatches();
        break;
      case 'standings':
        renderStandings();
        break;
      case 'admin':
        if (this.participant?.isAdmin) {
          renderAdmin();
        } else {
          this.navigate('matches');
        }
        break;
      default:
        renderMatches();
    }
  },
  
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },
  
  logout() {
    API.clearToken();
    this.participant = null;
    window.__currentParticipant = null;
    cleanupMatches();
    cleanupStandings();
    this.showLogin();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
