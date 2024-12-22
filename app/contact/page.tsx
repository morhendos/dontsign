import { Metadata } from 'next';
import ContactForm from '@/components/contact/contact-form';

export const metadata: Metadata = {
  title: "Contact Us - DontSign",
  description: "Get in touch with the DontSign team for support or inquiries about our AI contract analysis tool"
};

export default function Contact() {
  return (
    <div className="container mx-auto max-w-2xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Have questions about our AI contract analysis? We're here to help!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/50 rounded-lg border shadow-sm">
          <ContactForm />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Other Ways to Reach Us</h2>
          <div className="space-y-2 text-lg">
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@dontsign.ai" className="text-primary hover:underline">
                support@dontsign.ai
              </a>
            </p>
            <p className="text-muted-foreground">
              We typically respond within 24 business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
