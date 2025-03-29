import express from 'express'
import authRoutes from './authRoutes.js'
// import userRoutes from './userRoutes.js'

const router = express.Router()

// Mount all route modules
router.use('/auth', authRoutes)
// router.use('/users', userRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

export default router