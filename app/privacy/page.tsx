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
          <p className="text-muted-foreground">Last updated: January 5, 2025</p>
        </div>

        <section className="space-y-6 text-lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Our Commitment to Privacy</h2>
            <p>
              At DontSign, we prioritize your privacy by not collecting or storing any of your data. Our service provides real-time AI-powered contract analysis without any server-side storage of your information.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">2. No Data Collection Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Zero Storage:</strong> We do not collect, store, or share any personal information or contract data.
              </li>
              <li>
                <strong>Real-Time Processing:</strong> Documents are analyzed in real-time and immediately discarded after analysis.
              </li>
              <li>
                <strong>Browser Storage:</strong> Any temporary data is stored only in your browser's local storage, entirely on your device and under your control.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Data Security</h2>
            <p>
              While we don't store your data, we ensure secure processing through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encryption (HTTPS) for all document transfers</li>
              <li>Secure real-time processing without server-side storage</li>
              <li>Immediate data disposal after analysis completion</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Third-Party Services</h2>
            <p>
              We use third-party tools to power our AI analysis. These tools process data solely for the purpose of providing insights, without persistent storage.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Browser Local Storage</h2>
            <p>
              Your browser's local storage may temporarily contain:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Recent analysis results (stored only on your device)</li>
              <li>UI preferences (stored only on your device)</li>
              <li>You can clear this data anytime using your browser's settings</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Future Changes</h2>
            <p>
              If our data practices change, we will update this Privacy Policy and notify users in advance.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Contact Us</h2>
            <p>
              For any privacy-related questions or concerns, please contact us through our{" "}
              <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
