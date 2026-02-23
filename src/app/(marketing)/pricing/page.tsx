import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">Storymagic</Link>
          <Link href="/create"><Button size="sm">Create a Book</Button></Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Free to create and preview. Only pay for printed copies.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Softcover 8x8", price: "$24.99", features: ["32 full-color pages", "High-quality paper", "Standard shipping"] },
            { name: "Hardcover 8x8", price: "$34.99", popular: true, features: ["32 full-color pages", "Durable hardcover", "Premium paper", "Standard shipping"] },
            { name: "Hardcover 8x10", price: "$39.99", features: ["32 full-color pages", "Larger format", "Premium quality", "Standard shipping"] },
          ].map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <CardContent className="p-8 pt-10">
                <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
                <p className="font-display text-4xl font-bold text-primary mb-6">{plan.price}</p>
                <ul className="space-y-3 text-sm text-left mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/create" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl p-8 border">
          <h2 className="font-display text-2xl font-bold mb-4">Add-Ons</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-4">
              <p className="font-bold">Rush Processing</p>
              <p className="text-primary font-bold">+$9.99</p>
              <p className="text-sm text-muted-foreground">Priority generation & printing</p>
            </div>
            <div className="p-4">
              <p className="font-bold">Gift Wrapping</p>
              <p className="text-primary font-bold">+$4.99</p>
              <p className="text-sm text-muted-foreground">Beautiful gift-ready packaging</p>
            </div>
            <div className="p-4">
              <p className="font-bold">Audio Narration</p>
              <p className="text-primary font-bold">+$4.99</p>
              <p className="text-sm text-muted-foreground">QR code on book links to narration</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
