import { pool } from './database.js'

const initDB = async () => {
    try {
        // Enable UUID extension if it's not already enabled
        await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`)
        
        // Create the tables in the correct order to handle foreign key constraints
        await pool.query(createUserTableQuery)
        await pool.query(createPendingUserTableQuery)
        await pool.query(createVerificationCodeTableQuery)
                
        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Error initializing database:', error)
    }
}

const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    linkedin_id VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_has_auth CHECK (google_id IS NOT NULL OR linkedin_id IS NOT NULL OR password IS NOT NULL)
)
`

const createPendingUserTableQuery = `
CREATE TABLE IF NOT EXISTS pending_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    verification_attempts INTEGER DEFAULT 0,
    last_attempt_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`

const createVerificationCodeTableQuery = `
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pending_user_id UUID NOT NULL,
    code CHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pending_user_id) REFERENCES pending_users(id) ON DELETE CASCADE
)
`

initDB()