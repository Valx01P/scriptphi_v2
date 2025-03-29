import { Resend } from 'resend'
import dotenv from 'dotenv'
import { verificationTemplate, welcomeTemplate, resetPasswordTemplate } from '../templates/emailTemplates.js'

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

const EmailService = {
  async sendVerificationCode(email, code, pendingUserId) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ScriptPhi <verify@scriptphi.com>',
        to: email,
        subject: 'Verify your ScriptPhi account',
        html: verificationTemplate(code)
      })
      
      if (error) {
        console.error('Error sending verification email:', error)
        throw new Error('Failed to send verification email')
      }
      
      return data
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  },

  async sendWelcomeEmail(email, firstName) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ScriptPhi <welcome@scriptphi.com>',
        to: email,
        subject: 'Welcome to ScriptPhi!',
        html: welcomeTemplate(firstName)
      })
      
      if (error) {
        console.error('Error sending welcome email:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Email service error:', error)
      return false
    }
  },

  async sendPasswordReset(email, code, userId) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'ScriptPhi <reset@scriptphi.com>',
        to: email,
        subject: 'Reset Your ScriptPhi Password',
        html: resetPasswordTemplate(code)
      })
      
      if (error) {
        console.error('Error sending password reset email:', error)
        throw new Error('Failed to send password reset email')
      }
      
      return data
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }
}

export default EmailService