import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('analysisResult');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => {
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },
  getMe: () => api.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  addProject: (data) => api.post('/user/add-project', data),
  getAnalysis: () => api.get('/user/analysis'),
};

export const resumeAPI = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const roadmapAPI = {
  generate: (targetCareer) => api.post(`/roadmap/generate?target_career=${encodeURIComponent(targetCareer)}`),
  get: (email) => api.get(`/roadmap/${encodeURIComponent(email)}`),
  updateStep: (data) => api.put('/roadmap/update-step', data),
};

export const recommendationsAPI = {
  get: () => api.get('/recommendations/'),
};

export const jobsAPI = {
  get: (career = '', location = '', experience = '') =>
    api.get(`/jobs/?career=${encodeURIComponent(career)}&location=${encodeURIComponent(location)}&experience=${encodeURIComponent(experience)}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export const passionAPI = {
  getPassions: () => api.get('/passion/passions'),
  explore: (passionName) => api.get(`/passion/explore/${encodeURIComponent(passionName)}`),
  getCategory: (category) => api.get(`/passion/category/${encodeURIComponent(category)}`),
  getRoadmap: (passionId) => api.get(`/passion/roadmap/${encodeURIComponent(passionId)}`),
  search: (query) => api.get(`/passion/search?q=${encodeURIComponent(query)}`),
  smartSuggest: (hobbiesText) => api.post(`/passion/suggest?hobbies=${encodeURIComponent(hobbiesText)}`),
};

export const chatAPI = {
  sendMessage: (message, include_profile_context = true) => api.post('/chat/message', { message, include_profile_context }),
  getHistory: (limit = 20) => api.get(`/chat/history?limit=${limit}`),
  clearHistory: () => api.delete('/chat/clear'),
  getSuggestions: () => api.get('/chat/suggestions'),
};

export const trendsAPI = {
  getCareers: (limit = 10, category = '') => api.get(`/trends/careers?limit=${limit}&category=${encodeURIComponent(category)}`),
  getSkills: (category = '') => api.get(`/trends/skills?category=${encodeURIComponent(category)}`),
  getAiRisk: () => api.get('/trends/ai-risk'),
  getSalaryTrends: (careers = '') => api.get(`/trends/salary?careers=${encodeURIComponent(careers)}`),
  getCompanies: (tier = '', limit = 15) => api.get(`/trends/companies?tier=${encodeURIComponent(tier)}&limit=${limit}`),
  getStats: () => api.get('/trends/stats'),
  getSummary: () => api.get('/trends/summary'),
};

export const salaryAPI = {
  predict: (data) => api.post('/salary/predict', data),
  compare: (careers) => api.post('/salary/compare', { careers }),
  getOptions: () => api.get('/salary/options'),
  getQuick: (career) => api.get(`/salary/quick/${encodeURIComponent(career)}`),
};

export const creatorAPI = {
  getNiches: () => api.get('/creator/niches'),
  exploreNiche: (niche) => api.get(`/creator/explore/${encodeURIComponent(niche)}`),
  calculateIncome: (data) => api.post('/creator/calculate-income', data),
};

export default api;
