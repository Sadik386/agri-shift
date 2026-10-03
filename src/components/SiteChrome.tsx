import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  ChartColumn,
  Earth,
  FlaskConical,
  Languages,
  LogIn,
  Map,
  Menu,
  MessageCircle,
  Satellite,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const NAV = [
  { to: "/globe", labelEn: "Globe", labelBn: "গ্লোব", icon: Earth },
  { to: "/heatmap", labelEn: "Heatmap", labelBn: "হিটম্যাপ", icon: Map },
  { to: "/compare", labelEn: "Compare", labelBn: "তুলনা", icon: ChartColumn },
  { to: "/kids", labelEn: "For Kids", labelBn: "শিশুদের জন্য", icon: FlaskConical },
  { to: "/chat", labelEn: "Ask AgriShift", labelBn: "এগ্রিশিফটকে জিজ্ঞেস করুন", icon: MessageCircle },
  { to: "/about", labelEn: "Data & Methods", labelBn: "উপাত্ত ও পদ্ধতি", icon: BookOpen },
] as const;

export function Brand() {
  const { lang } = useLang();
  return (
    <Link to="/" className="group flex min-w-0 items-center gap-3 rounded-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0 border border-cyan-400/30">
        <span className="text-xl font-black text-slate-950 select-none">◈</span>
      </div>
      <span className="min-w-0">
        <span className="block truncate font-display text-lg font-bold text-foreground">
          {lang === "bn" ? "এগ্রিশিফট" : "AgriShift"}
        </span>
        <span className="block truncate text-[10px] uppercase font-mono tracking-wider text-cyan-400">
          {lang === "bn" ? "বাংলাদেশ ক্লাইমেট ও কৃষি পর্যবেক্ষণ" : "Bangladesh Climate & Agro-Intelligence"}
        </span>
      </span>
    </Link>
  );
}

function NavItems({ mobile = false }: { mobile?: boolean }) {
  const { lang } = useLang();
  return (
    <>
      {NAV.map((item) => {
        const Icon = item.icon;
        const label = lang === "bn" ? item.labelBn : item.labelEn;
        const link = (
          <Link
            to={item.to as any}
            className={mobile ? "nav-mobile-link" : "nav-desktop-link"}
            activeProps={{
              className: mobile
                ? "nav-mobile-link nav-link-active"
                : "nav-desktop-link nav-link-active",
            }}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
        return mobile ? (
          <SheetClose asChild key={item.to}>
            {link}
          </SheetClose>
        ) : (
          <li key={item.to}>{link}</li>
        );
      })}
    </>
  );
}

function BackButton() {
  const { lang } = useLang();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;
  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.history.back();
        } else {
          router.navigate({ to: "/" as any });
        }
      }}
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
      aria-label={lang === "bn" ? "আগের পাতায় ফিরে যান" : "Go back"}
    >
      <ArrowLeft aria-hidden="true" className="w-4 h-4" />
      <span>{lang === "bn" ? "ফিরে যান" : "Back"}</span>
    </button>
  );
}

export function SiteHeader() {
  const { lang, setLang } = useLang();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/82 backdrop-blur-xl">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-accent to-primary" />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-3 sm:px-6">
        <BackButton />
        <Brand />
        <nav aria-label="Main" className="ml-auto hidden xl:block">
          <ul className="flex items-center gap-1">
            <NavItems />
          </ul>
        </nav>
        <button
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs ml-auto shrink-0 xl:ml-0"
          aria-label={lang === "bn" ? "ভাষা ইংরেজিতে বদলান" : "Switch language to Bangla"}
        >
          <Languages aria-hidden="true" className="w-4 h-4" />
          <span>{lang === "en" ? "বাংলা" : "English"}</span>
        </button>
        <div className="hidden sm:block">
          <button
            onClick={() => router.navigate({ to: "/" as any })}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
          >
            <LogIn aria-hidden="true" className="w-4 h-4" />
            <span>{lang === "bn" ? "সাইন ইন" : "Sign in"}</span>
          </button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 shrink-0 xl:hidden"
              aria-label={lang === "bn" ? "নেভিগেশন খুলুন" : "Open navigation"}
              type="button"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent className="border-border bg-background/95 backdrop-blur-xl">
            <SheetHeader>
              <SheetTitle>
                <Brand />
              </SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-2">
              <NavItems mobile />
            </nav>
            <div className="mt-5">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.navigate({ to: "/" as any })}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {lang === "bn" ? "সাইন ইন" : "Sign in"}
              </Button>
            </div>
            <div className="mt-8 border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
              {lang === "bn"
                ? "নাসা স্পেস অ্যাপস চ্যালেঞ্জ ২০২৬"
                : "NASA Space Apps Challenge 2026"}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { lang } = useLang();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);

  return (
    <footer className="relative z-10 mt-14 border-t border-border bg-elevated/92 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-3 py-9 sm:px-6 md:grid-cols-[1.25fr_0.75fr_0.75fr]">
        <div>
          <Brand />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            {L(
              "NASA Space Apps Challenge 2026 · Built for Bangladesh agricultural resilience and climate evidence.",
              "নাসা স্পেস অ্যাপস চ্যালেঞ্জ ২০২৬ · বাংলাদেশের টেকসই কৃষি ও জলবায়ু রূপান্তরের জন্য এগ্রিশিফট নির্মিত।",
            )}
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-accent">
            <Satellite aria-hidden="true" className="h-4 w-4" /> NASA data · deterministic
            statistics · AI-guided inquiry
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-foreground">
            {L("Investigate", "অনুসন্ধান")}
          </h2>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link to={"/heatmap" as any} className="hover:text-foreground active" data-status="active">
              {L("Heatmap", "হিটম্যাপ")}
            </Link>
            <Link to={"/compare" as any} className="hover:text-foreground">
              {L("Compare", "তুলনা")}
            </Link>
            <Link to={"/kids" as any} className="hover:text-foreground">
              {L("For Kids", "শিশুদের জন্য")}
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase text-foreground">
            {L("Open science", "উন্মুক্ত বিজ্ঞান")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Apache-2.0 লাইসেন্স · অফলাইন-প্রথম
          </p>
          <Link
            to={"/about" as any}
            className="mt-2 inline-block text-sm text-primary hover:underline"
          >
            {L("Data & Methods", "উপাত্ত ও পদ্ধতি")}
          </Link>
          <Link
            to={"/about" as any}
            className="mt-2 ml-4 inline-block text-sm text-muted-foreground hover:underline"
          >
            Admin
          </Link>
        </div>
      </div>
      <div className="border-t border-border/70 px-3 py-3 text-center text-[11px] text-muted-foreground">
        AgriShift · Bangladesh · 2026
      </div>
    </footer>
  );
}