import express from 'express'
import userController from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = express.Router()

router.route('/me')
  .get(verifyJWT, userController.getCurrentUser)
  .put(verifyJWT, userController.updateUser)
  .delete(verifyJWT, userController.deleteUser)

router.get('/:id', verifyJWT, userController.getUserById)

export default router