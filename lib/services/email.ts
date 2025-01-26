import nodemailer from 'nodemailer';
import { contactFormTemplate } from '@/lib/email/templates';

if (!process.env.GMAIL_APP_PASSWORD || !process.env.GMAIL_USER) {
  throw new Error('Gmail credentials are not set in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export type EmailData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export async function sendContactEmail(data: EmailData) {
  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'support@dontsign.ai',
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      html: contactFormTemplate(data),
    });

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
