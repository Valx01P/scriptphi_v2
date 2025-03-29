// server/services/userService.js
import PostgresService from '../services/postgresService.js';
import security from '../utils/security.js';

// Initialize PostgreSQL service
const User = new PostgresService('users');

const userService = {
  async getUserById(userId) {
    const user = await User.get_by_id(userId);
    
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    
    return user;
  },
  
  async getPublicUserProfile(userId) {
    const user = await User.get_by_id(userId);
    
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    
    // Only return public information
    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      description: user.description,
      profileImageUrl: user.profile_image_url
    };
  },
  
  async getCurrentUserProfile(userId) {
    const user = await User.get_by_id(userId);
    
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    
    // Remove sensitive information
    const userProfile = { ...user };
    delete userProfile.password;
    delete userProfile.google_id;
    delete userProfile.linkedin_id;
    
    return {
      id: userProfile.id,
      email: userProfile.email,
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      username: userProfile.username,
      description: userProfile.description,
      profileImageUrl: userProfile.profile_image_url,
      createdAt: userProfile.created_at,
      lastLogin: userProfile.last_login
    };
  },
  
  async updateUser(userId, updateData, currentPassword = null) {
    // Get current user data
    const currentUser = await User.get_by_id(userId);
    
    if (!currentUser) {
      throw { status: 404, message: 'User not found' };
    }
    
    // Check if username exists (if changing username)
    if (updateData.username && updateData.username !== currentUser.username) {
      const existingUsernames = await User.get_by_field('username', updateData.username);
      if (existingUsernames.length > 0) {
        throw { status: 400, message: 'Username already taken' };
      }
    }
    
    // Format the data for DB update
    const dbUpdateData = {};
    
    if (updateData.firstName) dbUpdateData.first_name = updateData.firstName;
    if (updateData.lastName) dbUpdateData.last_name = updateData.lastName;
    if (updateData.username) dbUpdateData.username = updateData.username;
    if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
    
    // If password change is requested
    if (updateData.newPassword && currentPassword) {
      // Verify current password
      const isPasswordValid = await security.comparePasswords(currentPassword, currentUser.password);
      
      if (!isPasswordValid) {
        throw { status: 401, message: 'Current password is incorrect' };
      }
      
      // Hash new password
      dbUpdateData.password = await security.hashPassword(updateData.newPassword);
    }
    
    // Update user
    const updatedUser = await User.update(userId, dbUpdateData);
    
    // Remove sensitive information
    delete updatedUser.password;
    delete updatedUser.google_id;
    delete updatedUser.linkedin_id;
    
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      username: updatedUser.username,
      description: updatedUser.description,
      profileImageUrl: updatedUser.profile_image_url,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login
    };
  },
  
  async deleteUser(userId, password = null) {
    // Get current user data
    const currentUser = await User.get_by_id(userId);
    
    if (!currentUser) {
      throw { status: 404, message: 'User not found' };
    }
    
    // Verify password for security (unless social login without password)
    if (currentUser.password) {
      if (!password) {
        throw { status: 400, message: 'Password is required to delete account' };
      }
      
      const isPasswordValid = await security.comparePasswords(password, currentUser.password);
      
      if (!isPasswordValid) {
        throw { status: 401, message: 'Password is incorrect' };
      }
    }
    
    // Delete user account
    return await User.delete(userId);
  }
};

export default userService;