import express from 'express'
import authController from '../controllers/authController.js'

const router = express.Router()

// OAuth routes
router.get('/google/login', authController.googleLogin)
router.get('/google/callback', authController.googleCallback)

router.get('/linkedin/login', authController.linkedinLogin)
router.get('/linkedin/callback', authController.linkedinCallback)

// Native authentication routes
router.post('/signup', authController.nativeSignup)
router.post('/verify', authController.verifyEmail)
router.post('/login', authController.nativeLogin)

// Password reset routes
router.post('/password/request-reset', authController.requestPasswordReset)
router.post('/password/reset', authController.resetPassword)

// Token management routes
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)

export default router