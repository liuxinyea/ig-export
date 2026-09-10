import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}

function PrivacyContent() {
  const t = useTranslations("privacy");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>{t("lastUpdated")}</strong>
          </p>

          <p className="text-gray-600 mb-6">
            IG Export (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, and safeguard your information when you use our
            Chrome extension and website.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section1")}
          </h2>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            1.1 Information You Provide
          </h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>
              Checkout information (email, name and billing details) provided to Dodo Payments
            </li>
            <li>
              Payment information provided directly to Dodo Payments for subscriptions or Lifetime purchases
            </li>
            <li>
              Communications you send to us (support requests, feedback)
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            1.2 Information Collected Automatically
          </h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>License key and activation instance identifier when you activate, validate or deactivate Pro</li>
            <li>A generic activation name identifying this Chrome extension installation</li>
            <li>Technical request information processed by our website hosting provider</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
            1.3 Instagram Data
          </h3>
          <p className="text-gray-600 mb-6">
            <strong>Important:</strong> IG Export is a local-first extension. All
            Instagram data processing happens entirely in your browser. We do not
            collect, store, or transmit any Instagram data to our servers. The
            data you export is saved locally on your device.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section2")}
          </h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To process your subscription payments</li>
            <li>To send you important updates about our service</li>
            <li>To respond to your support requests</li>
            <li>To improve our extension and website</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section3")}
          </h2>
          <p className="text-gray-600 mb-6">
            We implement appropriate security measures to protect your personal
            information. Dodo Payments stores payment and license records. The extension stores your license key and activation identifier in local browser storage. Our licensing API forwards these credentials to Dodo Payments for validation and does not maintain a separate customer database. Your exported Instagram data remains on your device.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section4")}
          </h2>
          <p className="text-gray-600 mb-6">
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>
              <strong>Dodo Payments:</strong> Checkout, payment processing, subscription management and license key delivery (we do not store your credit card information)
            </li>
            <li>
              <strong>Vercel:</strong> Website hosting
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section5")}
          </h2>
          <p className="text-gray-600 mb-6">
            Your local license credentials are removed when you deactivate this browser. Collected Instagram records can be cleared in the extension. Dodo Payments manages retention of payment, subscription and licensing records under its own policies.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section6")}
          </h2>
          <p className="text-gray-600 mb-6">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data</li>
            <li>Object to data processing</li>
            <li>Data portability</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section7")}
          </h2>
          <p className="text-gray-600 mb-6">
            Our service is not intended for children under 13. We do not
            knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section8")}
          </h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page and
            updating the &quot;Last updated&quot; date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section9")}
          </h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Email: privacy@auraflame.tech</li>
            <li>Website: igexport.auraflame.tech</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
