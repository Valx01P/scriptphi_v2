// server/templates/emailTemplates.js

const verificationTemplate = (code) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Verify Your ScriptPhi Account</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      .content {
        padding: 20px 0;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: #4a6ee0;
        padding: 10px;
        background-color: #eef2ff;
        border-radius: 4px;
        margin: 15px 0;
        letter-spacing: 5px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999;
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Verify Your ScriptPhi Account</h2>
      </div>
      <div class="content">
        <p>Thank you for registering with ScriptPhi! To complete your registration, please enter the verification code below:</p>
        
        <div class="code">${code}</div>
        
        <p>This code will expire in 15 minutes.</p>
        
        <p>If you didn't request this code, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ScriptPhi. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `
}

const welcomeTemplate = (firstName) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Welcome to ScriptPhi!</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      .content {
        padding: 20px 0;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #4a6ee0;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 15px 0;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999;
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Welcome to ScriptPhi!</h2>
      </div>
      <div class="content">
        <p>Hi ${firstName},</p>
        
        <p>Welcome to ScriptPhi! We're excited to have you join our community of developers and learners.</p>
        
        <p>ScriptPhi is designed to help you practice and improve your coding skills through challenges, discussions, and collaboration.</p>
        
        <p>Get started by exploring challenges or joining discussions in our forums:</p>
        
        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_URL}/challenges" class="button">Explore Challenges</a>
        </p>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Happy coding!</p>
        <p>The ScriptPhi Team</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ScriptPhi. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `
}

const resetPasswordTemplate = (code) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Reset Your ScriptPhi Password</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
      }
      .content {
        padding: 20px 0;
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: #4a6ee0;
        padding: 10px;
        background-color: #eef2ff;
        border-radius: 4px;
        margin: 15px 0;
        letter-spacing: 5px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #999;
        padding-top: 10px;
        border-top: 1px solid #ddd;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Reset Your ScriptPhi Password</h2>
      </div>
      <div class="content">
        <p>We received a request to reset your ScriptPhi password. Please enter the verification code below to proceed:</p>
        
        <div class="code">${code}</div>
        
        <p>This code will expire in 15 minutes.</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ScriptPhi. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `
}

export {
  verificationTemplate,
  welcomeTemplate,
  resetPasswordTemplate
}