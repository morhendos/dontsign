import nodemailer from 'nodemailer';

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
  const { name, email, subject, message } = data;

  try {
    const result = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'support@dontsign.ai',
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}