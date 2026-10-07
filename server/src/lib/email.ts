import nodemailer, { type Transporter } from "nodemailer";

// Without SMTP settings, codes are printed to the terminal instead (for local dev).

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT ?? 587);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendVerificationEmail(to: string, code: string): Promise<void> {
  const t = getTransporter();

  if (!t) {
    console.log(
      [
        "",
        "┌──────────────────────────────────────────────┐",
        "│  EMAIL (not sent, SMTP isn't set up)         │",
        `│  To:   ${to.padEnd(38)}│`,
        `│  Code: ${code.padEnd(38)}│`,
        "└──────────────────────────────────────────────┘",
        "",
      ].join("\n"),
    );
    return;
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: `${code} is your Dorm Kitchen code`,
    text: `Your Dorm Kitchen verification code is ${code}.\n\nIt expires in 15 minutes. If you didn't create an account, you can ignore this email.`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: auto; padding: 24px; color: #1d2a24">
        <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #5d6b64; margin: 0">Dorm Kitchen</p>
        <h1 style="font-size: 22px; margin: 8px 0 16px">Confirm your email</h1>
        <p style="margin: 0 0 12px">Enter this code to finish creating your account:</p>
        <p style="font-family: monospace; font-size: 32px; letter-spacing: 8px; font-weight: bold; background: #dcefe2; color: #2f7d4f; padding: 12px 16px; border-radius: 8px; text-align: center; margin: 0 0 16px">${code}</p>
        <p style="font-size: 13px; color: #5d6b64; margin: 0">It expires in 15 minutes. If you didn't create an account, you can ignore this email.</p>
      </div>`,
  });
}
