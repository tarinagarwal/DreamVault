import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (email, firstName, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Email Verification</h1>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Thank you for signing up! Please use the verification code below to verify your email address:
            </p>
            
            <div style="text-align: center; margin: 40px 0; padding: 30px; background-color: #f8f9fa; border: 2px dashed #ddd; border-radius: 12px;">
              <p style="color: #333; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
              <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 10px;">Enter this code in the verification form</p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            
            <p style="color: #999; font-size: 14px;">
              This code will expire in 10 minutes for security reasons.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2025 Auth Template. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Welcome to Auth Template!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome Aboard!</h1>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your account has been successfully created and verified! You're now ready to explore all the features.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              Here's what you can do next:
            </p>
            
            <ul style="color: #666; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
              <li>Complete your profile</li>
              <li>Explore the dashboard</li>
              <li>Connect with other users</li>
            </ul>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Get Started
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2025 Auth Template. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error for welcome email as it's not critical
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, firstName, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
          </div>
          
          <div style="padding: 40px 20px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${firstName}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <p style="color: #999; font-size: 14px;">
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 14px;">
              © 2025 Auth Template. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
