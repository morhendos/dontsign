import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact/contact-form";

export const metadata = {
  title: "Contact Us - DontSign",
  description: "Get in touch with the DontSign team for support or inquiries"
};

export default function Contact() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
          <CardDescription>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />

          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4">Other Ways to Reach Us</h3>
            <div className="space-y-4 text-sm">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:support@dontsign.ai" className="text-primary hover:underline">
                  support@dontsign.ai
                </a>
              </p>
              <p>
                <strong>Response Time:</strong> We typically respond within 24 business hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
