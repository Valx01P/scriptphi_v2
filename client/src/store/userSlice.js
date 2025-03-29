// client/src/store/userSlice.js
import AuthService from '../api/authService';

const createUserSlice = (set) => ({
  // User state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  // Initialize auth from localStorage on app load
  initAuth: () => {
    const isAuthenticated = AuthService.isAuthenticated();
    
    set({
      isAuthenticated,
      isLoading: false,
    });
    
    if (isAuthenticated) {
      // You might want to fetch user data here
    }
  },
  
  // Register a new user
  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await AuthService.register(userData);
      
      set({
        isLoading: false,
        // Don't set isAuthenticated yet - need verification
      });
      
      return { success: true, pendingUserId: response.pendingUserId };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed',
      });
      
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },
  
  // Verify email
  verifyEmail: async (verificationData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await AuthService.verifyEmail(verificationData);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Verification failed',
      });
      
      return { success: false, error: error.response?.data?.message || 'Verification failed' };
    }
  },
  
  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await AuthService.login(credentials);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },
  
  // OAuth login methods
  googleLogin: () => {
    AuthService.googleLogin();
  },
  
  linkedinLogin: () => {
    AuthService.linkedinLogin();
  },
  
  // Handle OAuth callback
  handleAuthCallback: async (token) => {
    set({ isLoading: true, error: null });
    
    try {
      const result = await AuthService.handleCallback(token);
      
      if (result.success) {
        set({
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true };
      } else {
        set({
          isLoading: false,
          error: 'Authentication failed',
        });
        
        return { success: false, error: 'Authentication failed' };
      }
    } catch (error) {
      set({
        isLoading: false,
        error: 'Authentication failed',
      });
      
      return { success: false, error: 'Authentication failed' };
    }
  },
  
  // Logout
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await AuthService.logout();
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      set({
        isLoading: false,
        error: 'Logout failed',
      });
      
      return { success: false, error: 'Logout failed' };
    }
  },
});

export default createUserSlice;