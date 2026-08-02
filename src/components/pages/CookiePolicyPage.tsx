'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Cookie, ShieldCheck, BarChart3, Megaphone, Globe, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useAuditStore } from '@/lib/store';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

const cookieTypes = [
  {
    icon: ShieldCheck,
    label: 'Essential Cookies',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    description:
      'These cookies are necessary for the basic operation of LinkHygiene. They enable core functionality such as page navigation, access to secure areas, and remembering your preferences (e.g., theme selection). The Service cannot function properly without these cookies.',
    examples: ['Theme preference (light/dark mode)', 'Session state management', 'CSRF protection tokens'],
  },
  {
    icon: BarChart3,
    label: 'Analytics Cookies',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    description:
      'Analytics cookies help us understand how visitors interact with our Service. They collect information about pages visited, time spent on the Service, error messages encountered, and similar data. This information is aggregated and anonymized — it does not personally identify you.',
    examples: ['Page view counts', 'Feature usage tracking', 'Performance monitoring', 'Error rate analysis'],
  },
  {
    icon: Megaphone,
    label: 'Advertising Cookies',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/50',
    description:
      'Advertising cookies are used to deliver relevant advertisements and measure the effectiveness of ad campaigns. These cookies may be set by us or our advertising partners. They track browsing activity across websites to build a profile of your interests.',
    examples: ['Ad serving and targeting', 'Campaign performance measurement', 'Retargeting and frequency capping'],
  },
];

const sections = [
  {
    id: 'what-are-cookies',
    title: '1. What Are Cookies',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better browsing experience, and supply information to the website owners.
        </p>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Cookies can be &quot;persistent&quot; (remaining on your device until they expire or you delete them) or &quot;session&quot; cookies (deleted automatically when you close your browser). LinkHygiene uses both types to deliver its service.
        </p>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          This Cookie Policy explains how LinkHygiene uses cookies and similar technologies, why we use them, and your choices regarding their use.
        </p>
      </div>
    ),
  },
  {
    id: 'how-we-use-cookies',
    title: '2. How We Use Cookies',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          LinkHygiene uses cookies for the following purposes:
        </p>
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <li><strong className="text-gray-800 dark:text-gray-200">Essential functionality</strong> — To ensure the Service works correctly and securely.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Preferences</strong> — To remember your settings, such as your chosen theme (light or dark mode).</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Analytics</strong> — To understand how visitors use the Service and identify areas for improvement.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Advertising</strong> — To support our free service by displaying relevant advertisements.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'types-of-cookies',
    title: '3. Types of Cookies',
    content: null, // Rendered specially below
  },
  {
    id: 'third-party-cookies',
    title: '4. Third-Party Cookies',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          In addition to our own cookies, LinkHygiene may use cookies set by third-party services. These include:
        </p>
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <li><strong className="text-gray-800 dark:text-gray-200">Analytics providers</strong> — Services that help us understand website usage and performance.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Advertising networks</strong> — Services that deliver and measure advertisements on our behalf.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">AI service providers</strong> — Services that power the AI-driven analysis features of LinkHygiene.</li>
        </ul>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          We do not control these third-party cookies and recommend reviewing the privacy and cookie policies of these providers for more information.
        </p>
      </div>
    ),
  },
  {
    id: 'managing-cookies',
    title: '5. Managing Cookies',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in the following ways:
        </p>
        <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <li><strong className="text-gray-800 dark:text-gray-200">Browser settings</strong> — Most browsers allow you to refuse or delete cookies through their settings. Consult your browser&apos;s help documentation for instructions.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Cookie consent tools</strong> — You may use cookie consent management tools provided by your browser or third-party extensions.</li>
          <li><strong className="text-gray-800 dark:text-gray-200">Opt-out links</strong> — For specific advertising cookies, you may opt out through industry opt-out pages such as the Network Advertising Initiative (NAI) or Digital Advertising Alliance (DAA).</li>
        </ul>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> Disabling essential cookies may affect the functionality of LinkHygiene. Some features may not work as intended without cookies.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'changes-to-policy',
    title: '6. Changes to This Policy',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this page.
        </p>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          We encourage you to review this policy periodically. Your continued use of LinkHygiene after any changes constitutes your acceptance of the updated policy.
        </p>
      </div>
    ),
  },
  {
    id: 'contact',
    title: '7. Contact',
    content: (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          If you have any questions about our use of cookies, please contact us:
        </p>
        <div className="rounded-lg border border-cyan-100 bg-cyan-50/50 p-4 dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">LinkHygiene Team</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Email: privacy@linkhygiene.com</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You can also reach us through our{' '}
            <button
              onClick={() => useAuditStore.getState().setPage('contact')}
              className="text-cyan-600 underline hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              Contact page
            </button>.
          </p>
        </div>
      </div>
    ),
  },
];

