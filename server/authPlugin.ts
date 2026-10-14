import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

interface UserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  createdAt: number;
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

export const sendCeoWelcomeEmail = async (user: UserPayload) => {
  const recipient = user.email;
  const founderEmail = 'satifysatceo@gmail.com';
  const founderName = 'Oluwole Inuoluwadunsimi (Founder & CEO, SATify)';

  const emailHtml = `
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
        .footer { margin-top: 32px; pt-4; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">⚡ SATIFY</div>
        <h1 class="heading">Welcome to SATify, ${user.name}!</h1>
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

  try {
    // Attempt dynamic import of nodemailer if installed
    const nodemailer = await import('nodemailer').catch(() => null);
    if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${founderName}" <${process.env.SMTP_FROM || founderEmail}>`,
        to: recipient,
        bcc: founderEmail,
        subject: `Welcome to SATify, ${user.name}! (from the Founder)`,
        html: emailHtml,
      });

      console.log(`[SATify CEO Email] Live email sent to ${recipient} (BCC to ${founderEmail})`);
      return { success: true, mode: 'smtp' };
    } else {
      console.log(`[SATify CEO Email Simulated] Message generated for ${recipient} from ${founderName} (BCC: ${founderEmail})`);
      return { success: true, mode: 'simulated' };
    }
  } catch (err) {
    console.warn('[SATify CEO Email Error]', err);
    return { success: false, error: String(err) };
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

            // Set HTTP-only secure cookie
            const sessionVal = encodeURIComponent(JSON.stringify(user));
            res.setHeader('Set-Cookie', `satify_session=${sessionVal}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);
            
            // Asynchronously dispatch welcome email
            sendCeoWelcomeEmail(user).catch(() => {});

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
            const result = await sendCeoWelcomeEmail({
              id: `user-${Date.now()}`,
              name: body.name || 'SAT Student',
              email: body.email || 'student@example.com',
              createdAt: Date.now(),
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
