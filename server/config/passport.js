// server/config/passport.js
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'
import security from '../utils/security.js'
import dotenv from 'dotenv'
import PostgresService from '../services/postgresService.js'

dotenv.config()

// Initialize PostgreSQL services
const User = new PostgresService('users')

const configurePassport = () => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.get_by_id(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })

  // Local Strategy for email/password login
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        // Sanitize email input
        const sanitizedEmail = security.sanitizeInput(email)
        
        // Find user by email
        const users = await User.get_by_field('email', sanitizedEmail)
        
        if (users.length === 0) {
          return done(null, false, { message: 'Incorrect email or password' })
        }
        
        const user = users[0]
        
        // User must have password for local login
        if (!user.password) {
          return done(null, false, { message: 'Account uses social login' })
        }
        
        // Check password
        const isValid = await security.comparePasswords(password, user.password)
        
        if (!isValid) {
          return done(null, false, { message: 'Incorrect email or password' })
        }
        
        // Update last login time
        await User.update(user.id, { last_login: new Date() })
        
        return done(null, user)
      } catch (error) {
        return done(error)
      }
    }
  ))

  // Google OAuth Strategy
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        const existingUsers = await User.get_by_field('google_id', profile.id)
        
        if (existingUsers.length > 0) {
          // Update last login time
          await User.update(existingUsers[0].id, { last_login: new Date() })
          return done(null, existingUsers[0])
        }

        // Check if email already exists with different auth method
        const sanitizedEmail = security.sanitizeInput(profile.emails[0].value)
        const emailUsers = await User.get_by_field('email', sanitizedEmail)
        
        if (emailUsers.length > 0) {
          // Link Google account to existing user
          await User.update(emailUsers[0].id, { google_id: profile.id })
          return done(null, emailUsers[0])
        }
        
        // Create new user
        const newUser = await User.save({
          google_id: profile.id,
          first_name: security.sanitizeInput(profile.name.givenName),
          last_name: security.sanitizeInput(profile.name.familyName),
          email: sanitizedEmail,
          username: security.sanitizeInput(`${profile.name.givenName}${Math.floor(Math.random() * 10000)}`),
          profile_image_url: profile.photos[0].value,
          last_login: new Date()
        })
        
        return done(null, newUser)
      } catch (error) {
        return done(error)
      }
    }
  ))

  // LinkedIn OAuth Strategy
  passport.use(new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['r_emailaddress', 'r_liteprofile']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this LinkedIn ID
        const existingUsers = await User.get_by_field('linkedin_id', profile.id)
        
        if (existingUsers.length > 0) {
          // Update last login time
          await User.update(existingUsers[0].id, { last_login: new Date() })
          return done(null, existingUsers[0])
        }

        // Check if email already exists with different auth method
        const sanitizedEmail = security.sanitizeInput(profile.emails[0].value)
        const emailUsers = await User.get_by_field('email', sanitizedEmail)
        
        if (emailUsers.length > 0) {
          // Link LinkedIn account to existing user
          await User.update(emailUsers[0].id, { linkedin_id: profile.id })
          return done(null, emailUsers[0])
        }
        
        // Create new user
        const newUser = await User.save({
          linkedin_id: profile.id,
          first_name: security.sanitizeInput(profile.name.givenName),
          last_name: security.sanitizeInput(profile.name.familyName),
          email: sanitizedEmail,
          username: security.sanitizeInput(`${profile.name.givenName}${Math.floor(Math.random() * 10000)}`),
          profile_image_url: profile.photos?.[0]?.value || null,
          last_login: new Date()
        })
        
        return done(null, newUser)
      } catch (error) {
        return done(error)
      }
    }
  ))

  return passport
}

export default configurePassport