export function CookiePolicyPage() {
  const setPage = useAuditStore((s) => s.setPage);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer text-sm text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
                >
                  <button onClick={() => setPage('home')}>Home</button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Cookie Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="mt-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage('home')}
            className="gap-2 text-gray-600 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-md shadow-cyan-200 dark:shadow-cyan-900/30">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Cookie Policy
              </h1>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Last updated: January 2025
              </p>
            </div>
          </div>
          <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-600 to-teal-500" />
        </motion.div>

        {/* AI Disclaimer note */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <Card className="border-cyan-100 bg-cyan-50/40 dark:border-cyan-900/40 dark:bg-cyan-950/15">
            <CardContent className="p-4">
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                <strong>Note:</strong> LinkHygiene is an AI-powered tool. Cookies used by our service and our third-party AI providers help improve the accuracy and relevance of audit results. For full details on data practices, please see our{' '}
                <button
                  onClick={() => useAuditStore.getState().setPage('privacy')}
                  className="font-medium underline hover:text-cyan-600 dark:hover:text-cyan-200"
                >
                  Privacy Policy
                </button>.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Introduction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-8 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
        >
          This Cookie Policy explains how LinkHygiene uses cookies and similar tracking technologies when you visit and use our AI-powered SEO and link audit service. Understanding how we use cookies helps you get the most out of our Service.
        </motion.p>

        {/* Sections (special rendering for cookie types) */}
        {sections.map((section, i) => (
          <motion.section
            key={section.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mt-8"
            aria-labelledby={section.id}
          >
            {section.id === 'types-of-cookies' ? (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 dark:border-gray-800 dark:bg-gray-900/30">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <CardTitle
                      id={section.id}
                      className="text-base font-semibold text-gray-900 dark:text-white"
                    >
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="py-5">
                  <div className="space-y-4">
                    {cookieTypes.map((ct) => (
                      <div
                        key={ct.label}
                        className={`rounded-lg border p-4 ${ct.border} ${ct.bg}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ct.icon className={`h-5 w-5 ${ct.color}`} />
                          <h4 className={`text-sm font-semibold ${ct.color}`}>{ct.label}</h4>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {ct.description}
                        </p>
                        <div className="mt-2.5">
                          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
                            Examples
                          </p>
                          <ul className="ml-4 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {ct.examples.map((ex) => (
                              <li key={ex}>{ex}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4 dark:border-gray-800 dark:bg-gray-900/30">
                  <CardTitle
                    id={section.id}
                    className="text-base font-semibold text-gray-900 dark:text-white"
                  >
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-5">{section.content}</CardContent>
              </Card>
            )}
          </motion.section>
        ))}

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: sections.length * 0.08 + 0.2, duration: 0.45 }}
          className="mt-10 border-t border-gray-200 pt-6 text-center dark:border-gray-800"
        >
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} LinkHygiene. All rights reserved.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPage('home')}
            className="mt-3 gap-1.5 text-xs text-gray-500 hover:text-cyan-600 dark:text-gray-400 dark:hover:text-cyan-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Home
          </Button>
        </motion.div>
      </main>
    </div>
  );
}