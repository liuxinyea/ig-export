import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </span>
              <span className="text-lg font-bold">IG Export</span>
            </div>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              {t("brandDescription")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("product")}</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/ig-follower-export-tool" className="hover:text-white transition-colors">
                  {t("tool")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link href="/docs/reference/supported-fields" className="hover:text-white transition-colors">
                  {t("docs")}
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  {t("support")}
                </Link>
              </li>
              <li>
                <a
                  href="https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t("install")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t("legal")}</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>{t("copyright")}</p>
          <p>{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
