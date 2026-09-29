import { Link } from "@tanstack/react-router";

export type TabKey = "dashboard" | "globe" | "field" | "planner" | "analytics" | "datasets";

const TABS: Array<{ key: TabKey; label: string; shortLabel: string; href: string }> = [
  { key: "dashboard", label: "0. ALL MODULES", shortLabel: "0. ALL", href: "/dashboard" },
  { key: "globe", label: "1. GLOBE VIEW", shortLabel: "1. GLOBE", href: "/globe" },
  { key: "field", label: "2. FIELD MAP", shortLabel: "2. FIELD", href: "/field" },
  { key: "planner", label: "3. ROTATION PLANNER", shortLabel: "3. PLANNER", href: "/planner" },
  { key: "analytics", label: "4. TELEMETRY ANALYTICS", shortLabel: "4. ANALYTICS", href: "/analytics" },
  { key: "datasets", label: "5. NASA DATASETS (OFFLINE)", shortLabel: "5. DATASETS", href: "/datasets" },
];

export function AppTopbar({ currentTab }: { currentTab: TabKey }) {
  return (
    <div className="top-fs">
      <Link to="/" className="brand-fs shrink-0">
        <span className="logo-fs" aria-hidden="true">
          ◈
        </span>
        <span className="hidden sm:inline">
          <b className="lx" style={{ fontSize: "15px" }}>
            FIELD <i style={{ color: "var(--cy)", fontStyle: "normal" }}>SHIFT</i>
          </b>
          <small className="mono" style={{ color: "var(--am)", fontSize: "9px" }}>
            NASA DATA PORTAL
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
            <span className="hidden md:inline">{t.label}</span>
            <span className="inline md:hidden">{t.shortLabel}</span>
          </Link>
        ))}
      </nav>

      <div className="who-fs shrink-0 flex items-center gap-2">
        <Link
          to="/datasets"
          className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono hover:bg-emerald-500/20 transition-colors"
          title="7 NASA Earth observation datasets cached offline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>7 OFFLINE</span>
        </Link>
        <span className="av-fs" />
        <span className="hidden lg:inline">OPERATOR</span>
      </div>
    </div>
  );
}
