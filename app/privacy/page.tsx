import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Privacy Policy - DontSign",
  description: "Privacy policy and data handling practices for DontSign Contract Analysis tool"
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <h2>Introduction</h2>
          <p>
            At DontSign, we take your privacy seriously. This Privacy Policy describes how we collect, use,
            and protect your personal information when you use our contract analysis service.
          </p>

          <h2>Information We Collect</h2>
          <p>
            When you use DontSign, we collect:
          </p>
          <ul>
            <li>Contract documents you upload for analysis</li>
            <li>Usage data and analytics</li>
            <li>Technical information about your device and browser</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>
            We use your information to:
          </p>
          <ul>
            <li>Provide contract analysis services</li>
            <li>Improve our service</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your data:
          </p>
          <ul>
            <li>Encryption in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and monitoring</li>
            <li>Secure data deletion practices</li>
          </ul>

          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data correction</li>
            <li>Request data deletion</li>
            <li>Object to data processing</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our{" "}
            <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>

          <h2>Updates to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page.
          </p>

          <p className="text-sm text-muted-foreground mt-8">
            Last updated: December 22, 2024
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
