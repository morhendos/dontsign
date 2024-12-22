import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Service - DontSign",
  description: "Terms of service and usage conditions for DontSign Contract Analysis tool"
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using DontSign, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </p>

          <h2>2. Service Description</h2>
          <p>
            DontSign provides AI-powered contract analysis services. While we strive for accuracy,
            our analysis should not be considered legal advice. Always consult with qualified legal
            professionals for important decisions.
          </p>

          <h2>3. User Responsibilities</h2>
          <p>
            You agree to:
          </p>
          <ul>
            <li>Provide accurate information</li>
            <li>Maintain confidentiality of your account</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not attempt to circumvent any security measures</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            You retain rights to your contracts and documents. You grant us a limited license to
            process and analyze them for providing our services.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            DontSign is provided "as is" without warranties. We are not liable for any damages
            arising from your use of the service or any decisions made based on our analysis.
          </p>

          <h2>6. Data Processing</h2>
          <p>
            We process your data in accordance with our{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            By using our service, you consent to such processing.
          </p>

          <h2>7. Service Modifications</h2>
          <p>
            We reserve the right to modify or discontinue the service at any time, with or
            without notice.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where DontSign is registered,
            without regard to its conflict of law provisions.
          </p>

          <h2>9. Contact</h2>
          <p>
            For any questions about these Terms, please{" "}
            <a href="/contact" className="text-primary hover:underline">contact us</a>.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: December 22, 2024
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
