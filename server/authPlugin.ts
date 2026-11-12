import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface UserPayload {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  createdAt?: number;
  type?: 'login' | 'welcome';
  method?: string;
}

const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

const sendJson = (res: ServerResponse, statusCode: number, data: any) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const getLoginEmailText = (userName: string, email: string, method: string, loginTime: string, founderEmail: string) => `
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

const getLoginEmailHtml = (userName: string, email: string, method: string, loginTime: string, founderEmail: string) => `
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

const getWelcomeEmailText = (userName: string, founderEmail: string) => `
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

const getWelcomeEmailHtml = (userName: string, founderEmail: string) => `
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

export const dispatchEmail = async (payload: UserPayload) => {
  const recipient = payload.email;
  const founderEmail = 'satifysatceo@gmail.com';
  const founderName = 'Oluwole from SATify';
  const userName = payload.name || recipient.split('@')[0];
  const type = payload.type || 'login';
  const method = payload.method || 'Email & Password';
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
    ? getLoginEmailText(userName, recipient, method, loginTime, founderEmail)
    : getWelcomeEmailText(userName, founderEmail);

  const emailHtml = isLogin
    ? getLoginEmailHtml(userName, recipient, method, loginTime, founderEmail)
    : getWelcomeEmailHtml(userName, founderEmail);

  try {
    const nodemailer = await import('nodemailer').catch(() => null);
    let smtpUser = process.env.SMTP_USER || founderEmail;
    let smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    let smtpHost = process.env.SMTP_HOST;

    if (!smtpPass) {
      try {
        const fs = await import('fs');
        if (fs.existsSync('.env')) {
          const raw = fs.readFileSync('.env', 'utf8');
          raw.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
              const [k, ...v] = trimmed.split('=');
              const key = k.trim();
              const val = v.join('=').trim();
              if (key === 'SMTP_PASS' || key === 'GMAIL_APP_PASSWORD') smtpPass = val;
              if (key === 'SMTP_USER') smtpUser = val;
              if (key === 'SMTP_HOST') smtpHost = val;
            }
          });
        }
      } catch {}
    }

    if (nodemailer && smtpPass) {
      const isGmail = smtpUser.includes('@gmail.com');
      const transporter = isGmail
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
          })
        : nodemailer.createTransport({
            host: smtpHost || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: smtpUser, pass: smtpPass },
          });

      await transporter.sendMail({
        from: `"${founderName}" <${process.env.SMTP_FROM || smtpUser}>`,
        replyTo: founderEmail,
        to: recipient,
        subject,
        text: emailText,
        html: emailHtml,
        headers: {
          'X-Entity-Ref-ID': `satify-${Date.now()}`,
          'Auto-Submitted': 'auto-generated',
        },
      });

      console.log(`[SATify Email] Live email sent from ${smtpUser} to ${recipient} (${type})`);
      return { success: true, mode: 'live', recipient };
    } else {
      console.log(`[SATify Email Simulated] ${type.toUpperCase()} notification generated for ${recipient} via ${method}`);
      return { 
        success: true, 
        mode: 'simulated', 
        recipient,
        note: 'Live delivery requires SMTP_PASS or GMAIL_APP_PASSWORD in .env.'
      };
    }
  } catch (err: any) {
    console.warn('[SATify Email Error]', err);
    return { success: false, error: err?.message || String(err) };
  }
};

export function authApiPlugin(): Plugin {
  return {
    name: 'satify-auth-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        // 1. POST /api/auth/google
        if (req.method === 'POST' && url === '/api/auth/google') {
          try {
            const body = await parseBody(req);
            const user: UserPayload = body.user || {
              id: body.id || `google-${Date.now()}`,
              name: body.name || 'SAT Student',
              email: body.email || 'student@example.com',
              picture: body.picture,
              createdAt: Date.now(),
            };

            const sessionVal = encodeURIComponent(JSON.stringify(user));
            res.setHeader('Set-Cookie', `satify_session=${sessionVal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
            
            // Asynchronously dispatch welcome & login notification
            dispatchEmail({ ...user, type: 'login', method: 'Google Account' }).catch(() => {});

            return sendJson(res, 200, { success: true, user });
          } catch (e: any) {
            return sendJson(res, 500, { error: e.message || 'Authentication error' });
          }
        }

        // 2. GET /api/auth/me
        if (req.method === 'GET' && url === '/api/auth/me') {
          const cookieHeader = req.headers.cookie || '';
          const match = cookieHeader.match(/satify_session=([^;]+)/);
          if (match && match[1]) {
            try {
              const user = JSON.parse(decodeURIComponent(match[1]));
              return sendJson(res, 200, { user });
            } catch (e) {
              return sendJson(res, 200, { user: null });
            }
          }
          return sendJson(res, 200, { user: null });
        }

        // 3. POST /api/auth/logout
        if (req.method === 'POST' && url === '/api/auth/logout') {
          res.setHeader('Set-Cookie', 'satify_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
          return sendJson(res, 200, { success: true });
        }

        // 4. POST /api/send-email or /api/auth/send-welcome
        if (req.method === 'POST' && (url === '/api/send-email' || url === '/api/auth/send-welcome')) {
          try {
            const body = await parseBody(req);
            const result = await dispatchEmail({
              name: body.name || 'SAT Student',
              email: body.email || 'student@example.com',
              type: body.type || (url === '/api/auth/send-welcome' ? 'welcome' : 'login'),
              method: body.method || 'Email & Password',
            });
            return sendJson(res, 200, result);
          } catch (e: any) {
            return sendJson(res, 500, { error: e.message });
          }
        }

        next();
      });
    },
  };
}
