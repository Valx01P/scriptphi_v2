// server/utils/security.js
import bcrypt from 'bcrypt';

/**
 * Security utility functions for password hashing and comparison
 */
const security = {
  /**
   * Hash a plain text password
   * @param {string} password - The plain text password to hash
   * @returns {Promise<string>} - The hashed password
   */
  async hashPassword(password) {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Password hashing failed');
    }
  },

  /**
   * Compare a plain text password with a hashed password
   * @param {string} plainPassword - The plain text password to compare
   * @param {string} hashedPassword - The hashed password to compare against
   * @returns {Promise<boolean>} - True if the passwords match, false otherwise
   */
  async comparePasswords(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  },

  /**
   * Generate a random string of specified length
   * @param {number} length - The length of the string to generate
   * @returns {string} - A random string
   */
  generateRandomString(length = 32) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
  },

  /**
   * Sanitize user input to prevent injection attacks
   * Basic implementation - for production, consider a dedicated library
   * @param {string} input - The input to sanitize
   * @returns {string} - The sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Replace potentially dangerous characters
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

export default security;