'use client';

import { motion } from 'framer-motion';
import { useAuditStore } from '@/lib/store';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Home,
  HelpCircle,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  FileText,
  Database,
  BarChart3,
  DollarSign,
  AlertTriangle,
  Download,
  Wrench,
  Globe,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const faqs = [
  {
    icon: FileText,
    question: 'How many pages can I audit?',
    answer:
      'LinkHygiene can crawl and audit up to 70 pages per session. This includes the starting URL and up to 69 additional pages discovered through internal links. We set this limit to keep the tool responsive and free for all users. For most small-to-medium websites, this covers the most important pages that impact SEO performance.',
  },
  {
    icon: Database,
    question: 'Is my data stored?',
    answer:
      'No. All audit data is stored only in your current browser session and is never sent to our servers or any third-party service. When you close the tab or navigate away, the session data is cleared. Your privacy is our top priority — we don\'t track, store, or share any information about the websites you audit.',
  },
  {
    icon: BarChart3,
    question: 'What does each score mean?',
    answer: (
      <div className="space-y-3">
        <div>
          <strong className="text-foreground">SEO (Search Engine Optimization):</strong>{' '}
          <span className="text-muted-foreground">
            Measures how well your page follows traditional SEO best practices — title tags, meta descriptions, heading structure, image alt text, canonical URLs, HTTPS, and more.
          </span>
        </div>
        <div>
          <strong className="text-foreground">AEO (Answer Engine Optimization):</strong>{' '}
          <span className="text-muted-foreground">
            Evaluates how well your content is structured to be selected as a direct answer by voice assistants and featured snippet boxes.
          </span>
        </div>
        <div>
          <strong className="text-foreground">GEO (Generative Engine Optimization):</strong>{' '}
          <span className="text-muted-foreground">
            Assesses your content\'s readiness for AI-generated search results, including how well it might be cited by generative AI search engines like Google\'s AI Overviews.
          </span>
        </div>
        <div>
          <strong className="text-foreground">AIO (AI Overview Optimization):</strong>{' '}
          <span className="text-muted-foreground">
            Specifically focuses on optimization for Google\'s AI Overviews feature, checking content quality, authority signals, and structured data that help AI systems understand and reference your pages.
          </span>
        </div>
        <div>
          <strong className="text-foreground">SXO (Search Experience Optimization):</strong>{' '}
          <span className="text-muted-foreground">
            A holistic score combining SEO with user experience factors — page speed indicators, mobile responsiveness signals, content readability, and overall search-result engagement potential.
          </span>
        </div>
      </div>
    ),
  },
  {
    icon: DollarSign,
    question: 'Why is it free?',
    answer:
      'LinkHygiene is supported by non-intrusive advertising displayed alongside your audit results. This ad-supported model allows us to provide powerful, professional-grade SEO tools at zero cost. There are no premium plans, no hidden fees, and no feature restrictions. Our goal is to make SEO accessible to everyone — from indie developers and bloggers to small businesses and students.',
  },
  {
    icon: AlertTriangle,
    question: 'How accurate are the results?',
    answer:
      'LinkHygiene uses advanced AI models to analyze your website content, structure, and links. While our models are continuously improved and generally provide highly actionable insights, AI-generated analysis may occasionally contain errors, false positives, or miss certain issues. We strongly recommend using LinkHygiene as a powerful starting point and verifying critical findings with other tools or manual inspection before making significant changes to your website.',
  },
  {
    icon: Download,
    question: 'Can I export results?',
    answer:
      'Yes! Once your audit is complete, you can export the full results in two formats: CSV (for easy spreadsheet analysis and filtering) and PDF (for sharing with clients or team members). Both export options are available for free and include all scores, issues, link data, and AI readiness checks.',
  },
  {
    icon: Wrench,
    question: 'How do I fix issues found?',
    answer:
      'Every issue discovered during an audit includes three key pieces of information to help you fix it: "What It Is" (a clear explanation of the problem), "Why It Matters" (the SEO or user-experience impact), and "How to Fix It" (specific, actionable steps you can take). This structured guidance makes it easy to prioritize and resolve issues, even if you\'re new to SEO.',
  },
  {
    icon: Globe,
    question: 'Does it work with any website?',
    answer:
      'LinkHygiene can audit any publicly accessible website. Simply paste the URL and start the audit. Note that some websites may block automated crawlers or have server configurations that limit access. Sites behind authentication (login-required pages), intranets, or localhost URLs cannot be audited since they are not publicly accessible.',
  },
];

export function SupportPage() {
  const setPage = useAuditStore((s) => s.setPage);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-800 px-4 py-16 sm:py-24 dark:from-cyan-900 dark:via-cyan-950 dark:to-teal-950">
        <div className="hero-mesh absolute inset-0" />
        <div className="hero-grid absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="secondary"
              className="mb-4 bg-white/15 text-cyan-100 backdrop-blur-sm border-white/20"
            >
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" />
              Help &amp; FAQ
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              How Can We{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-teal-200 bg-clip-text text-transparent">
                Help You?
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100/90">
              Find answers to common questions about LinkHygiene, how it
              works, and how to get the most out of your audits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400"
                onClick={() => setPage('home')}
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Support</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* FAQ Section */}
      <section className="mx-auto max-w-3xl px-4 pb-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeInUp}
          custom={0}
          className="text-center"
        >
          <Badge variant="outline" className="mb-4 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything You Need to{' '}
            <span className="gradient-text">Know</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Scroll down to
            contact our team directly.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          variants={staggerContainer}
          className="mt-10"
        >
          <Card className="card-hover-lift overflow-hidden">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => {
                  const Icon = faq.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      custom={index}
                    >
                      <AccordionItem
                        value={`faq-${index}`}
                        className="px-6"
                      >
                        <AccordionTrigger className="text-left text-[15px] font-medium hover:no-underline">
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Still Need Help */}
      <section className="border-t bg-muted/30 py-16 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            custom={0}
          >
            <Card className="card-hover-lift border-cyan-100 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/80 to-teal-50/80 dark:from-cyan-950/30 dark:to-teal-950/30">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/20">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl text-gray-900 dark:text-white">
                  Still Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mx-auto max-w-lg text-muted-foreground">
                  Couldn&apos;t find the answer you were looking for? Our team
                  is happy to help with any questions about LinkHygiene, your
                  audit results, or SEO in general.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white hover:from-cyan-700 hover:to-teal-600 shadow-lg shadow-cyan-500/25"
                    onClick={() => setPage('contact')}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setPage('home')}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="border-t py-12 dark:border-gray-800">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            custom={0}
          >
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20">
              <CardContent className="pt-0">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                      AI-Powered Service Disclaimer
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-300/80">
                      LinkHygiene uses AI technology to power its analysis
                      engine. While we continuously refine our models and
                      strive for accuracy, AI-generated audit results may
                      contain errors, false positives, or incomplete
                      information. Scores and suggestions are provided as
                      helpful guidance — not as definitive professional SEO
                      advice. Always verify critical findings independently
                      before making significant changes to your website or
                      SEO strategy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}