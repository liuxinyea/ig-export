"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeLabels: Record<string, string> = {
  en: "English",
  zh: "中文",
};

type DropdownKey = "start" | "reference" | "support";
type DropdownItem = { labelKey: string; href: string };

const dropdowns: Record<DropdownKey, { labelKey: string; items: DropdownItem[] }> = {
  start: {
    labelKey: "getStarted",
    items: [
      { labelKey: "getStartedFeatures", href: "/#features" },
      { labelKey: "getStartedQuickStart", href: "/docs/overview/quick-start" },
    ],
  },
  reference: {
    labelKey: "reference",
    items: [
      { labelKey: "referenceSupportedFields", href: "/docs/reference/supported-fields" },
      { labelKey: "referenceTroubleshooting", href: "/docs/reference/troubleshooting" },
    ],
  },
  support: {
    labelKey: "support",
    items: [
      { labelKey: "supportGet", href: "/support" },
      { labelKey: "supportTroubleshooting", href: "/docs/reference/troubleshooting" },
    ],
  },
};

export default function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<DropdownKey | null>(null);

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setLangMenuOpen(false);
  };

  const toggleMenu = (key: DropdownKey) => setOpenMenu((m) => (m === key ? null : key));

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              IG Export
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Pricing (direct) */}
            <Link
              href="/pricing"
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t("pricing")}
            </Link>

            {/* Dropdowns */}
            {(Object.keys(dropdowns) as DropdownKey[]).map((key) => {
              const d = dropdowns[key];
              const isOpen = openMenu === key;
              return (
                <div key={key} className="relative">
                  <button
                    onClick={() => toggleMenu(key)}
                    onBlur={() => setTimeout(() => setOpenMenu((m) => (m === key ? null : m)), 150)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-100 ${
                      isOpen ? "text-blue-700" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t(d.labelKey)}
                    <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isOpen && (
                    <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {d.items.map((item) => (
                        <Link
                          key={item.labelKey}
                          href={item.href as never}
                          onClick={() => setOpenMenu(null)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          {t(item.labelKey)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* IG Follower Export Tool (direct, brand highlight) */}
            <Link
              href="/ig-follower-export-tool"
              className="px-3 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {t("tool")}
            </Link>
          </nav>

          {/* Right side: language switcher + mobile menu */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 150)}
                aria-label="Change language"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <span>{localeLabels[locale]}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => switchLocale(loc)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        locale === loc
                          ? "text-blue-600 bg-blue-50 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {localeLabels[loc]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop CTA */}
            <a
              href="https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              {t("install")}
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-4">
            {/* Pricing */}
            <Link
              href="/pricing"
              className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("pricing")}
            </Link>

            {/* Dropdown groups */}
            {(Object.keys(dropdowns) as DropdownKey[]).map((key) => {
              const d = dropdowns[key];
              return (
                <div key={key}>
                  <div className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {t(d.labelKey)}
                  </div>
                  {d.items.map((item) => (
                    <Link
                      key={item.labelKey}
                      href={item.href as never}
                      className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </div>
              );
            })}

            {/* Tool */}
            <Link
              href="/ig-follower-export-tool"
              className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("tool")}
            </Link>

            {/* CTA */}
            <a
              href="https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2.5 text-sm font-semibold text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("install")}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}