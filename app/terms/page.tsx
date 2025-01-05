import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - DontSign",
  description: "Terms of service and usage conditions for DontSign AI Contract Analysis tool"
};

export default function TermsOfService() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 5, 2025</p>
        </div>

        <section className="space-y-6 text-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              Welcome to dontsign.ai! By accessing or using our AI-powered contract analysis service,
              you agree to these Terms of Service and our Privacy Policy. If you're using the service
              on behalf of an organization, you represent that you have the authority to bind that
              organization to these terms.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Eligibility</h2>
            <p>
              You must be at least 18 years old or the age of majority in your jurisdiction to use
              this Service. By using the Service, you represent and warrant that you meet these
              requirements.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Service Description</h2>
            <p>
              Our AI-powered tools analyze contracts to help identify key terms, potential risks,
              and important clauses. While we strive for accuracy, please note:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our analysis is not a substitute for legal advice</li>
              <li>Always consult qualified legal professionals for important decisions</li>
              <li>Analysis results are based on AI interpretation and may require human verification</li>
              <li>The Service does not constitute legal advice</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">4. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ensuring you have the right to upload and analyze submitted contracts</li>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>Using the service only for lawful purposes</li>
            </ul>
            <p className="mt-4">You must not upload:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Documents containing illegal content</li>
              <li>Sensitive or classified information</li>
              <li>Content that violates intellectual property rights</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Intellectual Property</h2>
            <p>
              All content, trademarks, and materials provided through dontsign.ai are owned by or
              licensed to us. You may not copy, modify, or redistribute these materials without our
              express written consent.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Privacy and Data Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You retain all rights to your contracts and documents</li>
              <li>We process your data as described in our{" "}
                <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
              </li>
              <li>Analysis results are confidential and accessible only to you</li>
              <li>We implement industry-standard security measures to protect your data</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Service Limitations</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service availability may vary and maintenance windows may occur</li>
              <li>Analysis speed depends on document complexity and system load</li>
              <li>Some document formats or languages may not be fully supported</li>
              <li>We do not guarantee the accuracy, reliability, or completeness of the analysis</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Fees and Payment</h2>
            <p>
              dontsign.ai is currently free to use. We reserve the right to introduce paid features
              or subscription plans in the future with appropriate notice.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service if you violate these Terms or
              engage in any activity that disrupts or harms the Service or other users.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to Terms</h2>
            <p>
              We may update these terms to reflect service improvements or legal requirements.
              Continued use after changes constitutes acceptance of updated terms. We will notify
              users of significant changes via email or service announcement.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">11. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of
              Delaware, United States, without regard to its conflict of law principles.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Contact</h2>
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
