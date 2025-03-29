// server/controllers/userController.js
import { successResponse, errorResponse } from '../utils/responseHelpers.js';
import security from '../utils/security.js';
import verifyOwnership from '../utils/verifyOwnership.js';
import userService from '../services/userService.js';

const userController = {
  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json(errorResponse('User not authenticated', 401));
      }
      
      const userProfile = await userService.getCurrentUserProfile(userId);
      
      return res.status(200).json(successResponse(userProfile));
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Failed to fetch user data', error.status || 500)
      );
    }
  },
  
  // Get user by ID (public profile)
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const publicProfile = await userService.getPublicUserProfile(id);
      
      return res.status(200).json(successResponse(publicProfile));
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Failed to fetch user data', error.status || 500)
      );
    }
  },
  
  // Update user profile
  async updateUser(req, res) {
    try {
      const userId = req.userId;
      
      // Verify ownership
      const ownership = verifyOwnership(req, userId);
      if (ownership.status !== 200) {
        return res.status(ownership.status).json(errorResponse(ownership.message, ownership.status));
      }
      
      // Sanitize input
      const updateData = {
        firstName: security.sanitizeInput(req.body.firstName),
        lastName: security.sanitizeInput(req.body.lastName),
        username: security.sanitizeInput(req.body.username),
        description: security.sanitizeInput(req.body.description),
        newPassword: req.body.newPassword
      };
      
      const currentPassword = req.body.currentPassword;
      
      const updatedProfile = await userService.updateUser(userId, updateData, currentPassword);
      
      return res.status(200).json(successResponse(updatedProfile));
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Failed to update user data', error.status || 500)
      );
    }
  },
  
  // Delete user account
  async deleteUser(req, res) {
    try {
      const userId = req.userId;
      const { password } = req.body;
      
      // Verify ownership
      const ownership = verifyOwnership(req, userId);
      if (ownership.status !== 200) {
        return res.status(ownership.status).json(errorResponse(ownership.message, ownership.status));
      }
      
      await userService.deleteUser(userId, password);
      
      // Clear any auth cookies
      res.clearCookie('refreshToken');
      
      return res.status(200).json(successResponse(null, 'Account deleted successfully'));
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Failed to delete account', error.status || 500)
      );
    }
  }
};

export default userController;