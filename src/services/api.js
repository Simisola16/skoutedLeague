const BACKEND_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://skoutedyouthleague-backend.onrender.com');

const API_BASE = `${BACKEND_URL}/api`;

function getAuthHeaders() {
  const token = localStorage.getItem('skouted_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  register: async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  verifyOtp: async (email, otp) => {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return res.json();
  },

  resendOtp: async (email) => {
    const res = await fetch(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_BASE}/teams`);
    return res.json();
  },

  getTeam: async (id) => {
    const res = await fetch(`${API_BASE}/teams/${id}`);
    return res.json();
  },

  createTeam: async (formData) => {
    const token = localStorage.getItem('skouted_token');
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData // multipart/form-data
    });
    return res.json();
  },

  addPlayer: async (teamId, formData) => {
    const token = localStorage.getItem('skouted_token');
    const res = await fetch(`${API_BASE}/teams/${teamId}/players`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    return res.json();
  },

  getPlayer: async (id) => {
    const res = await fetch(`${API_BASE}/players/${id}`);
    return res.json();
  },

  submitLineup: async (fixtureId, payload) => {
    const res = await fetch(`${API_BASE}/teams/lineup/${fixtureId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  followTeam: async (teamId, follow = true) => {
    const res = await fetch(`${API_BASE}/teams/${teamId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follow })
    });
    return res.json();
  },

  // Fixtures
  getFixtures: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/fixtures?${query}`);
    return res.json();
  },

  getFixture: async (id) => {
    const res = await fetch(`${API_BASE}/fixtures/${id}`);
    return res.json();
  },

  createFixture: async (payload) => {
    const res = await fetch(`${API_BASE}/fixtures`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateScore: async (id, homeScore, awayScore, minute) => {
    const res = await fetch(`${API_BASE}/fixtures/${id}/score`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ homeScore, awayScore, minute })
    });
    return res.json();
  },

  updatePeriod: async (id, status, minute) => {
    const res = await fetch(`${API_BASE}/fixtures/${id}/period`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, minute })
    });
    return res.json();
  },

  logMatchEvent: async (fixtureId, payload) => {
    const res = await fetch(`${API_BASE}/fixtures/${fixtureId}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateStats: async (fixtureId, statsPayload) => {
    const res = await fetch(`${API_BASE}/fixtures/${fixtureId}/stats`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(statsPayload)
    });
    return res.json();
  },

  deleteFixture: async (fixtureId) => {
    const res = await fetch(`${API_BASE}/fixtures/${fixtureId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  recalculateStandings: async () => {
    const res = await fetch(`${API_BASE}/fixtures/recalculate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Standings & Leaders
  getStandings: async () => {
    const res = await fetch(`${API_BASE}/stats/standings`);
    return res.json();
  },

  getLeaders: async () => {
    const res = await fetch(`${API_BASE}/stats/leaders`);
    return res.json();
  },

  // Fan Subscriptions
  subscribeFan: async (payload) => {
    const res = await fetch(`${API_BASE}/fans/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Admin Protected Endpoints
  getAdminTeams: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/teams?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getAdminTeamPlayers: async (teamId) => {
    const res = await fetch(`${API_BASE}/admin/teams/${teamId}/players`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateAdminPlayer: async (playerId, payload, isFormData = false) => {
    const token = localStorage.getItem('skouted_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const useFormData = isFormData || (typeof FormData !== 'undefined' && payload instanceof FormData);
    if (!useFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}/admin/players/${playerId}`, {
      method: 'PATCH',
      headers,
      body: useFormData ? payload : JSON.stringify(payload)
    });
    return res.json();
  },

  addAdminPlayer: async (teamId, payload, isFormData = false) => {
    const token = localStorage.getItem('skouted_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const useFormData = isFormData || (typeof FormData !== 'undefined' && payload instanceof FormData);
    if (!useFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const res = await fetch(`${API_BASE}/admin/teams/${teamId}/players`, {
      method: 'POST',
      headers,
      body: useFormData ? payload : JSON.stringify(payload)
    });
    return res.json();
  },

  sendAdminLineupReminder: async (fixtureId, teamId = null) => {
    const res = await fetch(`${API_BASE}/admin/fixtures/${fixtureId}/remind-lineup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teamId })
    });
    return res.json();
  },

  verifyAdminTeam: async (teamId, status = 'Verified') => {
    const res = await fetch(`${API_BASE}/admin/teams/${teamId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Authenticated Team Manager Dashboard Endpoints
  getTeamDashboard: async () => {
    const res = await fetch(`${API_BASE}/team/dashboard`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getTeamRoster: async () => {
    const res = await fetch(`${API_BASE}/team/roster`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  addTeamPlayer: async (formData) => {
    const token = localStorage.getItem('skouted_token');
    const res = await fetch(`${API_BASE}/team/roster`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData // FormData
    });
    return res.json();
  },

  updateTeamPlayer: async (playerId, formDataOrJson, isFormData = false) => {
    const token = localStorage.getItem('skouted_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const res = await fetch(`${API_BASE}/team/roster/${playerId}`, {
      method: 'PUT',
      headers,
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
    });
    return res.json();
  },

  deleteTeamPlayer: async (playerId) => {
    const res = await fetch(`${API_BASE}/team/roster/${playerId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  getTeamFixtures: async () => {
    const res = await fetch(`${API_BASE}/team/fixtures`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  submitTeamLineup: async (payload) => {
    const res = await fetch(`${API_BASE}/team/lineup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  getTeamProfile: async () => {
    const res = await fetch(`${API_BASE}/team/profile`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  updateTeamProfile: async (formData) => {
    const token = localStorage.getItem('skouted_token');
    const res = await fetch(`${API_BASE}/team/profile`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData // FormData
    });
    return res.json();
  },

  changeTeamPassword: async (currentPassword, newPassword) => {
    const res = await fetch(`${API_BASE}/team/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  }
};
