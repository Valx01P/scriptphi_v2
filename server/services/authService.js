// server/services/authService.js
import jwt from 'jsonwebtoken';
import PostgresService from './postgresService.js';
import security from '../utils/security.js';
import generateVerificationCode from '../utils/genVerifyCode.js';
import EmailService from './emailService.js';

// Initialize PostgreSQL services
const User = new PostgresService('users');
const PendingUser = new PostgresService('pending_users');
const VerificationCode = new PostgresService('verification_codes');

const authService = {
  async handleNativeSignup(email, password, firstName, lastName, username) {
    // Check if email exists in users table
    const existingUsers = await User.get_by_field('email', email);
    if (existingUsers.length > 0) {
      throw new Error('Email already registered');
    }
    
    // Check if username exists
    const existingUsernames = await User.get_by_field('username', username);
    if (existingUsernames.length > 0) {
      throw new Error('Username already taken');
    }
    
    // Hash password
    const hashedPassword = await security.hashPassword(password);
    
    // Create pending user
    const pendingUser = await PendingUser.save({
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      username,
      verification_attempts: 0,
      last_attempt_time: null
    });
    
    // Generate verification code
    const code = generateVerificationCode();
    
    // Calculate expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store verification code
    await VerificationCode.save({
      pending_user_id: pendingUser.id,
      code,
      expires_at: expiresAt
    });
    
    // Send verification email
    await EmailService.sendVerificationCode(email, code, pendingUser.id);
    
    return { pendingUserId: pendingUser.id };
  },
  
  async verifyEmail(pendingUserId, code) {
    // Get the pending user record
    const pendingUser = await PendingUser.get_by_id(pendingUserId);
    
    if (!pendingUser) {
      throw { status: 404, message: 'Pending user not found' };
    }
    
    const now = new Date();
    
    // Check if user is in lockout period (3 attempts within 5 minutes)
    if (
      pendingUser.verification_attempts >= 3 && 
      pendingUser.last_attempt_time && 
      ((now - new Date(pendingUser.last_attempt_time)) / 60000) < 5
    ) {
      throw { status: 429, message: 'Too many attempts. Please wait 5 minutes before trying again' };
    }
    
    // Check if the code is valid
    const verificationCodes = await VerificationCode.get_by_fields({
      pending_user_id: pendingUserId,
      code
    });
    
    // Update attempts counter
    if (pendingUser.last_attempt_time && 
        ((now - new Date(pendingUser.last_attempt_time)) / 60000) >= 5) {
      // Reset counter if it's been more than 5 minutes
      await PendingUser.update(pendingUserId, {
        verification_attempts: 1,
        last_attempt_time: now
      });
    } else {
      // Increment counter
      await PendingUser.update(pendingUserId, {
        verification_attempts: pendingUser.verification_attempts + 1,
        last_attempt_time: now
      });
    }
    
    if (verificationCodes.length === 0 || new Date(verificationCodes[0].expires_at) < now) {
      // Code is invalid or expired
      throw { status: 400, message: 'Invalid or expired verification code' };
    }
    
    // Code is valid - create confirmed user
    const newUser = await User.save({
      password: pendingUser.password,
      first_name: pendingUser.first_name,
      last_name: pendingUser.last_name,
      email: pendingUser.email,
      username: pendingUser.username,
      last_login: now
    });
    
    // Delete pending user
    await PendingUser.delete(pendingUserId);
    
    // Send welcome email
    await EmailService.sendWelcomeEmail(newUser.email, newUser.first_name);
    
    return newUser;
  },
  
  // Add other auth methods here...
  async requestPasswordReset(email) {
    // Check if user exists
    const users = await User.get_by_field('email', email);
    
    if (users.length === 0) {
      // Don't reveal that the email doesn't exist, but don't process further
      return true;
    }
    
    const user = users[0];
    
    // Generate verification code
    const code = generateVerificationCode();
    
    // Calculate expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store verification code
    await VerificationCode.save({
      user_id: user.id,
      code,
      expires_at: expiresAt,
      type: 'password_reset'
    });
    
    // Send password reset email
    await EmailService.sendPasswordReset(email, code, user.id);
    
    return true;
  },

  async resetPassword(email, code, newPassword) {
    // Find user by email
    const users = await User.get_by_field('email', email);
    
    if (users.length === 0) {
      throw { status: 404, message: 'User not found' };
    }
    
    const user = users[0];
    
    // Verify code
    const verificationCodes = await VerificationCode.get_by_fields({
      user_id: user.id,
      code,
      type: 'password_reset'
    });
    
    if (verificationCodes.length === 0 || new Date(verificationCodes[0].expires_at) < new Date()) {
      throw { status: 400, message: 'Invalid or expired verification code' };
    }
    
    // Hash new password
    const hashedPassword = await security.hashPassword(newPassword);
    
    // Update user password
    await User.update(user.id, { password: hashedPassword });
    
    // Mark code as used
    await VerificationCode.delete(verificationCodes[0].id);
    
    return true;
  }
};

export default authService;