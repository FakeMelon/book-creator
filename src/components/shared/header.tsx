"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

interface HeaderProps {
  rightContent?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ rightContent, onBack }: HeaderProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 w-full">
      <div className="px-4 py-4 grid grid-cols-3 items-center">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ms-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label={t("goBack")}
            >
              <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
            </button>
          )}
        </div>
        <Link href="/" className="font-display text-xl font-bold text-primary text-center">
          {t("brand")}
        </Link>
        <div className="flex items-center justify-end gap-4">
          {rightContent}
          <LanguageSwitcher />
          {session?.user ? (
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {session.user.name || t("dashboard")}
            </Link>
          ) : (
            <Link href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}>
              <Button variant="outline" size="sm">
                {t("signIn")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
