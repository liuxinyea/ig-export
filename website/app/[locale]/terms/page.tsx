import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}

function TermsContent() {
  const t = useTranslations("terms");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>{t("lastUpdated")}</strong>
          </p>

          <p className="text-gray-600 mb-6">
            Welcome to IG Export. These Terms of Service (&quot;Terms&quot;)
            govern your use of our Chrome extension and website. By using our
            service, you agree to these Terms.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section1")}
          </h2>
          <p className="text-gray-600 mb-6">
            By accessing or using IG Export, you agree to be bound by these Terms
            and our Privacy Policy. If you do not agree to these Terms, please do
            not use our service.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section2")}
          </h2>
          <p className="text-gray-600 mb-6">
            IG Export is a Chrome extension that allows users to export publicly
            available Instagram data for research and marketing purposes. Our
            service includes:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>
              Exporting follower and following lists from public Instagram
              profiles
            </li>
            <li>Exporting data in CSV, JSON, Excel (.xls), HTML and Markdown formats, depending on the interface and plan</li>
            <li>Local collection storage and username deduplication</li>
            <li>License key activation for Pro features</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section3")}
          </h2>
          <p className="text-gray-600 mb-6">
            You agree to use IG Export only for lawful purposes and in
            accordance with these Terms. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Complying with Instagram&apos;s Terms of Service</li>
            <li>Using exported data ethically and legally</li>
            <li>
              Not using the service for spam, harassment, or unauthorized data
              collection
            </li>
            <li>Respecting the privacy and rights of Instagram users</li>
            <li>
              Not attempting to reverse engineer or modify the extension
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section4")}
          </h2>
          <p className="text-gray-600 mb-6">
            IG Export and its original content, features, and functionality are
            owned by us and are protected by international copyright, trademark,
            patent, trade secret, and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section5")}
          </h2>
          <p className="text-gray-600 mb-6">
            Some features of IG Export require a paid subscription. By
            subscribing to our Pro plan:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>You agree to pay the subscription fees</li>
            <li>
              Subscriptions are billed in advance on a monthly, quarterly or yearly basis through Dodo Payments. Lifetime is a one-time purchase
            </li>
            <li>You can manage cancellation through the Dodo Payments customer portal. License validity follows the subscription lifecycle; cancellation and refund effects are determined by the provider status.</li>
            <li>Refunds are available within 30 days of purchase</li>
            <li>
              We reserve the right to change subscription prices with 30 days
              notice
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section6")}
          </h2>
          <p className="text-gray-600 mb-6">
            In no event shall IG Export be liable for any indirect, incidental,
            special, consequential, or punitive damages, including without
            limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Your use or inability to use the service</li>
            <li>Any unauthorized access to or use of our servers</li>
            <li>
              Any interruption or cessation of transmission to or from the
              service
            </li>
            <li>
              Any bugs, viruses, or the like that may be transmitted through the
              service
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section7")}
          </h2>
          <p className="text-gray-600 mb-6">
            IG Export is provided &quot;as is&quot; and &quot;as available&quot;
            without any warranties of any kind, either express or implied. We do
            not warrant that the service will be uninterrupted, timely, secure,
            or error-free.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section8")}
          </h2>
          <p className="text-gray-600 mb-6">
            We reserve the right to modify or replace these Terms at any time.
            If a revision is material, we will try to provide at least 30 days
            notice prior to any new terms taking effect.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
            {t("section9")}
          </h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about these Terms, please contact us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Email: legal@auraflame.tech</li>
            <li>Website: igexport.auraflame.tech</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
