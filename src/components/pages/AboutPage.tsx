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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Brain,
  Search,
  Globe,
  Lock,
  Code2,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  Home,
  Zap,
  Cpu,
  Layers,
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
  visible: { transition: { staggerChildren: 0.1 } },
};

const differentiators = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description:
      'Advanced artificial intelligence that goes beyond simple checks — analyzing content structure, semantic markup, and AI search readiness to give you actionable insights.',
    badge: 'Core Feature',
  },
  {
    icon: Search,
    title: 'Multi-Engine Optimization',
    description:
      'Comprehensive scoring across Google, Bing, and Yahoo search engines. Understand how your site performs across different search ecosystems from a single audit.',
    badge: 'Unique',
  },
  {
    icon: Lock,
    title: '100% Free',
    description:
      'No hidden fees, no premium tiers, no feature gates. Every tool, every score, every insight — completely free for everyone, forever.',
    badge: 'Always Free',
  },
  {
    icon: Globe,
    title: 'No Sign-Up Required',
    description:
      'Just paste a URL and hit audit. No account creation, no email verification, no friction. Start improving your site in seconds.',
    badge: 'Zero Friction',
  },
];

const techStack = [
  {
    icon: Cpu,
    label: 'AI / LLM Analysis',
    detail: 'Powered by large language models for natural language understanding of page content, meta tags, and structured data.',
  },
  {
    icon: Layers,
    label: 'Modern Web Crawler',
    detail: 'A high-performance crawler built for speed, capable of auditing up to 70 pages per session with intelligent link discovery.',
  },
  {
    icon: Zap,
    label: 'Real-Time Scoring',
    detail: 'Multi-dimensional scoring engine computing SEO, AEO, GEO, AIO, and SXO scores simultaneously as pages are crawled.',
  },
  {
    icon: ShieldCheck,
    label: 'Privacy-First Design',
    detail: 'All data stays in your browser session. Nothing is stored on our servers, nothing is shared with third parties.',
  },
];

export function AboutPage() {
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
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              About LinkHygiene
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Making the Web{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-teal-200 bg-clip-text text-transparent">
                Healthier
              </span>
              ,{' '}
              <br className="hidden sm:block" />
              One Link at a Time
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100/90">
              LinkHygiene is a free, AI-powered SEO and link audit tool built
              to help website owners, developers, and marketers understand and
              improve their online presence — no sign-up required.
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
              <BreadcrumbPage>About</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Our Mission */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeInUp}
          custom={0}
          className="text-center"
        >
          <Badge variant="outline" className="mb-4 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Our Mission
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Democratizing SEO for{' '}
            <span className="gradient-text">Everyone</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            We believe that powerful SEO tools shouldn&apos;t be locked behind
            expensive paywalls. Every website owner — from solo bloggers to
            enterprise teams — deserves access to deep, actionable insights
            about their site&apos;s health and search visibility.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeInUp}
          custom={1}
          className="mt-10"
        >
          <Card className="card-hover-lift border-cyan-100 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/50 to-teal-50/50 dark:from-cyan-950/20 dark:to-teal-950/20">
            <CardContent className="pt-0">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/20">
                  <Search className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    From Broken Links to AI Readiness
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    LinkHygiene started as a simple broken-link checker and
                    evolved into a comprehensive audit platform. Today, it
                    evaluates your site across five key dimensions —{' '}
                    <strong className="text-foreground">SEO</strong>,{' '}
                    <strong className="text-foreground">AEO</strong>{' '}
                    (Answer Engine Optimization),{' '}
                    <strong className="text-foreground">GEO</strong>{' '}
                    (Generative Engine Optimization),{' '}
                    <strong className="text-foreground">AIO</strong>{' '}
                    (AI Overview Optimization), and{' '}
                    <strong className="text-foreground">SXO</strong>{' '}
                    (Search Experience Optimization) — giving you a
                    360-degree view of your site&apos;s performance in the
                    age of AI search.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={fadeInUp}
          custom={2}
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/30"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>AI-Powered, Human-Verified:</strong> LinkHygiene uses
              advanced AI models to analyze your website and generate audit
              results. While we strive for accuracy, AI-generated analysis
              may occasionally contain errors or oversights. We recommend
              verifying critical findings independently before making
              significant changes to your website.
            </p>
          </div>
        </motion.div>
      </section>

      {/* What Makes Us Different */}
      <section className="border-t bg-muted/30 py-16 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            custom={0}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              What Makes Us Different
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built Different,{' '}
              <span className="gradient-text">Built Better</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Four pillars that set LinkHygiene apart from every other SEO
              tool on the market.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-12 grid gap-6 sm:grid-cols-2"
          >
            {differentiators.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeInUp} custom={index}>
                  <Card className="card-hover-lift h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="mt-1 w-fit text-xs font-medium text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800"
                      >
                        {item.badge}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* The Team */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            custom={0}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
              <Users className="mr-1.5 h-3.5 w-3.5" />
              The Team
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built by Developers Who{' '}
              <span className="gradient-text">Love the Web</span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              LinkHygiene is created and maintained by a small team of web
              developers, SEO enthusiasts, and AI researchers who share a
              common passion: making the internet a better, more accessible
              place.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            custom={1}
            className="mt-12"
          >
            <Card className="card-hover-lift">
              <CardContent className="pt-0">
                <div className="grid gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40">
                      <Code2 className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Open Source at Heart</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We build in the open, leveraging the best open-source
                      tools and contributing back to the community.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40">
                      <Brain className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI-First Thinking</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We&apos;re at the forefront of AI-driven SEO,
                      continuously evolving our models as search engines
                      integrate more AI capabilities.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-900/40 dark:to-teal-900/40">
                      <Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Community Driven</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your feedback shapes our roadmap. Every feature starts
                      with a real user need and is refined through community
                      input.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Technology */}
      <section className="border-t bg-muted/30 py-16 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
            custom={0}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800">
              <Cpu className="mr-1.5 h-3.5 w-3.5" />
              Technology
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Powering the{' '}
              <span className="gradient-text">Next Generation</span> of SEO
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              A modern tech stack designed for speed, accuracy, and
              reliability.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="mt-12 grid gap-6 sm:grid-cols-2"
          >
            {techStack.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} variants={fadeInUp} custom={index}>
                  <Card className="card-hover-lift h-full">
                    <CardContent className="pt-0">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Back to Home */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            custom={0}
          >
            <Card className="card-hover-lift border-cyan-100 dark:border-cyan-900/50 bg-gradient-to-br from-cyan-50/80 to-teal-50/80 dark:from-cyan-950/30 dark:to-teal-950/30">
              <CardContent className="pt-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                  Ready to Audit Your Site?
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Jump back to the homepage and start your free SEO &amp;
                  link audit in seconds.
                </p>
                <Button
                  size="lg"
                  className="mt-6 bg-gradient-to-r from-cyan-600 to-teal-500 text-white hover:from-cyan-700 hover:to-teal-600 shadow-lg shadow-cyan-500/25"
                  onClick={() => setPage('home')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}