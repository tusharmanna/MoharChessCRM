import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const studentAPI = {
  getAll: (params) =>
    axios.get(`${API_URL}/students`, { params }),

  getById: (id) =>
    axios.get(`${API_URL}/students/${id}`),

  create: (data) =>
    axios.post(`${API_URL}/students`, data),

  update: (id, data) =>
    axios.put(`${API_URL}/students/${id}`, data),

  getBatches: () =>
    axios.get(`${API_URL}/batches`),

  getStats: () =>
    axios.get(`${API_URL}/stats`),
};

export const communicationAPI = {
  add: (data) =>
    axios.post(`${API_URL}/communications`, data),
};

export const taskAPI = {
  create: (data) =>
    axios.post(`${API_URL}/tasks`, data),

  update: (id, data) =>
    axios.put(`${API_URL}/tasks/${id}`, data),
};
