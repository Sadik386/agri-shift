import { useState } from "react";
import { LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

export function AuthButton() {
  const { lang } = useLang();
  const [signedIn, setSignedIn] = useState(false);

  if (signedIn) {
    return (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSignedIn(false)}>
          <UserRound aria-hidden className="w-3.5 h-3.5 mr-1" />
          <span>{lang === "bn" ? "প্রোফাইল" : "Profile"}</span>
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setSignedIn(true)}>
      <LogIn aria-hidden className="w-3.5 h-3.5 mr-1" />
      <span>{lang === "bn" ? "সাইন ইন" : "Sign in"}</span>
    </Button>
  );
}