import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://igexport.auraflame.tech";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";

  const title = isZh
    ? "IG Export — Instagram 粉丝导出工具 | 导出 CSV/JSON/Excel"
    : "IG Export — Export Instagram Followers to CSV, JSON & Excel";
  const description = isZh
    ? "本地优先的 Chrome 扩展，一键导出 Instagram 粉丝和关注列表到 CSV、JSON、Excel。数据不出浏览器，适用于营销、调研和获客。"
    : "Local-first Chrome extension to export Instagram followers & following lists to CSV, JSON and Excel. Your data never leaves your browser. Built for marketing, research and lead generation.";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s | IG Export",
    },
    description,
    applicationName: "IG Export",
    keywords: isZh
      ? [
          "Instagram 粉丝导出",
          "Instagram 导出粉丝 CSV",
          "导出 Instagram 关注列表",
          "Instagram 数据导出 Excel",
          "Instagram 获客工具",
          "ins 粉丝导出",
          "Instagram 数据采集",
          "外贸获客 Instagram",
          "Instagram 潜客开发",
          "Chrome 扩展",
        ]
      : [
          "instagram followers export",
          "export instagram followers csv",
          "instagram following list export",
          "instagram followers to excel",
          "instagram data export tool",
          "instagram scraper chrome extension",
          "instagram lead generation tool",
          "export instagram followers free",
          "instagram audience research tool",
          "instagram prospect list",
        ],
    authors: [{ name: "IG Export" }],
    creator: "IG Export",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "en": `${SITE_URL}/en`,
        "zh": `${SITE_URL}/zh`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "IG Export",
      locale: isZh ? "zh_CN" : "en_US",
      url: `${SITE_URL}/${locale}`,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
