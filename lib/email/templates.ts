type EmailTemplateData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function contactFormTemplate(data: EmailTemplateData): string {
  const { name, email, subject, message } = data;
  
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `;
}