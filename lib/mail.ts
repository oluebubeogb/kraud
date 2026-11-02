import nodemailer from "nodemailer";
export const smtpOn = () => !!process.env.SMTP_HOST;
/** Dev fallback (console + on-screen phrase) is only allowed when SMTP is empty AND not production. */
export const devMail = () => !smtpOn() && process.env.NODE_ENV !== "production";
let tx: ReturnType<typeof nodemailer.createTransport> | null = null;
export async function sendMail(to: string, subject: string, text: string, attachments?: { filename: string; path: string }[]) {
  if (!smtpOn()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (SMTP_HOST). Contact support.");
    console.log(`\n[kraud:mail:dev] to=${to}\nsubject=${subject}\n${text}\n`); return false;
  }
  tx ??= nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465, auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden"><div style="background:#002454;color:#fff;padding:16px 20px;font-weight:800;font-size:20px">kraud</div><div style="padding:20px;color:#0b1b33;white-space:pre-line;line-height:1.5">${text.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</div><div style="padding:12px 20px;font-size:12px;color:#8A9199">Kraud · Own Together. Grow Together.</div></div>`;
  await tx.sendMail({ from: process.env.SMTP_FROM || "Kraud <no-reply@kraud.ng>", to, subject, text, html, attachments });
  return true;
}
