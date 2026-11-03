import nodemailer from "nodemailer";
import { appUrl } from "./db";
export const smtpOn = () => !!process.env.SMTP_HOST;
/** Dev fallback (console + on-screen phrase) is only allowed when SMTP is empty AND not production. */
export const devMail = () => !smtpOn() && process.env.NODE_ENV !== "production";
let tx: ReturnType<typeof nodemailer.createTransport> | null = null;
export async function sendMail(to: string, subject: string, text: string, attachments?: { filename: string; path: string }[], cta?: { label: string; url: string }) {
  if (!smtpOn()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (SMTP_HOST). Contact support.");
    console.log(`\n[kraud:mail:dev] to=${to}\nsubject=${subject}\n${text}\n`); return false;
  }
  tx ??= nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
  const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
  const base = appUrl();
  const body = esc(cta ? text.split(cta.url).join("").replace(/\n(Or open:|Open:)?\s*\n/g, "\n\n") : text).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" style="color:#1F7A72;font-weight:600;text-decoration:none">Open link →</a>`);
  const btn = cta ? `<div style="padding:4px 24px 22px"><a href="${esc(cta.url)}" style="display:inline-block;background:#1F7A72;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">${esc(cta.label)}</a><div style="margin-top:10px;font-size:11px;color:#8A9199">Button not working? <a href="${esc(cta.url)}" style="color:#1F7A72;text-decoration:underline">Use this link</a></div></div>` : "";
  const html = `<div style="background:#F7F8FA;padding:24px 12px"><div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden"><div style="background:linear-gradient(135deg,rgba(36,156,132,.10),rgba(72,120,180,.10));padding:18px 24px"><img src="${base}/logo.png" alt="Kraud" height="28" style="height:28px;display:block;border:0" /></div><div style="padding:22px 24px;color:#0b1b33;white-space:pre-line;line-height:1.55;font-size:14px">${body}</div>${btn}<div style="padding:12px 20px;font-size:12px;color:#8A9199">Kraud · Own Together. Grow Together.</div></div>`;
  await tx.sendMail({ from: process.env.SMTP_FROM || "Kraud <no-reply@kraud.ng>", to, subject, text, html, attachments });
  return true;
}
