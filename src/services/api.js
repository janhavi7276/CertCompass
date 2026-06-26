import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const certAPI = {
  async getCertifications(query = '', level = '', free = false) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (level) params.append('level', level);
    if (free) params.append('free', String(free));
    const response = await axios.get(`${API_BASE}/api/certifications?${params}`);
    return response.data;
  },

  async getRecommendations(careerGoal, skills) {
    const response = await axios.post(`${API_BASE}/api/recommend`, {
      career_goal: careerGoal,
      skills
    });
    return response.data;
  },

  async getPaths(token) {
    const response = await axios.get(`${API_BASE}/api/paths`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async savePath(title, certIds, token) {
    const response = await axios.post(`${API_BASE}/api/paths/save`, 
      { title, cert_ids: certIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};
