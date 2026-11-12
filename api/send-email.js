// Vercel Serverless Function: /api/send-email
import nodemailer from 'nodemailer';

const getLoginEmailText = (userName, email, method, loginTime, founderEmail) => `
Hi ${userName},

Welcome back to SATify! You have successfully signed in to your study session.

Sign-In Details:
• Account: ${email}
• Method: ${method}
• Time: ${loginTime}

Your question history, saved bookmarks, and skill analytics are synced and ready for your prep session.

Quick Bluebook Pacing Reminder:
• Reading & Writing: Target pace is 71 seconds per question (54 questions / 64 minutes)
• Math: Target pace is 95 seconds per question (44 questions / 70 minutes)
• Zero Test Spoilers: 100% non-active question bank preserves official Bluebook Practice Tests (1–6).

Have questions or need help with a question explanation? Just reply directly to this email anytime.

Best of luck with your preparation,
Oluwole Inuoluwadunsimi
Founder & CEO, SATify
${founderEmail}
`.trim();

const getLoginEmailHtml = (userName, email, method, loginTime, founderEmail) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome back to SATify</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <div style="font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 20px;">
      SATIFY
    </div>

    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
      Welcome back, ${userName}!
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      You have successfully signed in to your SATify account.
    </p>

    <div style="background-color: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin: 18px 0; font-size: 14px; color: #334155; line-height: 1.6;">
      <div style="margin-bottom: 4px;"><strong>Account:</strong> ${email}</div>
      <div style="margin-bottom: 4px;"><strong>Sign-In Method:</strong> ${method}</div>
      <div><strong>Timestamp:</strong> ${loginTime}</div>
    </div>

    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      Your practice analytics, saved question bookmarks, and vocabulary mastery stats are synced and ready for your prep session.
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #1e3a8a;">
      <strong style="color: #1e40af; display: block; margin-bottom: 6px;">Bluebook Pacing Benchmarks:</strong>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        <li style="margin-bottom: 4px;"><strong>Reading &amp; Writing:</strong> <strong>71 seconds</strong> / question (54 questions / 64 min).</li>
        <li style="margin-bottom: 4px;"><strong>Math:</strong> <strong>95 seconds</strong> / question (44 questions / 70 min).</li>
        <li><strong>Zero Test Spoilers:</strong> 100% non-active question bank preserves official Bluebook Tests 1–6.</li>
      </ul>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
      If you have questions about any question rationale or need help with your prep, you can reply directly to this email anytime.
    </p>

    <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
      <strong style="color: #0f172a;">Oluwole Inuoluwadunsimi</strong><br>
      Founder &amp; CEO, SATify<br>
      <a href="mailto:${founderEmail}" style="color: #2563eb; text-decoration: none;">${founderEmail}</a> &bull; &copy; 2026 SATify
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        You received this sign-in confirmation because you accessed your SATify study account.
      </div>
    </div>
  </div>
</body>
</html>
`.trim();

const getWelcomeEmailText = (userName, founderEmail) => `
Hi ${userName},

Welcome to SATify! I'm Oluwole Inuoluwadunsimi, the founder and creator of SATify.

I built SATify to give students a zero-distraction, authentic Digital SAT practice environment on the web, completely free.

Key features for your prep:
• 100% Non-Active Question Bank: Practice freely without spoiling official Bluebook Practice Tests (1–6).
• Bluebook Pacing Stopwatch: Stay calibrated to official pacing (71s for R&W, 95s for Math).
• Domain Analytics: Pinpoint your lowest-accuracy skills and drill them directly.
• Vocab Mastery & Question Rush: Build retention and test speed with targeted sprints.

If you ever have feedback or questions about any question rationale, feel free to reply directly to this email. I read every message.

Best of luck hitting your target score!

Oluwole Inuoluwadunsimi
Founder & CEO, SATify
${founderEmail}
`.trim();

const getWelcomeEmailHtml = (userName, founderEmail) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SATify</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);">
    <div style="font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 20px;">
      SATIFY
    </div>

    <h1 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">
      Welcome to SATify, ${userName}!
    </h1>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      I'm <strong>Oluwole Inuoluwadunsimi</strong>, the founder and creator of SATify.
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px 0;">
      I built SATify to give students a zero-distraction, authentic Digital SAT practice environment on the web, completely free.
    </p>

    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #1e3a8a;">
      <strong style="color: #1e40af; display: block; margin-bottom: 4px;">100% Non-Active Question Bank</strong>
      <span style="color: #334155;">All questions in SATify are sourced exclusively from non-active test forms, so you can practice as much as you want without spoiling your official Bluebook Practice Tests (1–6).</span>
    </div>

    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 12px 0;">
      Three quick ways to maximize your prep starting today:
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #334155;">
      <li style="margin-bottom: 6px;"><strong>Bluebook Pacing Stopwatch:</strong> Watch the count-up timer to calibrate to official pacing (71s for R&amp;W, 95s for Math).</li>
      <li style="margin-bottom: 6px;"><strong>Domain Analytics:</strong> Pinpoint your 5 lowest-accuracy skills and drill them directly.</li>
      <li><strong>Vocab Mastery &amp; Question Rush:</strong> Build speed and vocabulary retention with timed sprints.</li>
    </ul>

    <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0;">
      If you ever have feedback or questions about question explanations, feel free to reply directly to this email anytime. I read every message.
    </p>

    <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
      <strong style="color: #0f172a;">Oluwole Inuoluwadunsimi</strong><br>
      Founder &amp; CEO, SATify<br>
      <a href="mailto:${founderEmail}" style="color: #2563eb; text-decoration: none;">${founderEmail}</a> &bull; &copy; 2026 SATify
      <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
        You received this welcome letter because you signed up for SATify.
      </div>
    </div>
  </div>
</body>
</html>
`.trim();

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

  const { email, name, type = 'login', method = 'Email & Password' } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const userName = name || email.split('@')[0];
  const founderEmail = 'satifysatceo@gmail.com';
  const founderName = 'Oluwole from SATify';
  const loginTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'full',
    timeStyle: 'medium',
  }) + ' UTC';

  const isLogin = type === 'login';
  const subject = isLogin
    ? `Welcome back to SATify, ${userName}`
    : `Welcome to SATify, ${userName} — Digital SAT Prep`;

  const emailText = isLogin
    ? getLoginEmailText(userName, email, method, loginTime, founderEmail)
    : getWelcomeEmailText(userName, founderEmail);

  const emailHtml = isLogin
    ? getLoginEmailHtml(userName, email, method, loginTime, founderEmail)
    : getWelcomeEmailHtml(userName, founderEmail);

  try {
    const smtpUser = process.env.SMTP_USER || founderEmail;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;
    const isGmail = smtpUser.includes('@gmail.com');

    if (smtpPass) {
      const transporter = isGmail
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          })
        : nodemailer.createTransport({
            host: smtpHost || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

      await transporter.sendMail({
        from: `"${founderName}" <${process.env.SMTP_FROM || smtpUser}>`,
        replyTo: founderEmail,
        to: email,
        subject,
        text: emailText,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': `satify-${Date.now()}`,
          'Auto-Submitted': 'auto-generated',
        },
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
