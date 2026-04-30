import api from './axios';

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
  getOverdue: () => api.get('/dashboard/overdue'),
};
