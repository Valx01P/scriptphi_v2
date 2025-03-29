import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { configurePassport } from './config/passport.js'
// Import your routes
import httpRoutes from './routes/index.js'
// Import the socket setup function
// import { initSockets } from './sockets/index.js'

dotenv.config()

const app = express()

// Create an HTTP server from the Express app
const httpServer = http.createServer(app)

// Define CORS options - use the same for both Express and Socket.IO
const corsOptions = {
  origin: 'http://localhost:5173', // React app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

// Middleware
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

// Configure Passport
configurePassport()

app.use('/api', httpRoutes)

// Initialize Socket.IO on that server
// initSockets(httpServer, corsOptions)

// Start listening
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
