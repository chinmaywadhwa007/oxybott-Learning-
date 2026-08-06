import nodemailer from 'nodemailer';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize Transporter (custom SMTP if set, otherwise Ethereal test account)
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test Ethereal SMTP account automatically for local dev
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('[Email] Created dev Ethereal email test account:', testAccount.user);
    } catch (err) {
      console.warn('[Email] Warning: Could not initialize Ethereal transporter:', err);
    }
  }

  return transporter;
}

export async function sendMagicLinkEmail(email: string, token: string) {
  const magicLinkUrl = `${frontendUrl}/auth?mode=magic-link&token=${token}`;

  // Log prominently to console for effortless dev testing
  console.log('\n============================================================');
  console.log('✨ [MAGIC LINK GENERATED]');
  console.log(`To: ${email}`);
  console.log(`Click or paste this link to log in immediately:`);
  console.log(`\x1b[36m%s\x1b[0m`, magicLinkUrl);
  console.log('============================================================\n');

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #081321; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 500px; margin: auto;">
      <h2 style="color: #5BE4FF; margin-bottom: 8px;">Oxybott Authentication</h2>
      <p style="color: #94a3b8; font-size: 15px;">You requested a passwordless magic sign-in link.</p>
      
      <div style="margin: 32px 0;">
        <a href="${magicLinkUrl}" style="background: linear-gradient(135deg, #5BE4FF, #3B82F6); color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          ⚡ Sign In to Oxybott
        </a>
      </div>

      <p style="color: #64748b; font-size: 13px;">This link will expire in 15 minutes and can only be used once.</p>
      <p style="color: #475569; font-size: 12px; word-break: break-all;">Or copy & paste: ${magicLinkUrl}</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    if (mailer) {
      const info = await mailer.sendMail({
        from: process.env.SMTP_FROM || '"Oxybott Auth" <no-reply@oxybott.io>',
        to: email,
        subject: '⚡ Your Passwordless Magic Link for Oxybott',
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email] Ethereal Email Preview URL: ${previewUrl}`);
      }
    }
  } catch (err) {
    console.error('[Email] Error sending email (Console link remains valid):', err);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${frontendUrl}/auth?mode=forgot-password&token=${token}`;

  console.log('\n============================================================');
  console.log('🔑 [PASSWORD RESET LINK GENERATED]');
  console.log(`To: ${email}`);
  console.log(`Click or paste this link to reset your password:`);
  console.log(`\x1b[33m%s\x1b[0m`, resetUrl);
  console.log('============================================================\n');

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #081321; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 500px; margin: auto;">
      <h2 style="color: #F59E0B; margin-bottom: 8px;">Reset Your Password</h2>
      <p style="color: #94a3b8; font-size: 15px;">We received a request to reset your Oxybott password.</p>
      
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background: linear-gradient(135deg, #F59E0B, #EF4444); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          🔑 Reset Password
        </a>
      </div>

      <p style="color: #64748b; font-size: 13px;">This link will expire in 30 minutes.</p>
    </div>
  `;

  try {
    const mailer = await getTransporter();
    if (mailer) {
      await mailer.sendMail({
        from: process.env.SMTP_FROM || '"Oxybott Security" <no-reply@oxybott.io>',
        to: email,
        subject: '🔑 Reset Your Oxybott Password',
        html,
      });
    }
  } catch (err) {
    console.error('[Email] Error sending password reset email:', err);
  }
}
