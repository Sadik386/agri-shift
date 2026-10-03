import { createFileRoute } from "@tanstack/react-router";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useLang } from "@/lib/i18n";
import { Bot, Sparkles, Satellite, ShieldCheck, Database, Layers } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask AgriShift AI — NASA-Powered LangChain Assistant" },
      {
        name: "description",
        content:
          "AI Agronomist powered by LangChain and NASA Earth observations (SMAP, Landsat, OpenET, ECOSTRESS, GPM IMERG) for Bangladesh climate resilience.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { lang } = useLang();
  const isBn = lang === "bn";

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-200 flex flex-col font-sans">
      <AppTopbar currentTab="chat" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Header Hero Banner */}
        <section className="bg-gradient-to-r from-[#0d162b] via-[#09152b] to-[#071120] border border-cyan-500/25 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                  <Bot className="h-3 w-3" />
                  LangChain LCEL Agent
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                  <Satellite className="h-3 w-3" />7 NASA Earth Missions
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{isBn ? "এগ্রিশিফট এআই সহকারী" : "AgriShift Mission Control AI"}</span>
                <span className="text-cyan-400 font-light">◈</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {isBn
                  ? "নাসা আর্থ অবজারভেশন স্যাটেলাইট ডেটা (SMAP, Landsat 9, OpenET, ECOSTRESS, GPM IMERG) এবং ল্যাংচেইন ফ্রেমওয়ার্ক চালিত বুদ্ধিমান কৃষি সহকারী। খরা, লবণাক্ততা এবং আকস্মিক বন্যা মোকাবেলায় টেকসই ফসল পর্যায়ক্রমের সরাসরি দিকনির্দেশনা।"
                  : "Intelligent agricultural advisor powered by LangChain and NASA Earth observations (SMAP, Landsat 9, OpenET, ECOSTRESS, GPM IMERG). Ask questions about drought adaptation, water conservation, and resilient crop rotation for all 64 Bangladesh districts."}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="grid grid-cols-3 gap-2 bg-[#090f1d] border border-slate-800 p-3 rounded-xl shrink-0 text-center text-xs">
              <div className="px-2">
                <span className="block text-[10px] text-slate-400 font-mono">DISTRICTS</span>
                <span className="font-bold text-cyan-400 text-sm">64</span>
              </div>
              <div className="border-x border-slate-800 px-2">
                <span className="block text-[10px] text-slate-400 font-mono">NASA SATELLITES</span>
                <span className="font-bold text-emerald-400 text-sm">7 Missions</span>
              </div>
              <div className="px-2">
                <span className="block text-[10px] text-slate-400 font-mono">OFFLINE MODE</span>
                <span className="font-bold text-amber-400 text-sm">100% Ready</span>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Interface Container */}
        <section className="flex-1 flex flex-col min-h-[640px]">
          <ChatInterface defaultDistrictId="rajshahi" />
        </section>
      </main>
    </div>
  );
}
