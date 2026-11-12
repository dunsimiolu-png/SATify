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

const getLoginEmailHtml = (userName: string, email: string, method: string, loginTime: string, founderEmail: string) => `
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

const getWelcomeEmailHtml = (userName: string, founderEmail: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .logo { font-size: 22px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; }
    .heading { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 20px; }
    p { font-size: 15px; line-height: 1.6; color: #334155; }
    .highlight { background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 14px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">⚡ SATIFY</div>
    <h1 class="heading">Welcome to SATify, ${userName}!</h1>
    <p>I’m <strong>Oluwole Inuoluwadunsimi</strong>, the founder and creator of SATify.</p>
    <p>I built SATify with a singular goal: to give students the highest-fidelity, zero-distraction Digital SAT practice environment on the web, completely free.</p>
    
    <div class="highlight">
      <strong>✓ 100% Non-Active Question Bank:</strong> All questions in SATify are sourced exclusively from non-active test forms. You can practice as much as you want without spoiling your official Bluebook Practice Tests (1–6).
    </div>

    <p>Here are three quick ways to maximize your prep starting today:</p>
    <ul>
      <li><strong>Bluebook Pacing Stopwatch:</strong> Watch the count-up timer on every question to stay calibrated to the Digital SAT target pace (71s for R&W, 95s for Math).</li>
      <li><strong>Domain Analytics & Weak-Spot Targeting:</strong> Head to the Analytics tab to pinpoint your 5 lowest-accuracy skills and drill them directly.</li>
      <li><strong>Interactive Vocab & Question Rush:</strong> Build speed and vocabulary retention with timed sprints and flashcard mastery.</li>
    </ul>

    <p>If you ever have feedback, questions about question explanations, or feature suggestions, feel free to reply directly to this email at <a href="mailto:${founderEmail}">${founderEmail}</a>. I read every message.</p>

    <p>Best of luck with your preparation—let's get you that 1500+ score!</p>

    <div class="footer">
      <strong>Oluwole Inuoluwadunsimi</strong><br>
      Founder & CEO, SATify<br>
      <a href="mailto:${founderEmail}">${founderEmail}</a> • © 2026 SATify
    </div>
  </div>
</body>
</html>
`;

export const dispatchEmail = async (payload: UserPayload) => {
  const recipient = payload.email;
  const founderEmail = 'satifysatceo@gmail.com';
  const founderName = 'Oluwole Inuoluwadunsimi (Founder & CEO, SATify)';
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
    ? `⚡ Welcome back to SATify, ${userName}! (Login Notification)`
    : `⚡ Welcome to SATify, ${userName}! (from the Founder)`;

  const emailHtml = isLogin
    ? getLoginEmailHtml(userName, recipient, method, loginTime, founderEmail)
    : getWelcomeEmailHtml(userName, founderEmail);

  try {
    const nodemailer = await import('nodemailer').catch(() => null);
    const smtpUser = process.env.SMTP_USER || founderEmail;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST;

    if (nodemailer && smtpPass) {
      const transporter = smtpHost
        ? nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: { user: smtpUser, pass: smtpPass },
          })
        : nodemailer.createTransport({
            service: 'gmail',
            auth: { user: smtpUser, pass: smtpPass },
          });

      await transporter.sendMail({
        from: `"${founderName}" <${process.env.SMTP_FROM || smtpUser}>`,
        to: recipient,
        bcc: smtpUser,
        subject,
        html: emailHtml,
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
