import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  // Sign up
  signup: async (fullname, email, password) => {
    const response = await api.post('/auth/signup', {
      fullname,
      email,
      password,
    });
    return response.data;
  },

  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Update profile
  updateProfile: async (formData) => {
    const response = await api.put('/auth/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
