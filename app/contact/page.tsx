import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
          <form action="/api/contact" className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  required
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Send Message
              </Button>
            </div>
          </form>

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
