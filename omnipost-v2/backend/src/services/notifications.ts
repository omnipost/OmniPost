// src/services/notifications.ts
// Email (AWS SES) and SMS (MSG91) notification service

import nodemailer from 'nodemailer';
import axios from 'axios';
import { logger } from '../config/logger';

/* ── Email (AWS SES via SMTP) ───────────────────────────────── */
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'email-smtp.ap-south-1.amazonaws.com',
  port:   parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export async function sendEmail(opts: {
  to:       string;
  subject:  string;
  html:     string;
  text?:    string;
}): Promise<void> {
  try {
    await transporter.sendMail({
      from:    `"OmniPost" <${process.env.EMAIL_FROM || 'noreply@omnipost.in'}>`,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text ?? opts.html.replace(/<[^>]+>/g, ''),
    });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    logger.error('Email send failed:', err);
    throw err;
  }
}

/* ── SMS / OTP (MSG91) ──────────────────────────────────────── */
export async function sendSmsOtp(mobile: string, otp: string): Promise<void> {
  try {
    const mobile10 = mobile.replace(/^\+91/, '').replace(/\s/g, '');
    await axios.post('https://api.msg91.com/api/v5/otp', {
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile:      `91${mobile10}`,
      authkey:     process.env.MSG91_AUTH_KEY,
      otp,
    });
    logger.info(`OTP SMS sent to ${mobile10}`);
  } catch (err) {
    logger.error('SMS OTP send failed:', err);
    throw err;
  }
}

/* ── Email templates ────────────────────────────────────────── */
export function welcomeEmail(name: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#080C14;color:#EEF2FF;padding:32px;border-radius:16px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="width:40px;height:40px;background:#6366F1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">⚡</div>
        <span style="font-size:22px;font-weight:900">OmniPost</span>
      </div>
      <h1 style="font-size:26px;margin-bottom:8px">Welcome, ${name}! 🎉</h1>
      <p style="color:#8FA3BE;line-height:1.7">Your OmniPost account is ready. Start publishing to all your social media platforms simultaneously.</p>
      <div style="margin:24px 0;padding:16px;background:#101B2E;border-radius:12px;border:1px solid #1C2C44">
        <p style="margin:0 0 8px;font-weight:700">Your 14-day Creator trial includes:</p>
        <ul style="color:#8FA3BE;padding-left:20px;margin:0">
          <li>10 connected social accounts</li>
          <li>Unlimited posts & scheduling</li>
          <li>Advanced analytics</li>
          <li>5 GB media storage</li>
        </ul>
      </div>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:#6366F1;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700">Go to Dashboard →</a>
      <p style="color:#435972;font-size:12px;margin-top:24px">OmniPost India · support@omnipost.in</p>
    </div>
  `;
}

export function postPublishedEmail(name: string, platforms: string[], postText: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#080C14;color:#EEF2FF;padding:32px;border-radius:16px">
      <h2>Your post is live! ✅</h2>
      <p style="color:#8FA3BE">Hi ${name}, your post was successfully published to <strong style="color:#EEF2FF">${platforms.join(', ')}</strong>.</p>
      <div style="margin:16px 0;padding:14px;background:#101B2E;border-radius:10px;border-left:4px solid #6366F1">
        <p style="margin:0;color:#8FA3BE;font-size:13px">${postText.slice(0, 120)}${postText.length > 120 ? '…' : ''}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/analytics" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">View Analytics →</a>
    </div>
  `;
}

export function tokenExpiredEmail(name: string, platform: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#080C14;color:#EEF2FF;padding:32px;border-radius:16px">
      <h2>⚠️ ${platform} needs reconnecting</h2>
      <p style="color:#8FA3BE">Hi ${name}, your ${platform} account token has expired. Please reconnect it to continue publishing.</p>
      <a href="${process.env.FRONTEND_URL}/settings/accounts" style="display:inline-block;background:#F59E0B;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">Reconnect ${platform} →</a>
    </div>
  `;
}

export function passwordResetEmail(name: string, code: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#080C14;color:#EEF2FF;padding:32px;border-radius:16px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <div style="width:40px;height:40px;background:#6366F1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">🔐</div>
        <span style="font-size:22px;font-weight:900">OmniPost</span>
      </div>
      <h1 style="font-size:24px;margin-bottom:8px">Reset your password</h1>
      <p style="color:#8FA3BE;line-height:1.7">Hi ${name}, use the code below to reset your password. It expires in 15 minutes.</p>
      <div style="margin:24px 0;padding:20px;background:#101B2E;border-radius:12px;border:1px solid #1C2C44;text-align:center">
        <span style="font-size:32px;font-weight:900;letter-spacing:8px;color:#6366F1">${code}</span>
      </div>
      <p style="color:#435972;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}

export function invoiceEmail(name: string, plan: string, amount: number, invoiceId: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#080C14;color:#EEF2FF;padding:32px;border-radius:16px">
      <h2>Payment Receipt 🧾</h2>
      <p style="color:#8FA3BE">Hi ${name}, thank you for your payment.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr style="border-bottom:1px solid #1C2C44">
          <td style="padding:10px 0;color:#8FA3BE">Plan</td>
          <td style="padding:10px 0;text-align:right;font-weight:700">${plan}</td>
        </tr>
        <tr style="border-bottom:1px solid #1C2C44">
          <td style="padding:10px 0;color:#8FA3BE">Amount (incl. GST)</td>
          <td style="padding:10px 0;text-align:right;font-weight:700">₹${amount.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#8FA3BE">Invoice ID</td>
          <td style="padding:10px 0;text-align:right;font-size:12px;color:#435972">${invoiceId}</td>
        </tr>
      </table>
      <a href="${process.env.FRONTEND_URL}/billing" style="display:inline-block;background:#6366F1;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">View Billing →</a>
    </div>
  `;
}
