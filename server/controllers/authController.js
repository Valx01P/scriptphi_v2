import passport from 'passport'
import bcrypt from 'bcrypt'
import PostgresService from '../services/postgresService.js'
import TokenService from '../services/tokenService.js'
import EmailService from '../services/emailService.js'

// Initialize PostgreSQL services
const User = new PostgresService('users')
const PendingUser = new PostgresService('pending_users')
const VerificationCode = new PostgresService('verification_codes')

// Helper function to generate random code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const authController = {
  // Google OAuth routes
  async googleLogin(req, res, next) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
  },
  
  async googleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) return next(err)
      if (!user) return res.redirect('/login?error=auth_failed')
      
      const { accessToken, refreshToken } = TokenService.generateTokens(user)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      // Redirect to frontend with access token
      res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${accessToken}`)
    })(req, res, next)
  },
  
  // LinkedIn OAuth routes
  async linkedinLogin(req, res, next) {
    passport.authenticate('linkedin')(req, res, next)
  },
  
  async linkedinCallback(req, res, next) {
    passport.authenticate('linkedin', { session: false }, async (err, user) => {
      if (err) return next(err)
      if (!user) return res.redirect('/login?error=auth_failed')
      
      const { accessToken, refreshToken } = TokenService.generateTokens(user)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      // Redirect to frontend with access token
      res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${accessToken}`)
    })(req, res, next)
  },
  
  // Native signup
  async nativeSignup(req, res) {
    try {
      const { email, password, firstName, lastName, username } = req.body
      
      // Check if email exists in users table
      const existingUsers = await User.get_by_field('email', email)
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'Email already registered' })
      }
      
      // Check if username exists
      const existingUsernames = await User.get_by_field('username', username)
      if (existingUsernames.length > 0) {
        return res.status(400).json({ message: 'Username already taken' })
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Create pending user
      const pendingUser = await PendingUser.save({
        email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        username,
        verification_attempts: 0,
        last_attempt_time: null
      })
      
      // Generate verification code
      const code = generateVerificationCode()
      
      // Calculate expiration (15 minutes from now)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)
      
      // Store verification code
      await VerificationCode.save({
        pending_user_id: pendingUser.id,
        code,
        expires_at: expiresAt
      })
      
      // Send verification email
      await EmailService.sendVerificationCode(email, code, pendingUser.id)
      
      res.status(201).json({
        message: 'Verification code sent to email',
        pendingUserId: pendingUser.id
      })
    } catch (error) {
      console.error('Signup error:', error)
      res.status(500).json({ message: 'Signup failed', error: error.message })
    }
  },
  
  // Verify email code
  async verifyEmail(req, res) {
    try {
      const { pendingUserId, code } = req.body
      
      // Get the pending user record
      const pendingUser = await PendingUser.get_by_id(pendingUserId)
      
      if (!pendingUser) {
        return res.status(404).json({ message: 'Pending user not found' })
      }
      
      const now = new Date()
      
      // Check if user is in lockout period (3 attempts within 5 minutes)
      if (
        pendingUser.verification_attempts >= 3 && 
        pendingUser.last_attempt_time && 
        ((now - new Date(pendingUser.last_attempt_time)) / 60000) < 5
      ) {
        return res.status(429).json({ message: 'Too many attempts. Please wait 5 minutes before trying again' })
      }
      
      // Check if the code is valid
      const verificationCodes = await VerificationCode.get_by_fields({
        pending_user_id: pendingUserId,
        code
      })
      
      // Update attempts counter
      if (pendingUser.last_attempt_time && 
          ((now - new Date(pendingUser.last_attempt_time)) / 60000) >= 5) {
        // Reset counter if it's been more than 5 minutes
        await PendingUser.update(pendingUserId, {
          verification_attempts: 1,
          last_attempt_time: now
        })
      } else {
        // Increment counter
        await PendingUser.update(pendingUserId, {
          verification_attempts: pendingUser.verification_attempts + 1,
          last_attempt_time: now
        })
      }
      
      if (verificationCodes.length === 0 || new Date(verificationCodes[0].expires_at) < now) {
        // Code is invalid or expired
        return res.status(400).json({ message: 'Invalid or expired verification code' })
      }
      
      // Code is valid - create confirmed user
      const newUser = await User.save({
        password: pendingUser.password,
        first_name: pendingUser.first_name,
        last_name: pendingUser.last_name,
        email: pendingUser.email,
        username: pendingUser.username,
        last_login: now
      })
      
      // Delete pending user
      await PendingUser.delete(pendingUserId)
      
      // Generate tokens
      const { accessToken, refreshToken } = TokenService.generateTokens(newUser)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      // Send welcome email
      await EmailService.sendWelcomeEmail(newUser.email, newUser.first_name)
      
      res.status(200).json({
        message: 'Email verified successfully',
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          username: newUser.username
        }
      })
    } catch (error) {
      console.error('Verification error:', error)
      res.status(500).json({ message: 'Verification failed', error: error.message })
    }
  },
  
  // Native login
  async nativeLogin(req, res, next) {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) return next(err)
      if (!user) return res.status(401).json({ message: info.message })
      
      const { accessToken, refreshToken } = TokenService.generateTokens(user)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      res.status(200).json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username
        }
      })
    })(req, res, next)
  },
  
  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body
      
      // Check if user exists
      const users = await User.get_by_field('email', email)
      
      if (users.length === 0) {
        // Don't reveal that the email doesn't exist
        return res.status(200).json({ message: 'If the email exists, a reset code has been sent' })
      }
      
      const user = users[0]
      
      // Generate verification code
      const code = generateVerificationCode()
      
      // Calculate expiration (15 minutes from now)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)
      
      // Store verification code
      await VerificationCode.save({
        user_id: user.id,
        code,
        expires_at: expiresAt,
        type: 'password_reset'
      })
      
      // Send password reset email
      await EmailService.sendPasswordReset(email, code, user.id)
      
      res.status(200).json({
        message: 'If the email exists, a reset code has been sent'
      })
    } catch (error) {
      console.error('Password reset request error:', error)
      res.status(500).json({ message: 'Failed to process password reset request' })
    }
  },
  
  // Reset password
  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body
      
      // Find user by email
      const users = await User.get_by_field('email', email)
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' })
      }
      
      const user = users[0]
      
      // Verify code
      const verificationCodes = await VerificationCode.get_by_fields({
        user_id: user.id,
        code,
        type: 'password_reset'
      })
      
      if (verificationCodes.length === 0 || new Date(verificationCodes[0].expires_at) < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired verification code' })
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      
      // Update user password
      await User.update(user.id, { password: hashedPassword })
      
      // Mark code as used
      await VerificationCode.delete(verificationCodes[0].id)
      
      res.status(200).json({
        message: 'Password successfully reset'
      })
    } catch (error) {
      console.error('Password reset error:', error)
      res.status(500).json({ message: 'Failed to reset password' })
    }
  },
  
  // Refresh token
  async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' })
      }
      
      // Verify refresh token
      const decoded = TokenService.verifyRefreshToken(refreshToken)
      
      if (!decoded) {
        return res.status(401).json({ message: 'Invalid refresh token' })
      }
      
      // Get user
      const user = await User.get_by_id(decoded.userId)
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }
      
      // Generate new tokens
      const tokens = TokenService.generateTokens(user)
      
      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      res.status(200).json({
        accessToken: tokens.accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username
        }
      })
    } catch (error) {
      console.error('Refresh token error:', error)
      res.status(401).json({ message: 'Invalid refresh token' })
    }
  },
  
  // Logout
  async logout(req, res) {
    // Clear refresh token cookie
    res.clearCookie('refreshToken')
    res.status(200).json({ message: 'Logged out successfully' })
  }
}

export default authController