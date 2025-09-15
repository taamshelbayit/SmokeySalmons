import { RESEND_API_KEY, EMAIL_FROM, BRAND_NAME } from './config';
import nodemailer from 'nodemailer';

export async function sendOrderConfirmation(params: {
  to?: string | null;
  orderCode: string;
  summary: string;
}) {
  const subject = `${BRAND_NAME} order ${params.orderCode}`;
  const text = `Thank you for your order ${params.orderCode}!\n\n${params.summary}\n\nWe will deliver on Friday. If you have questions, reply to this email.`;
  const html = basicHtmlTemplate({
    title: `Thank you for your order ${params.orderCode}!`,
    intro: `We received your order and will deliver on Friday.`,
    lines: params.summary.split('\n'),
  });

  if (RESEND_API_KEY) {
    // Lazy import to avoid bundling
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: params.to || EMAIL_FROM,
        subject,
        text,
        html,
      });
    } catch (e) {
      console.error('Resend send failed', e);
    }
    return;
  }

  // Fallback to local dev mailer that logs to console
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to: params.to || EMAIL_FROM,
    subject,
    text,
    html,
  });
  console.log('Email (dev)\n', info.message?.toString());
}

export async function sendAdminNewOrder(params: {
  to?: string;
  orderCode: string;
  customer: string;
  phone: string;
  summary: string;
}) {
  const subject = `[New Order] ${params.orderCode} — ${params.customer}`;
  const text = `New order ${params.orderCode} by ${params.customer} (${params.phone})\n\n${params.summary}`;
  const html = basicHtmlTemplate({
    title: `New order ${params.orderCode}`,
    intro: `${params.customer} · ${params.phone}`,
    lines: params.summary.split('\n'),
  });
  if (RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    try {
      await resend.emails.send({ from: EMAIL_FROM, to: params.to || EMAIL_FROM, subject, text, html });
    } catch (e) {
      console.error('Resend admin send failed', e);
    }
    return;
  }
  const transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
  const info = await transporter.sendMail({ from: EMAIL_FROM, to: params.to || EMAIL_FROM, subject, text, html });
  console.log('Admin Email (dev)\n', info.message?.toString());
}

export async function sendPaymentConfirmation(params: {
  to?: string | null;
  orderCode: string;
  totalILS: number;
  method: string;
}) {
  const subject = `${BRAND_NAME} payment received for ${params.orderCode}`;
  const lines = [
    `Amount: ₪${params.totalILS.toFixed(2)}`,
    `Method: ${params.method}`,
  ];
  const text = `Payment received for order ${params.orderCode}.\n\n${lines.join('\n')}`;
  const html = basicHtmlTemplate({
    title: `Payment received for ${params.orderCode}`,
    intro: `Thank you! We confirmed your payment.`,
    lines,
  });

  if (RESEND_API_KEY) {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);
    try {
      await resend.emails.send({ from: EMAIL_FROM, to: params.to || EMAIL_FROM, subject, text, html });
    } catch (e) {
      console.error('Resend payment send failed', e);
    }
    return;
  }
  const transporter = nodemailer.createTransport({ streamTransport: true, newline: 'unix', buffer: true });
  const info = await transporter.sendMail({ from: EMAIL_FROM, to: params.to || EMAIL_FROM, subject, text, html });
  console.log('Payment Email (dev)\n', info.message?.toString());
}

function basicHtmlTemplate({ title, intro, lines }: { title: string; intro: string; lines: string[] }) {
  return `<!doctype html>
  <html>
    <body style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#111;">
      <div style="max-width: 520px; margin: 0 auto; padding: 24px;">
        <h2 style="margin:0 0 8px 0;">${escapeHtml(title)}</h2>
        <p style="margin:0 0 16px 0; color:#444;">${escapeHtml(intro)}</p>
        <div style="border:1px solid #eee; border-radius:8px;">
          <div style="padding:12px 16px; font-weight:600; background:#fafafa; border-bottom:1px solid #eee;">Summary</div>
          <ul style="margin:0; padding:12px 24px;">
            ${lines.map(l => `<li>${escapeHtml(l)}</li>`).join('')}
          </ul>
        </div>
        <p style="color:#666; font-size:12px; margin-top:16px;">${escapeHtml(BRAND_NAME)} — Thank you!</p>
      </div>
    </body>
  </html>`;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
