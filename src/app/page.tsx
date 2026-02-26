"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    number: "1",
    title: "Tell Us About Your Child",
    description: "Name, age, personality, and favorite things — just 60 seconds.",
    icon: "👶",
  },
  {
    number: "2",
    title: "Upload a Photo",
    description: "One clear face photo. We'll transform it into an illustrated character.",
    icon: "📸",
  },
  {
    number: "3",
    title: "Choose Your Style",
    description: "Pick from 4 gorgeous illustration styles and prose or rhyme.",
    icon: "🎨",
  },
  {
    number: "4",
    title: "AI Creates Your Book",
    description: "In under 5 minutes, get a complete 32-page illustrated story.",
    icon: "✨",
  },
];

const TESTIMONIALS = [
  {
    text: "My daughter screamed 'THAT'S ME!' when she saw herself in the book. Worth every penny.",
    name: "Sarah M.",
    role: "Mom of a 5-year-old",
  },
  {
    text: "The story quality blew me away. It doesn't read like AI — it reads like a real children's book.",
    name: "David K.",
    role: "Dad of twins, age 4",
  },
  {
    text: "I ordered one for each grandchild. They absolutely LOVE seeing themselves as the hero.",
    name: "Linda R.",
    role: "Proud grandma",
  },
];

const FAQ = [
  {
    q: "How long does it take to create a book?",
    a: "The wizard takes about 2 minutes. AI generation takes 3-5 minutes. You'll have a complete book preview in under 10 minutes total.",
  },
  {
    q: "How accurate is the character to my child's photo?",
    a: "Our AI creates an illustrated version that is clearly recognizable as your child — same face shape, hair, and features — but rendered in a beautiful illustration style.",
  },
  {
    q: "How long does shipping take?",
    a: "Standard shipping is 7-10 business days. We print and ship from the nearest fulfillment center worldwide.",
  },
  {
    q: "Can I edit the story after it's generated?",
    a: "Yes! You can edit the text on any page and regenerate illustrations before ordering.",
  },
  {
    q: "Is it safe for kids? What about content moderation?",
    a: "Every story goes through an AI safety review to ensure age-appropriate content. All illustrations are checked for quality and appropriateness.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">
            Littletales
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Link href="/get-started">
              <Button size="sm">Create a Book</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              AI-Powered Personalized Books
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              Your Child as the{" "}
              <span className="text-primary">Star</span> of Their Own Book
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload a photo, choose a theme, and get a beautifully illustrated 32-page hardcover book delivered to your door. Created in under 5 minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started">
                <Button size="xl" className="text-lg px-10">
                  Create Your Book — $24.99
                </Button>
              </Link>
              <Link href="/examples">
                <Button variant="outline" size="xl" className="text-lg px-10">
                  See Examples
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free to create. Only pay when you order a printed copy.
            </p>
          </motion.div>

          {/* Hero image placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 max-w-4xl mx-auto"
          >
            <div className="relative aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary/5 to-rose-100 border shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-8xl mb-4">📖</div>
                <p className="text-lg font-semibold text-muted-foreground">
                  Animated book showcase
                </p>
                <p className="text-sm text-muted-foreground">
                  (Replace with actual book examples)
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From photo to printed book in 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 pt-8">
                    <div className="text-5xl mb-4">{step.icon}</div>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                      {step.number}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">Why Parents Love Littletales</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🪄",
                title: "It Looks Like YOUR Child",
                description: "Our AI transforms their photo into an illustrated character that's recognizably them — not a generic avatar.",
              },
              {
                icon: "📝",
                title: "Story Quality That Surprises",
                description: "Written by Claude AI with the craft of a real children's book author. Parents say they genuinely enjoy reading it aloud.",
              },
              {
                icon: "⚡",
                title: "Ready in Under 5 Minutes",
                description: "No waiting days or weeks. Answer a few questions, upload a photo, and watch your book come to life in real-time.",
              },
              {
                icon: "🎨",
                title: "4 Gorgeous Art Styles",
                description: "From dreamy watercolors to bold modern illustrations. Each style is consistent across all 32 pages.",
              },
              {
                icon: "📦",
                title: "Premium Print Quality",
                description: "Professional hardcover or softcover, printed at 300 DPI with vibrant colors. Ships worldwide.",
              },
              {
                icon: "💝",
                title: "The Perfect Gift",
                description: "Grandparents, aunts, uncles — everyone wants to give the child they love their very own book.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">What Parents Are Saying</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 pt-8">
                    <div className="text-2xl text-primary mb-4">&ldquo;</div>
                    <p className="text-foreground mb-4">{t.text}</p>
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Free to create and preview. Only pay when you order a printed copy.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { type: "Softcover", price: "$24.99", features: ["32 full-color pages", "Premium paper", "Worldwide shipping"] },
              { type: "Hardcover", price: "$34.99", badge: "Most Popular", features: ["32 full-color pages", "Durable hardcover", "Premium paper", "Worldwide shipping"] },
            ].map((plan) => (
              <Card key={plan.type} className={plan.badge ? "border-primary shadow-lg relative" : ""}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {plan.badge}
                  </div>
                )}
                <CardContent className="p-8 pt-10">
                  <h3 className="font-bold text-xl mb-2">{plan.type}</h3>
                  <p className="font-display text-4xl font-bold text-primary mb-6">{plan.price}</p>
                  <ul className="space-y-3 text-sm text-left">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/get-started" className="block mt-6">
                    <Button className="w-full" variant={plan.badge ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold list-none">
                  {item.q}
                  <svg
                    className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-rose-500 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">
            Create a Book They&apos;ll Treasure Forever
          </h2>
          <p className="text-xl text-white/80 mb-8">
            It takes less than 5 minutes. Start for free.
          </p>
          <Link href="/get-started">
            <Button size="xl" variant="secondary" className="text-lg px-10">
              Create Your Book Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">Littletales</h3>
            <p className="text-sm text-white/60">
              AI-powered personalized children&apos;s books that make your child the star.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/get-started" className="hover:text-white">Create a Book</Link></li>
              <li><Link href="/examples" className="hover:text-white">Examples</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="mailto:hello@littletales.com" className="hover:text-white">hello@littletales.com</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} Littletales. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
