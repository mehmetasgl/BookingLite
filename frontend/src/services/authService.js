// src/services/authService.js

import api from './api';
import { jwtDecode } from 'jwt-decode';

const authService = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', {
      email,
      password,
    });
    
    if (response.data.success) {
      const { token, userId, email, role } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role }));
    }
    
    return response.data;
  },

  registerPartner: async (email, password, companyName) => {
    const response = await api.post('/auth/register/partner', {
      email,
      password,
      companyName,
    });
    
    if (response.data.success) {
      const { token, userId, email, role } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role }));
    }
    
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    if (response.data.success) {
      const { token, userId, email, role } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ userId, email, role }));
    }
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user && user.role === role;
  },

  getUserFromToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  },
};

export default authService;
