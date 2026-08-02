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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Mail,
  Clock,
  Twitter,
  Github,
  Linkedin,
  Send,
  Home,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Globe,
  Headphones,
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

const contactCards = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'hello@linkhygiene.com',
    description: 'For general inquiries and partnership opportunities.',
    color: 'from-cyan-500 to-teal-600',
  },
  {
    icon: Clock,
    title: 'Response Time',
    detail: 'Within 24–48 hours',
    description: 'We aim to get back to you as quickly as possible.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Globe,
    title: 'Social Links',
    detail: 'Follow us online',
    description: 'Stay updated with tips, updates, and SEO insights.',
    color: 'from-violet-500 to-purple-600',
  },
];

export function ContactPage() {
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
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Get in Touch
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              We&apos;d Love to{' '}
              <span className="bg-gradient-to-r from-cyan-200 via-white to-teal-200 bg-clip-text text-transparent">
                Hear From You
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-cyan-100/90">
              Have a question, suggestion, or partnership idea? Drop us a
              message and we&apos;ll get back to you as soon as we can.
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
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Contact Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeInUp}
            custom={0}
            className="lg:col-span-3"
          >
            <Card className="card-hover-lift">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <CardTitle className="text-xl">Send a Message</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input
                        id="contact-name"
                        placeholder="Your name"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="you@example.com"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input
                      id="contact-subject"
                      placeholder="What's this about?"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-36"
                      disabled
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 text-white hover:from-cyan-700 hover:to-teal-600 shadow-lg shadow-cyan-500/25 sm:w-auto"
                    disabled
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Contact form is coming soon. In the meantime, reach out
                    via email.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="space-y-6 lg:col-span-2"
          >
            {contactCards.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.title} variants={fadeInUp} custom={index}>
                  <Card className="card-hover-lift h-full">
                    <CardContent className="pt-0">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-white shadow-md`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                          <p className="mt-0.5 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                            {item.detail}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Social Links Card */}
            <motion.div variants={fadeInUp} custom={3}>
              <Card className="card-hover-lift">
                <CardContent className="pt-0">
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Connect With Us</h3>
                  <div className="flex gap-3">
                    {[
                      { icon: Twitter, label: 'Twitter' },
                      { icon: Github, label: 'GitHub' },
                      { icon: Linkedin, label: 'LinkedIn' },
                    ].map((social) => {
                      const SocialIcon = social.icon;
                      return (
                        <button
                          key={social.label}
                          type="button"
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 dark:hover:bg-cyan-950/30 dark:hover:text-cyan-400 dark:hover:border-cyan-800"
                          aria-label={social.label}
                        >
                          <SocialIcon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Disclaimer */}
      <section className="border-t bg-muted/30 py-12 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-4">
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
                      LinkHygiene uses AI technology to analyze and audit
                      websites. While we strive for accuracy and continuously
                      improve our models, AI-generated audit results may
                      contain errors or incomplete information. The scores,
                      suggestions, and findings provided are intended as
                      helpful guidance and should not be treated as
                      definitive professional SEO advice. Please verify
                      critical findings independently before making
                      significant changes to your website or SEO strategy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                <div className="flex items-center justify-center gap-2">
                  <Headphones className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Need Something Else?
                  </h2>
                </div>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Check out our support page for answers to frequently asked
                  questions, or head back home to start a new audit.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setPage('support')}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    View FAQ
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white hover:from-cyan-700 hover:to-teal-600 shadow-lg shadow-cyan-500/25"
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
    </div>
  );
}