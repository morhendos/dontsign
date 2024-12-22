import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - DontSign",
  description: "Privacy policy and data handling practices for DontSign AI Contract Analysis tool"
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: December 22, 2024</p>
        </div>

        <section className="space-y-6 text-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Our Commitment to Privacy</h2>
            <p>
              At DontSign, we understand the importance of keeping your contract data private and secure. We specialize in AI-powered contract analysis, and we take our responsibility to protect your information seriously.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Information We Process</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Contract Documents:</strong> The contracts and documents you upload for analysis are processed securely and are never shared with third parties.
              </li>
              <li>
                <strong>Analysis Data:</strong> The results and insights generated from our AI analysis are stored securely and accessible only to you.
              </li>
              <li>
                <strong>Usage Information:</strong> We collect basic usage data to improve our service and ensure security.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Data Security</h2>
            <p>
              Your data is protected using industry-leading security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encryption for all document transfers</li>
              <li>Secure cloud storage with regular security audits</li>
              <li>Strict access controls and authentication</li>
              <li>Automatic data purging after analysis completion</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">AI Processing</h2>
            <p>
              Our AI models are designed with privacy in mind:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Document analysis is performed in isolated environments</li>
              <li>AI models do not retain any contract information</li>
              <li>Analysis results are immediately encrypted</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Rights</h2>
            <p>
              You maintain control over your data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request data deletion at any time</li>
              <li>Export your analysis history</li>
              <li>Access detailed data processing logs</li>
              <li>Opt-out of non-essential data collection</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p>
              For any privacy-related questions or concerns, please contact our Data Protection Officer through our{" "}
              <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
