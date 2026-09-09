export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> September 9, 2026
          </p>

          <p className="text-gray-600 mb-6">
            IG Export ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our Chrome extension and website.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1.1 Information You Provide</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Account information (email, name) when you create an account</li>
            <li>Payment information when you subscribe to our Pro plan</li>
            <li>Communications you send to us (support requests, feedback)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1.2 Information Collected Automatically</h3>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Usage data (features used, export frequency, error logs)</li>
            <li>Device information (browser type, operating system)</li>
            <li>Extension version and configuration</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1.3 Instagram Data</h3>
          <p className="text-gray-600 mb-6">
            <strong>Important:</strong> IG Export is a local-first extension. All Instagram data processing happens entirely in your browser. We do not collect, store, or transmit any Instagram data to our servers. The data you export is saved locally on your device.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To process your subscription payments</li>
            <li>To send you important updates about our service</li>
            <li>To respond to your support requests</li>
            <li>To improve our extension and website</li>
            <li>To detect and prevent fraud or abuse</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Data Storage and Security</h2>
          <p className="text-gray-600 mb-6">
            We implement appropriate security measures to protect your personal information. Your account data is stored securely on our servers, while your exported Instagram data remains entirely on your local device.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-600 mb-6">
            We use the following third-party services:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li><strong>Stripe:</strong> Payment processing (we do not store your credit card information)</li>
            <li><strong>Vercel:</strong> Website hosting and analytics</li>
            <li><strong>Google Analytics:</strong> Website usage analytics (anonymized)</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Data Retention</h2>
          <p className="text-gray-600 mb-6">
            We retain your account information for as long as your account is active. If you delete your account, we will delete your personal information within 30 days, except where required by law.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Your Rights</h2>
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

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Children's Privacy</h2>
          <p className="text-gray-600 mb-6">
            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Changes to This Policy</h2>
          <p className="text-gray-600 mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Contact Us</h2>
          <p className="text-gray-600 mb-6">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
            <li>Email: privacy@auraflame.tech</li>
            <li>Website: igexport.auraflame.tech</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">IG Export</h3>
              <p className="text-gray-400">
                The fastest way to export Instagram data for research, marketing, and lead generation.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 IG Export. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
