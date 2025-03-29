// server/services/tokenService.js
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const TokenService = {
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    )
  },

  generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
  },

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user)
    const refreshToken = this.generateRefreshToken(user)
    
    return { accessToken, refreshToken }
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch (error) {
      return null
    }
  },

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return null
    }
  },
  
  // New method to refresh tokens
  async refreshTokens(refreshToken, userService) {
    const decoded = this.verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      throw { status: 401, message: 'Invalid refresh token' };
    }
    
    const user = await userService.getUserById(decoded.userId);
    
    if (!user) {
      throw { status: 401, message: 'User not found' };
    }
    
    return {
      tokens: this.generateTokens(user),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username
      }
    };
  }
}

export default TokenService