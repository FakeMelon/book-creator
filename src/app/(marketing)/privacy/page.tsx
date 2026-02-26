import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Littletales
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-neutral">
        <h1 className="font-display">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: February 24, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Account information:</strong> Name, email address, and password when you create an account</li>
          <li><strong>Guest information:</strong> First name and email address provided during onboarding</li>
          <li><strong>Child information:</strong> Name, age, gender, interests, and personality traits used to personalize the book</li>
          <li><strong>Photos:</strong> Images you upload for character illustration</li>
          <li><strong>Payment information:</strong> Processed securely by our payment provider; we do not store card details</li>
          <li><strong>Usage data:</strong> Pages visited, features used, and interaction patterns</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul>
          <li>Generate personalized stories and illustrations</li>
          <li>Process and fulfill print orders</li>
          <li>Send order updates and notifications</li>
          <li>Improve our AI models and service quality (using anonymized data only)</li>
          <li>Provide customer support</li>
        </ul>

        <h2>3. Data Storage and Security</h2>
        <p>
          Your data is stored on secure servers. Photos and generated book assets are stored in encrypted cloud storage.
          We use industry-standard security measures including encryption in transit (TLS) and at rest to protect your information.
        </p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>AI providers:</strong> For story generation and illustration creation (text prompts only; photos are processed via secure APIs)</li>
          <li><strong>Cloud storage:</strong> For securely storing photos and generated assets</li>
          <li><strong>Payment processing:</strong> For handling transactions securely</li>
          <li><strong>Print fulfillment:</strong> For printing and shipping physical books (receives only the final book PDF and shipping address)</li>
          <li><strong>Email service:</strong> For sending transactional emails</li>
        </ul>

        <h2>5. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management.
          We use localStorage to persist your book creation progress between sessions.
          We do not use third-party tracking cookies.
        </p>

        <h2>6. Children&apos;s Privacy (COPPA)</h2>
        <p>
          Littletales is designed for use by parents and guardians to create books for their children.
          The Service is not directed at children under 13. We do not knowingly collect personal information
          directly from children. All information about children is provided by their parent or legal guardian.
        </p>
        <p>
          Parents may request deletion of their child&apos;s information at any time by contacting us.
        </p>

        <h2>7. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active. Uploaded photos are retained
          for 90 days after book generation to allow for reprints, then automatically deleted.
          You may request earlier deletion at any time.
        </p>

        <h2>8. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of non-essential communications</li>
        </ul>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify registered users of material changes
          via email. The latest version will always be available at this page.
        </p>

        <h2>10. Contact</h2>
        <p>
          For privacy-related questions or to exercise your data rights, contact us at{" "}
          <a href="mailto:hello@littletales.com" className="text-primary hover:underline">hello@littletales.com</a>.
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>.
        </p>
      </main>
    </div>
  );
}
