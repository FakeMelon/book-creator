import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Examples" };

const EXAMPLES = [
  {
    title: "Luna's Enchanted Garden",
    child: "Luna, age 5",
    theme: "Enchanted Forest",
    style: "Watercolor Whimsy",
    description: "Luna discovers a hidden garden where flowers sing and butterflies tell stories.",
  },
  {
    title: "Captain Max and the Star Map",
    child: "Max, age 7",
    theme: "Space",
    style: "Bright & Bold",
    description: "Max pilots a rocket ship through the solar system, making friends on every planet.",
  },
  {
    title: "Mia's Underwater Orchestra",
    child: "Mia, age 4",
    theme: "Underwater",
    style: "Cozy & Warm",
    description: "Mia dives beneath the waves to conduct a concert with her sea creature friends.",
  },
  {
    title: "The Brave Adventures of Ethan",
    child: "Ethan, age 6",
    theme: "Adventure",
    style: "Storybook Classic",
    description: "Ethan climbs the tallest mountain, crosses the widest river, and discovers the greatest treasure of all.",
  },
  {
    title: "Sophie and the Dragon's Secret",
    child: "Sophie, age 5",
    theme: "Fairy Tale",
    style: "Watercolor Whimsy",
    description: "Sophie befriends a shy dragon who needs help finding his voice.",
  },
  {
    title: "Dino Day with Daniel",
    child: "Daniel, age 3",
    theme: "Dinosaurs",
    style: "Bright & Bold",
    description: "Daniel wakes up to find a friendly dinosaur in his backyard — and the adventure begins!",
  },
];

export default function ExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">Littletales</Link>
          <Link href="/get-started"><Button size="sm">Create a Book</Button></Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">Example Books</h1>
          <p className="text-lg text-muted-foreground">
            See what Littletales can create. Every book is unique!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXAMPLES.map((book) => (
            <Card key={book.title} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-rose-50 flex items-center justify-center">
                <div className="text-7xl">📖</div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg mb-1">{book.title}</h3>
                <p className="text-sm text-primary font-medium mb-2">{book.child}</p>
                <p className="text-sm text-muted-foreground mb-3">{book.description}</p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-muted">{book.theme}</span>
                  <span className="px-2 py-1 rounded-full bg-muted">{book.style}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="font-display text-2xl font-bold mb-4">
            Ready to Create Your Own?
          </h2>
          <Link href="/get-started">
            <Button size="xl">Create Your Book Now</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
