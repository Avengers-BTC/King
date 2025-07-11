import nodemailer from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

// Configure email transporter
const createTransporter = async () => {
  // Use configured email settings
  if (process.env.EMAIL_SERVER_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }
  
  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    // Create a test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.error('Failed to create test account:', error);
    }
  }
  
  throw new Error('Email configuration missing');
};

export async function sendEmail({ to, subject, html }: MailOptions) {
  try {
    const transporter = await createTransporter();
    
    const from = process.env.EMAIL_FROM 
      ? `"${process.env.EMAIL_FROM_NAME || 'NightVibe'}" <${process.env.EMAIL_FROM}>`
      : `"NightVibe" <${process.env.EMAIL_SERVER_USER || 'noreply@nightvibe.com'}>`;
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    
    // For development, return preview URL if using ethereal
    if (process.env.NODE_ENV === 'development' && info.messageId && info.messageId.includes('ethereal')) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Preview URL: ${previewUrl}`);
      return { success: true, previewUrl };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function generatePasswordResetEmail(
  resetToken: string,
  userName: string = 'User'
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Reset your NightVibe password';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00a8e8;">Reset Your NightVibe Password</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #00a8e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>Thanks,<br>The NightVibe Team</p>
    </div>
  `;
  
  return { subject, html };
}

export function generateEmailVerificationEmail(
  userEmail: string, 
  verificationToken: string,
  userName: string = 'User'
) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
  
  const subject = 'Verify your NightVibe email address';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #00a8e8;">Verify Your Email Address</h2>
      <p>Hello ${userName},</p>
      <p>Thanks for signing up with NightVibe! To complete your registration, please verify your email address.</p>
      <p>Click the button below to verify your email:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #00a8e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>Thanks,<br>The NightVibe Team</p>
    </div>
  `;
  
  return { subject, html };
}
