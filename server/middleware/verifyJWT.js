import TokenService from '../services/tokenService.js';

const verifyJWT = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Extract the token
  const token = authHeader.split(' ')[1];
  
  // Verify the token
  const decoded = TokenService.verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  // Add user info to request
  req.userId = decoded.userId;
  req.userEmail = decoded.email;
  
  next();
};

export default verifyJWT;