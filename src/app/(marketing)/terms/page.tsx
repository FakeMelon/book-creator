import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Storymagic
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-neutral">
        <h1 className="font-display">Terms of Use</h1>
        <p className="text-muted-foreground">Last updated: February 24, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Storymagic (&quot;the Service&quot;), you agree to be bound by these Terms of Use.
          If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>2. Service Description</h2>
        <p>
          Storymagic is an AI-powered platform that creates personalized children&apos;s books.
          Users provide information about their child, upload photos, and our AI generates a custom illustrated storybook
          that can be previewed digitally and ordered as a printed book.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          You may begin creating a book as a guest. To save your work, order prints, or access your dashboard,
          you must create an account. You are responsible for maintaining the security of your account credentials.
        </p>

        <h2>4. Content Ownership</h2>
        <p>
          You retain ownership of all photos and personal information you provide. The generated stories and illustrations
          are created for your personal use. You receive a non-exclusive, perpetual license to use, print, and share
          your generated books for personal, non-commercial purposes.
        </p>
        <p>
          Storymagic retains the right to use anonymized, non-identifiable data to improve our AI models and service quality.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Upload content that is harmful, offensive, or violates any laws</li>
          <li>Use the Service to create content that is inappropriate for children</li>
          <li>Attempt to reverse-engineer or abuse our AI systems</li>
          <li>Resell or commercially distribute generated books without permission</li>
          <li>Upload photos of children without parental or legal guardian consent</li>
        </ul>

        <h2>6. Payments and Refunds</h2>
        <p>
          Book creation and preview are free. Payment is required only when ordering a printed copy.
          All payments are processed securely through our payment provider. Refunds are available for
          print quality issues within 30 days of delivery. Digital previews are non-refundable.
        </p>

        <h2>7. Content Moderation</h2>
        <p>
          All generated stories undergo AI safety review to ensure age-appropriate content.
          We reserve the right to reject or modify content that violates our content policies.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          The Service is provided &quot;as is&quot; without warranties of any kind. Storymagic shall not be liable for
          any indirect, incidental, or consequential damages arising from your use of the Service.
          Our total liability shall not exceed the amount you paid for the specific order in question.
        </p>

        <h2>9. Privacy</h2>
        <p>
          Your use of the Service is also governed by our{" "}
          <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
          which describes how we collect, use, and protect your information.
        </p>

        <h2>10. Termination</h2>
        <p>
          We may suspend or terminate your access to the Service at any time for violation of these terms.
          You may delete your account at any time. Upon termination, your stored data will be deleted
          in accordance with our Privacy Policy.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may update these Terms of Use from time to time. We will notify registered users of material changes
          via email. Continued use of the Service after changes constitutes acceptance of the updated terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these terms, contact us at{" "}
          <a href="mailto:hello@storymagic.com" className="text-primary hover:underline">hello@storymagic.com</a>.
        </p>
      </main>
    </div>
  );
}
