import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://linkhygiene.com";
const siteName = "LinkHygiene";
const adsenseId = "ca-pub-3167331009919004";
const googleAnalyticsId = "G-25Z437B3PL";
const siteDescription =
  "Free AI-powered SEO & link audit tool. Find every broken link, optimize for Google, ChatGPT, Perplexity, Gemini, and AI Overviews. Crawl up to 70 pages. 100% free, no sign-up required.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Free AI-Powered Website Link & SEO Audit Tool`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  other: {
    "google-adsense-account": adsenseId,
  },
  description: siteDescription,
  keywords: [
    "SEO audit tool",
    "broken link checker",
    "free SEO tool",
    "AI search optimization",
    "AEO answer engine optimization",
    "GEO generative engine optimization",
    "AIO AI overview optimization",
    "SXO search experience optimization",
    "website link checker",
    "link hygiene",
    "schema validator",
    "ChatGPT optimization",
    "Perplexity optimization",
    "Gemini optimization",
    "Google AI Overviews",
    "multi-page SEO audit",
    "crawl website",
    "website health check",
    "malformed link detector",
    "404 link finder",
    "keyword density analyzer",
    "on-page SEO checker",
    "technical SEO audit",
    "site auditor",
  ],
  authors: [{ name: "LinkHygiene Team", url: siteUrl }],
  creator: "LinkHygiene",
  publisher: "LinkHygiene",
  other: {
    ...(adsenseId ? { "google-adsense-account": adsenseId } : {}),
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: `${siteName} - Free AI-Powered Website Link & SEO Audit Tool`,
    description: siteDescription,
    url: siteUrl,
    siteName: siteName,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LinkHygiene - Free AI-Powered SEO Audit Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Free AI-Powered SEO Audit Tool`,
    description: siteDescription,
    images: ["/og-image.png"],
    creator: "@linkhygiene",
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
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0891b2",
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "LinkHygiene",
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      creator: {
        "@type": "Organization",
        name: "LinkHygiene",
        url: siteUrl,
      },
      featureList: [
        "Broken link detection",
        "Multi-page crawl up to 70 pages",
        "SEO score analysis",
        "AEO readiness checks",
        "GEO optimization scoring",
        "AIO overview optimization",
        "SXO experience metrics",
        "Keyword density analysis",
        "Schema validation",
        "AI search engine readiness",
        "CSV and PDF report export",
        "Audit comparison",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is LinkHygiene?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LinkHygiene is a free, AI-powered SEO and link audit tool that analyzes your website's readiness for traditional search engines and AI-powered search engines like ChatGPT, Perplexity, Gemini, and Google AI Overviews.",
          },
        },
        {
          "@type": "Question",
          name: "How many pages can LinkHygiene audit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LinkHygiene can crawl and audit up to 70 pages per scan, discovering internal links from the homepage and analyzing each page for links, SEO, and AI readiness.",
          },
        },
        {
          "@type": "Question",
          name: "Is LinkHygiene free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, LinkHygiene is 100% free with no sign-up required. Simply enter a URL and start your audit.",
          },
        },
        {
          "@type": "Question",
          name: "What SEO scores does LinkHygiene provide?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "LinkHygiene provides 5 core scores: SEO (Search Engine Optimization), AEO (Answer Engine Optimization), GEO (Generative Engine Optimization), AIO (AI Overview Optimization), and SXO (Search Experience Optimization). Each is scored 0-100 with letter grades.",
          },
        },
        {
          "@type": "Question",
          name: "What is AI Search Readiness?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "AI Search Readiness measures how well your site is optimized for AI-powered search engines. This includes having structured data (JSON-LD), FAQ schema, authorship signals, fresh content, semantic HTML elements, and descriptive anchor text.",
          },
        },
      ],
    },
    {
      "@type": "Organization",
      name: "LinkHygiene",
      url: siteUrl,
      logo: `${siteUrl}/icon.png`,
      sameAs: [],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={siteUrl} />
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#f8fafc] text-foreground`}
      >
                <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>

        <Script
          id="google-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          cookieOptions={{
            name: "theme",
            httpOnly: false, // JS needs to read for SSR hydration
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 365 * 24 * 60 * 60, // 1 year
          }}
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
