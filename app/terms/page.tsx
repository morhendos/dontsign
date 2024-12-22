import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - DontSign",
  description: "Terms of service and usage conditions for DontSign AI Contract Analysis tool"
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: December 22, 2024</p>
        </div>

        <section className="space-y-6 text-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <p>
              DontSign provides AI-powered contract analysis services. By using our service, you agree to these terms and our privacy policy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Service Description</h2>
            <p>
              Our AI-powered tools analyze contracts to help identify key terms, potential risks, and important clauses. While we strive for accuracy, please note:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our analysis is not a substitute for legal advice</li>
              <li>Always consult qualified legal professionals for important decisions</li>
              <li>Analysis results are based on AI interpretation and may require human verification</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensure you have the right to upload and analyze submitted contracts</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Do not attempt to reverse engineer or compromise the service</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Usage</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain all rights to your contracts and documents</li>
              <li>We process your data as described in our{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </li>
              <li>Analysis results are confidential and accessible only to you</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Service Limitations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service availability may vary and maintenance windows may occur</li>
              <li>Analysis speed depends on document complexity and system load</li>
              <li>Some document formats or languages may not be fully supported</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Changes to Terms</h2>
            <p>
              We may update these terms to reflect service improvements or legal requirements. Continued use after changes constitutes acceptance of updated terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p>
              For questions about these terms, please visit our{" "}
              <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
