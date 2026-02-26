import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "FAQ" };

const FAQ_ITEMS = [
  {
    category: "Creating Your Book",
    questions: [
      {
        q: "How long does it take to create a book?",
        a: "The creation wizard takes about 2 minutes. AI generation takes 3-5 minutes. You'll have a complete book preview in under 10 minutes total.",
      },
      {
        q: "What age range are the books designed for?",
        a: "Our books are designed for children ages 3-8, the picture book sweet spot. The AI adjusts vocabulary and story complexity based on the child's age.",
      },
      {
        q: "What photo should I use?",
        a: "A clear, front-facing photo with good lighting works best. Avoid heavy shadows, sunglasses, or photos where the face is partially hidden.",
      },
      {
        q: "Can I include multiple children in one book?",
        a: "This feature is coming soon! Currently, each book features one child as the main character.",
      },
    ],
  },
  {
    category: "Quality & Content",
    questions: [
      {
        q: "How accurate is the illustrated character?",
        a: "Our AI creates a character that is clearly recognizable as your child — same face shape, hair color, and features — but beautifully rendered in your chosen illustration style.",
      },
      {
        q: "Is the content safe and age-appropriate?",
        a: "Absolutely. Every story goes through an automated safety review checking for age-appropriateness, bias, and content quality before you see it.",
      },
      {
        q: "Can I edit the story?",
        a: "Yes! After generation, you can edit the text on any page and regenerate illustrations (up to 3 times per page) before ordering.",
      },
    ],
  },
  {
    category: "Ordering & Shipping",
    questions: [
      {
        q: "What's the print quality like?",
        a: "We use professional print-on-demand with 300 DPI printing, vibrant colors, and premium paper. Hardcovers are built to last through many bedtime readings.",
      },
      {
        q: "Where do you ship?",
        a: "We ship to over 150 countries worldwide through our printing partner's global fulfillment network.",
      },
      {
        q: "How long does shipping take?",
        a: "Standard shipping is 7-10 business days to most locations. Books are printed at the nearest fulfillment center to minimize transit time.",
      },
      {
        q: "What's your return policy?",
        a: "If there's a print quality issue, we'll reprint and ship a replacement at no cost. Contact us within 30 days of delivery.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">Littletales</Link>
          <Link href="/create"><Button size="sm">Create a Book</Button></Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h1>

        <div className="space-y-12">
          {FAQ_ITEMS.map((section) => (
            <div key={section.category}>
              <h2 className="font-display text-2xl font-bold mb-6">{section.category}</h2>
              <div className="space-y-4">
                {section.questions.map((item, i) => (
                  <details
                    key={i}
                    className="group bg-white rounded-xl border p-6 cursor-pointer"
                  >
                    <summary className="flex items-center justify-between font-semibold list-none">
                      {item.q}
                      <svg
                        className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-4"
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
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-xl border p-8">
          <h2 className="font-display text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">We&apos;d love to help!</p>
          <a href="mailto:hello@littletales.com">
            <Button>Contact Us</Button>
          </a>
        </div>
      </main>
    </div>
  );
}
