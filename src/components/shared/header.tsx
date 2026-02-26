"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ rightContent, onBack }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="px-4 py-4 grid grid-cols-3 items-center">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
        <Link href="/" className="font-display text-xl font-bold text-primary text-center">
          Littletales
        </Link>
        <div className="flex items-center justify-end gap-4">
          {rightContent}
          {session?.user ? (
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {session.user.name || "Dashboard"}
            </Link>
          ) : (
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
