// Vercel Serverless Function: /api/send-email
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { email, name, type = 'login', method = 'Email / Password' } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const userName = name || email.split('@')[0];
  const founderEmail = 'satifysatceo@gmail.com';
  const founderName = 'Oluwole Inuoluwadunsimi (Founder & CEO, SATify)';
  const loginTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'full',
    timeStyle: 'medium',
  }) + ' UTC';

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .logo-row { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
        .badge { display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
        .heading { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; }
        p { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0; }
        .info-box { background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 20px 0; font-size: 14px; color: #334155; }
        .info-box strong { color: #0f172a; }
        .tips-box { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 8px; margin: 24px 0; font-size: 14px; }
        .tips-box ul { margin: 8px 0 0 0; padding-left: 20px; }
        .tips-box li { margin-bottom: 6px; }
        .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5; }
        .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; margin: 16px 0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">⚡ SATify Account Notification</div>
        <div class="logo-row">
          <span class="logo">⚡ SATIFY</span>
        </div>
        
        <h1 class="heading">Welcome back, ${userName}!</h1>
        <p>You have successfully logged in to your SATify account.</p>

        <div class="info-box">
          <p style="margin: 0 0 8px 0;"><strong>Account:</strong> ${email}</p>
          <p style="margin: 0 0 8px 0;"><strong>Login Method:</strong> ${method}</p>
          <p style="margin: 0;"><strong>Timestamp:</strong> ${loginTime}</p>
        </div>

        <p>Your practice analytics, saved question bookmarks, and vocabulary mastery stats are synced and ready.</p>

        <div class="tips-box">
          <strong style="color: #1e40af;">🎯 Quick Bluebook Pacing Reminder:</strong>
          <ul>
            <li><strong>Reading & Writing:</strong> Target pace is <strong>71 seconds</strong> per question (54 questions / 64 minutes).</li>
            <li><strong>Math:</strong> Target pace is <strong>95 seconds</strong> per question (44 questions / 70 minutes).</li>
            <li><strong>100% Non-Active Question Bank:</strong> Practice with complete peace of mind—none of our questions spoil official Practice Tests 1–6.</li>
          </ul>
        </div>

        <p>If you did not initiate this login, please reply directly to this email to secure your account immediately.</p>

        <p>Best of luck with your preparation—let's hit your target score!</p>

        <div class="footer">
          <strong>Oluwole Inuoluwadunsimi</strong><br>
          Founder & CEO, SATify<br>
          <a href="mailto:${founderEmail}" style="color: #2563eb;">${founderEmail}</a> • © 2026 SATify
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const smtpUser = process.env.SMTP_USER || 'satifysatceo@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;

    if (smtpPass) {
      const transporter = smtpHost
        ? nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          })
        : nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

      await transporter.sendMail({
        from: `"${founderName}" <${process.env.SMTP_FROM || smtpUser}>`,
        to: email,
        bcc: smtpUser,
        subject: `⚡ Welcome back to SATify, ${userName}! (Login Notification)`,
        html: emailHtml,
      });

      console.log(`[SATify Email] Live email sent from ${smtpUser} to ${email}`);
      return res.status(200).json({ success: true, mode: 'live_gmail', recipient: email });
    } else {
      console.log(`[SATify Email Simulated] Live delivery requires SMTP_PASS for ${smtpUser}`);
      return res.status(200).json({ 
        success: true, 
        mode: 'simulated', 
        recipient: email,
        sender: smtpUser,
        note: `Live emails require a 16-character Gmail App Password for ${smtpUser} configured as SMTP_PASS in Vercel.` 
      });
    }
  } catch (err) {
    console.error('[SATify Email Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
