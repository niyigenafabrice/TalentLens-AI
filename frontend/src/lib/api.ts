import axios from 'axios';

const API = axios.create({
  baseURL: 'https://talentlens-ai-production.up.railway.app/api',
});

export const jobsAPI = {
  getAll: () => API.get('/jobs'),
  create: (data: any) => API.post('/jobs', data),
  delete: (id: string) => API.delete(`/jobs/${id}`),
};

export const applicantsAPI = {
  getAll: (jobId?: string) => API.get('/applicants', { params: { jobId } }),
  getOne: (id: string) => API.get(`/applicants/${id}`),
};

export const screeningAPI = {
  run: (jobId: string, applicantId: string) => API.post('/screening/screen', { jobId, applicantId }),
  getResults: (jobId: string) => API.get(`/screening/${jobId}`),
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
};

export const jobStatsAPI = {
  getFunnel: () => API.get('/job-stats/funnel'),
  getAll: () => API.get('/job-stats'),
};

export default API;
