import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Auto-unwrap backend's { success, data, ...rest } envelope
    // so consumers get the actual data in response.data
    const body = response.data;
    if (body && typeof body === 'object' && body.success !== undefined && body.data !== undefined) {
      const { data, success, ...meta } = body;
      response.data = data;
      response.meta = meta; // pagination, count, etc.
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const Auth = {
  loginAPI: (data) => api.post('/auth/login', data),
  registerAPI: (data) => api.post('/auth/register', data),
  getMeAPI: () => api.get('/auth/me'),
  demoLogin: (role) => api.post('/auth/demo-login', { role })
};

export const Users = {
  getFreelancers: () => api.get('/users/freelancers'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getTopFreelancers: () => api.get('/users/top')
};

export const Projects = {
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  getMyProjects: () => api.get('/projects/my'),
  updateMilestoneStatus: (id, milestoneIndex, data) => api.put(`/projects/${id}/milestones/${milestoneIndex}`, data),
  getProjectMatches: (id) => api.get(`/projects/${id}/matches`)
};

export const Proposals = {
  createProposal: (data) => api.post('/proposals', data),
  getProjectProposals: (projectId) => api.get(`/proposals/project/${projectId}`),
  getMyProposals: () => api.get('/proposals/my'),
  acceptProposal: (id) => api.put(`/proposals/${id}/accept`),
  rejectProposal: (id) => api.put(`/proposals/${id}/reject`)
};

export const Messages = {
  getConversations: () => api.get('/messages'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
  sendMessage: (conversationId, content) => api.post(`/messages/${conversationId}`, { content }),
  createConversation: (data) => api.post('/messages', data)
};

export const Payments = {
  createEscrowPayment: (data) => api.post('/payments/escrow', data),
  releasePayment: (id) => api.post(`/payments/release/${id}`),
  disputePayment: (id) => api.post(`/payments/dispute/${id}`),
  getProjectPayments: (projectId) => api.get(`/payments/project/${projectId}`),
  getMyPayments: () => api.get('/payments/my')
};

export const Reviews = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getProjectReviews: (projectId) => api.get(`/reviews/project/${projectId}`)
};
