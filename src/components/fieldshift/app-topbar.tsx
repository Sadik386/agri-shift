import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { Languages } from "lucide-react";

export type TabKey = "dashboard" | "globe" | "field" | "planner" | "analytics" | "datasets" | "heatmap" | "chat";

interface TabItem {
  key: TabKey;
  labelEn: string;
  labelBn: string;
  shortEn: string;
  shortBn: string;
  href: string;
}

const TABS: TabItem[] = [
  { key: "dashboard", labelEn: "0. ALL MODULES", labelBn: "০. সকল মডিউল", shortEn: "0. ALL", shortBn: "০. সব", href: "/dashboard" },
  { key: "globe", labelEn: "1. GLOBE VIEW", labelBn: "১. ৩D গ্লোব", shortEn: "1. GLOBE", shortBn: "১. গ্লোব", href: "/globe" },
  { key: "field", labelEn: "2. FIELD MAP", labelBn: "২. ফিল্ড ম্যাপ", shortEn: "2. FIELD", shortBn: "২. ফিল্ড", href: "/field" },
  { key: "planner", labelEn: "3. ROTATION PLANNER", labelBn: "৩. ফসল পরিকল্পনা", shortEn: "3. PLANNER", shortBn: "৩. প্ল্যানার", href: "/planner" },
  { key: "analytics", labelEn: "4. TELEMETRY ANALYTICS", labelBn: "৪. টেলিমেট্রি বিশ্লেষণ", shortEn: "4. ANALYTICS", shortBn: "৪. বিশ্লেষণ", href: "/analytics" },
  { key: "datasets", labelEn: "5. NASA DATASETS (OFFLINE)", labelBn: "৫. নাসা উপাত্ত (৭টি)", shortEn: "5. DATASETS", shortBn: "৫. উপাত্ত", href: "/datasets" },
  { key: "heatmap", labelEn: "6. HEATMAP (104 HEX)", labelBn: "৬. হিটম্যাপ (১০৪ গ্রিড)", shortEn: "6. HEATMAP", shortBn: "৬. হিটম্যাপ", href: "/heatmap" },
  { key: "chat", labelEn: "7. ASK AI (LANGCHAIN)", labelBn: "৭. এআই সহকারী", shortEn: "7. AI CHAT", shortBn: "৭. চ্যাট", href: "/chat" },
];

export function AppTopbar({ currentTab }: { currentTab: TabKey }) {
  const { lang, setLang } = useLang();
  const isBn = lang === "bn";

  return (
    <div className="top-fs">
      <Link to="/" className="brand-fs shrink-0">
        <span className="logo-fs" aria-hidden="true">
          ◈
        </span>
        <span className="hidden sm:inline">
          <b className="lx" style={{ fontSize: "15px" }}>
            {isBn ? "এগ্রি " : "AGRI "}
            <i style={{ color: "var(--cy)", fontStyle: "normal" }}>
              {isBn ? "শিফট" : "SHIFT"}
            </i>
          </b>
          <small className="mono" style={{ color: "var(--am)", fontSize: "9px" }}>
            {isBn ? "নাসা উপাত্ত পোর্টাল" : "NASA DATA PORTAL"}
          </small>
        </span>
      </Link>

      <nav className="tabs-fs" aria-label="App">
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={t.href}
            className={t.key === currentTab ? "on" : ""}
          >
            <span className="hidden md:inline">{isBn ? t.labelBn : t.labelEn}</span>
            <span className="inline md:hidden">{isBn ? t.shortBn : t.shortEn}</span>
          </Link>
        ))}
      </nav>

      <div className="who-fs shrink-0 flex items-center gap-2">
        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/20 bg-white/5 font-mono text-[10px] text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title={isBn ? "Switch language to English" : "বাংলায় দেখুন"}
        >
          <Languages className="w-3 h-3 text-cyan-400" />
          <span>{isBn ? "English" : "বাংলা"}</span>
        </button>

        <Link
          to="/datasets"
          className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono hover:bg-emerald-500/20 transition-colors"
          title="7 NASA Earth observation datasets cached offline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isBn ? "৭টি অফলাইন" : "7 OFFLINE"}</span>
        </Link>
        <span className="av-fs" />
        <span className="hidden lg:inline">{isBn ? "অপারেটর" : "OPERATOR"}</span>
      </div>
    </div>
  );
}
