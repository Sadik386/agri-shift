import React, { useState } from "react";
import { MessageSquare, X, Bot, Sparkles } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { ChatInterface } from "./ChatInterface";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useLang();
  const isBn = lang === "bn";

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 text-slate-950 font-bold text-xs shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/40"
            aria-label={isBn ? "এগ্রিশিফট এআই চ্যাট খুলুন" : "Open AgriShift AI Chat"}
          >
            <div className="relative">
              <Bot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-slate-950 animate-ping" />
            </div>
            <span className="hidden sm:inline font-mono tracking-tight">
              {isBn ? "এআই সহকারী ◈" : "Ask AgriShift AI ◈"}
            </span>
            <span className="flex items-center justify-center bg-slate-950/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
              LangChain
            </span>
          </button>
        ) : null}
      </div>

      {/* Floating Chat Modal Popover */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[460px] sm:h-[650px] z-50 p-2 sm:p-0 flex flex-col justify-end">
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm sm:hidden -z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="h-full w-full relative">
            <ChatInterface embedded onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
