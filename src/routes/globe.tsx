import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { FIELDS } from "@/lib/fieldshift/data";
import { useLang } from "@/lib/i18n";

const GlobeScene = lazy(() =>
  import("@/components/fieldshift/globe-scene").then((m) => ({ default: m.GlobeScene })),
);

export const Route = createFileRoute("/globe")({
  component: GlobePage,
});

function GlobePage() {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [view3D, setView3D] = useState(true);
  const field = FIELDS[0]!;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="globe" />

      <div className="split-fs flex-1">
        {/* Left Orbital Assets Rail */}
        <aside className="side-fs">
          <span className="mono" style={{ fontSize: "11px", color: "var(--cy)" }}>
            <i className="dot-fs" />
            {isBn ? "নাসা স্যাটেলাইট কমান্ড" : "NASA SATELLITE COMMAND"}
          </span>

          <h2 className="lx" style={{ fontSize: "22px" }}>
            {isBn ? "কক্ষপথীয় স্যাটেলাইট" : "Orbital Assets"}
          </h2>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {isBn
              ? "কৃষি ও আবহাওয়া মডেলের জন্য সক্রিয় নাসা পৃথিবী-পর্যবেক্ষণ মিশনসমূহ।"
              : "Monitor active Earth-observation missions feeding the field model."}
          </p>

          <div className="card-fs sat-fs">
            <div className="h">
              <span>SMAP ({isBn ? "মাটির আর্দ্রতা" : "Soil Moisture"})</span>
              <span className="bd-fs">{isBn ? "সক্রিয়" : "ACTIVE"}</span>
            </div>
            <div className="kv-fs">
              <div>
                <small className="lab-fs">{isBn ? "উচ্চতা" : "Orbit altitude"}</small>
                <b>685 km</b>
              </div>
              <div>
                <small className="lab-fs">{isBn ? "রিভিজিট সাইকেল" : "Revisit cycle"}</small>
                <b>{isBn ? "৩ দিন" : "3 days"}</b>
              </div>
            </div>
            <small
              className="lab-fs"
              style={{ borderTop: "1px solid var(--line)", paddingTop: "8px" }}
            >
              ↻ {isBn ? "সিঙ্ক: ৪ মিনিট আগে" : "SYNC: 04M_AGO"}
            </small>
          </div>

          <div className="card-fs sat-fs">
            <div className="h">
              <span>Landsat 8/9</span>
              <span className="bd-fs">{isBn ? "সক্রিয়" : "ACTIVE"}</span>
            </div>
            <div className="kv-fs">
              <div>
                <small className="lab-fs">{isBn ? "উচ্চতা" : "Orbit altitude"}</small>
                <b>705 km</b>
              </div>
              <div>
                <small className="lab-fs">{isBn ? "রিভিজিট সাইকেল" : "Revisit cycle"}</small>
                <b>{isBn ? "৮ দিন" : "8 days"}</b>
              </div>
            </div>
            <small
              className="lab-fs"
              style={{ borderTop: "1px solid var(--line)", paddingTop: "8px" }}
            >
              ↻ {isBn ? "সিঙ্ক: ১২ ঘণ্টা আগে" : "SYNC: 12H_AGO"}
            </small>
          </div>

          <div className="card-fs sat-fs">
            <div className="h">
              <span>ECOSTRESS</span>
              <span className="bd-fs a">{isBn ? "সক্রিয়" : "STATION_KEEP"}</span>
            </div>
            <div className="kv-fs">
              <div>
                <small className="lab-fs">{isBn ? "উচ্চতা" : "Orbit altitude"}</small>
                <b>400 km</b>
              </div>
              <div>
                <small className="lab-fs">{isBn ? "রিভিজিট সাইকেল" : "Revisit cycle"}</small>
                <b>{isBn ? "৪ দিন" : "4 days"}</b>
              </div>
            </div>
            <small
              className="lab-fs"
              style={{ borderTop: "1px solid var(--line)", paddingTop: "8px" }}
            >
              ↻ {isBn ? "সিঙ্ক: ২ ঘণ্টা আগে" : "SYNC: 02H_AGO"}
            </small>
          </div>

          <div className="pt-2 space-y-2">
            <Link
              to="/field"
              className="btn-fs fill w-full"
              style={{ justifyContent: "center", height: "45px" }}
            >
              {isBn ? "পাইলট ফিল্ড দেখুন ›" : "Select Target Field ›"}
            </Link>
            <Link
              to="/datasets"
              className="btn-fs w-full text-xs font-mono"
              style={{ justifyContent: "center", height: "38px" }}
            >
              ◈ {isBn ? "নাসা সংরক্ষিত উপাত্ত (৭টি)" : "Offline NASA Datasets (7)"}
            </Link>
          </div>
        </aside>

        {/* Globe Viewport & Telemetry Strip */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="view-fs flex-1 min-h-[580px] lg:min-h-[680px] relative">
            {/* View Mode Toggle Overlay */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg border border-border/80 bg-background/80 p-1 backdrop-blur-md font-mono text-[10px]">
              <button
                onClick={() => setView3D(true)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  view3D ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isBn ? "৩D ওয়েবজিএল গ্লোব" : "3D Interactive WebGL"}
              </button>
              <button
                onClick={() => setView3D(false)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  !view3D ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isBn ? "অরবিটাল রাডার ভিউ" : "Orbital Radar SVG"}
              </button>
            </div>

            {view3D ? (
              <div className="w-full h-full min-h-[580px] lg:min-h-[680px]">
                <Suspense
                  fallback={
                    <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                      {isBn ? "৩D অরবিটাল সিমুলেশন প্রস্তুত হচ্ছে…" : "INITIALIZING 3D ORBITAL SIMULATION…"}
                    </div>
                  }
                >
                  <GlobeScene field={field} />
                </Suspense>
              </div>
            ) : (
              <svg
                viewBox="0 0 560 560"
                width="min(100%,620px)"
                role="img"
                aria-label="Globe with satellite orbits"
              >
                <defs>
                  <radialGradient id="g" cx="40%" cy="35%">
                    <stop offset="0" stopColor="#2a6bb0" />
                    <stop offset="1" stopColor="#0a1c33" />
                  </radialGradient>
                </defs>
                <circle cx="280" cy="280" r="250" fill="rgba(0,229,255,.06)" />
                <circle
                  cx="280"
                  cy="280"
                  r="230"
                  fill="url(#g)"
                  stroke="rgba(0,229,255,.4)"
                />

                {/* Orbit 1: SMAP */}
                <g className="orb-fs" style={{ animationDuration: "50s" }}>
                  <circle
                    cx="280"
                    cy="280"
                    r="262"
                    fill="none"
                    stroke="rgba(0,229,255,.3)"
                    strokeDasharray="4 6"
                  />
                  <circle cx="542" cy="280" r="5" fill="#ffb300" />
                  <text
                    x="552"
                    y="284"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                  >
                    SMAP (685km)
                  </text>
                </g>

                {/* Orbit 2: Landsat 9 */}
                <g className="orb-fs" style={{ animationDuration: "80s" }}>
                  <circle
                    cx="280"
                    cy="280"
                    r="240"
                    fill="none"
                    stroke="rgba(0,229,255,.3)"
                    strokeDasharray="4 6"
                  />
                  <circle cx="520" cy="280" r="5" fill="#ffb300" />
                  <text
                    x="530"
                    y="284"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                  >
                    LANDSAT_9 (705km)
                  </text>
                </g>

                {/* Crosshairs & Target Marker */}
                <g stroke="#00e5ff">
                  <path d="M270 300h-40M290 300h40M280 250v-40" />
                </g>
                <text
                  x="300"
                  y="332"
                  fill="#00e5ff"
                  fontSize="11"
                  fontFamily="JetBrains Mono"
                >
                  LENS: ACTIVE_SCAN
                </text>
              </svg>
            )}
          </div>

          {/* Telemetry Strip */}
          <div className="strip-fs">
            <span>
              {isBn ? "কক্ষপথে স্যাটেলাইট:" : "SATELLITES ON STATION:"} <b>{isBn ? "৫/৫ অনলাইন" : "5/5 ONLINE"}</b>
            </span>
            <span>
              {isBn ? "দৈনিক স্ক্যান কভারেজ:" : "GLOBAL DAILY SWATH COV:"} <b>94.2%</b>
            </span>
            <span>
              {isBn ? "টেলিমেট্রি প্রবাহের গতি:" : "TELEMETRY INGESTION RATE:"} <b>18.4 GB/s</b>
            </span>
            <span>
              {isBn ? "প্রক্রিয়াজাত ফ্রেম (২৪ঘণ্টা):" : "SCENES PROCESSED (24H):"} <b>1,402</b>
            </span>
            <span>
              {isBn ? "অস্বাভাবিক বিচ্যুতি:" : "ANOMALIES DETECTED:"} <b>0 ZERO_ERR</b>
            </span>
            <span>
              {isBn ? "অফলাইন আর্কাইভ:" : "OFFLINE CACHE:"}{" "}
              <Link to="/datasets" className="text-cyan-400 font-bold hover:underline">
                {isBn ? "৭টি নাসা ডেটাসেট সংরক্ষিত ›" : "7 DATASETS EMBEDDED ›"}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
