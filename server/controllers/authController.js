// server/controllers/authController.js
import passport from 'passport'
import { successResponse, errorResponse } from '../utils/responseHelpers.js';
import security from '../utils/security.js';
import authService from '../services/authService.js';
import TokenService from '../services/tokenService.js';
import userService from '../services/userService.js';

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
      // Sanitize input
      const email = security.sanitizeInput(req.body.email)
      const password = req.body.password
      const firstName = security.sanitizeInput(req.body.firstName)
      const lastName = security.sanitizeInput(req.body.lastName)
      const username = security.sanitizeInput(req.body.username)
      
      const result = await authService.handleNativeSignup(
        email, password, firstName, lastName, username
      );
      
      return res.status(201).json(successResponse({
        pendingUserId: result.pendingUserId
      }, 'Verification code sent to email', 201));
      
    } catch (error) {
      console.error('Signup error:', error)
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Signup failed', error.status || 500, error.toString())
      );
    }
  },
  
  // Verify email code
  async verifyEmail(req, res) {
    try {
      const pendingUserId = req.body.pendingUserId
      const code = security.sanitizeInput(req.body.code)
      
      const newUser = await authService.verifyEmail(pendingUserId, code);
      
      // Generate tokens
      const { accessToken, refreshToken } = TokenService.generateTokens(newUser)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      return res.status(200).json(successResponse({
        accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          username: newUser.username
        }
      }, 'Email verified successfully'));
      
    } catch (error) {
      console.error('Verification error:', error)
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Verification failed', error.status || 500)
      );
    }
  },
  
  // Native login
  async nativeLogin(req, res, next) {
    passport.authenticate('local', { session: false }, async (err, user, info) => {
      if (err) return next(err)
      if (!user) return res.status(401).json(errorResponse(info.message, 401))
      
      const { accessToken, refreshToken } = TokenService.generateTokens(user)
      
      // Store refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      return res.status(200).json(successResponse({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username
        }
      }));
    })(req, res, next)
  },
  
  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const email = security.sanitizeInput(req.body.email)
      
      await authService.requestPasswordReset(email);
      
      return res.status(200).json(successResponse(
        null,
        'If the email exists, a reset code has been sent'
      ));
    } catch (error) {
      console.error('Password reset request error:', error)
      return res.status(500).json(errorResponse('Failed to process password reset request', 500));
    }
  },
  
  // Reset password
  async resetPassword(req, res) {
    try {
      const email = security.sanitizeInput(req.body.email)
      const code = security.sanitizeInput(req.body.code)
      const newPassword = req.body.newPassword
      
      await authService.resetPassword(email, code, newPassword);
      
      return res.status(200).json(successResponse(
        null,
        'Password successfully reset'
      ));
    } catch (error) {
      console.error('Password reset error:', error)
      return res.status(error.status || 500).json(
        errorResponse(error.message || 'Failed to reset password', error.status || 500)
      );
    }
  },
  
  // Refresh token
  async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        return res.status(401).json(errorResponse('Refresh token required', 401));
      }
      
      const { tokens, user } = await TokenService.refreshTokens(refreshToken, userService);
      
      // Update refresh token cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      return res.status(200).json(successResponse({
        accessToken: tokens.accessToken,
        user
      }));
    } catch (error) {
      console.error('Refresh token error:', error)
      return res.status(401).json(errorResponse('Invalid refresh token', 401));
    }
  },
  
  // Logout
  async logout(req, res) {
    // Clear refresh token cookie
    res.clearCookie('refreshToken')
    return res.status(200).json(successResponse(null, 'Logged out successfully'));
  }
}

export default authController