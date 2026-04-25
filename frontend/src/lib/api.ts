import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const jobsAPI = {
  getAll: () => API.get('/jobs'),
  create: (data: any) => API.post('/jobs', data),
  delete: (id: string) => API.delete(`/jobs/${id}`),
};

export const applicantsAPI = {
  getAll: (jobId?: string) => API.get('/applicants', { params: { jobId } }),
  getOne: (id: string) => API.get(/applicants/),
};

export const screeningAPI = {
  run: (jobId: string, applicantId: string) => API.post('/screening/run', { jobId, applicantId }),
  getResults: (jobId: string) => API.get(/screening/results/),
};

export const analyticsAPI = {
  getDashboard: () => API.get('/analytics/dashboard'),
};

export const jobStatsAPI = {
  getFunnel: () => API.get('/job-stats/funnel'),
  getAll: () => API.get('/job-stats'),
};

export default API;

