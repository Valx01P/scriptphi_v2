// client/src/api/authService.js
import axiosClient from './axiosClient';

const AuthService = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosClient.post('/auth/signup', userData);
    return response.data;
  },
  
  // Verify email with code
  verifyEmail: async (verificationData) => {
    const response = await axiosClient.post('/auth/verify', verificationData);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },
  
  // Login user
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/login', credentials);
    
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    
    return response.data;
  },
  
  // Google OAuth login redirect
  googleLogin: () => {
    window.location.href = 'http://localhost:3000/api/auth/google/login';
  },
  
  // LinkedIn OAuth login redirect
  linkedinLogin: () => {
    window.location.href = 'http://localhost:3000/api/auth/linkedin/login';
  },
  
  // Process OAuth callback
  handleCallback: async (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
      return { success: true };
    }
    return { success: false };
  },
  
  // Logout user
  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
      localStorage.removeItem('accessToken');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },
  
  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await axiosClient.post('/auth/password/request-reset', { email });
    return response.data;
  },
  
  // Reset password with code
  resetPassword: async (resetData) => {
    const response = await axiosClient.post('/auth/password/reset', resetData);
    return response.data;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  }
};

export default AuthService;