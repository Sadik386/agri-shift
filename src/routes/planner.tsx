import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { CROPS, FIELDS } from "@/lib/fieldshift/data";
import type { Crop } from "@/lib/fieldshift/types";
import { useLang } from "@/lib/i18n";

const SoilProfileScene = lazy(() =>
  import("@/components/fieldshift/soil-profile-scene").then((m) => ({ default: m.SoilProfileScene })),
);

export const Route = createFileRoute("/planner")({
  component: PlannerPage,
});

function PlannerPage() {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [activeScenario, setActiveScenario] = useState("NASA-Adaptive-Q3");
  const [show3DSoil, setShow3DSoil] = useState(true);
  const [growth, setGrowth] = useState(0.85);

  const field = FIELDS[0]!;
  const crop: Crop = CROPS["mungbean"] ?? CROPS["maize"]!;

  const gantt = [
    {
      year: "2024",
      a: [isBn ? "শীতকালীন গম / ভুট্টা" : "Winter Wheat / Maize", isBn ? "৪০% বরাদ্দ" : "40% Allocated"],
      b: [isBn ? "কভার ফসল (মুগডাল / ক্লোভার)" : "Cover Crop (Mungbean / Clover)", isBn ? "৬০% বরাদ্দ" : "60% Allocated"],
    },
    {
      year: "2025",
      a: [isBn ? "ডাল জাতীয় কভার / সয়াবিন" : "Legume Cover / Soybeans", isBn ? "৫০% বরাদ্দ" : "50% Allocated"],
      b: [isBn ? "অবশিষ্ট আর্দ্রতায় জুয়ার" : "Residual Moisture Sorghum", isBn ? "৫০% বরাদ্দ" : "50% Allocated"],
    },
    {
      year: "2026",
      a: [isBn ? "উচ্চ ফলনশীল ভুট্টা" : "High Biomass Grain Corn", isBn ? "৭০% বরাদ্দ" : "70% Allocated"],
      b: [isBn ? "অনাবাদী / জৈব মালচ কভার" : "Fallow / Bio-Mulch Cover", isBn ? "৩০% বরাদ্দ" : "30% Allocated"],
    },
  ];

  const outcomes = [
    {
      label: isBn ? "ক: সর্বোচ্চ ফলন ও নাইট্রোজেন বৃদ্ধি" : "A: Optimal Yield & Nitrogen Fix",
      biomass: "9.4 t/Ha",
      roi: "+14.2% ROI",
      pct: 84,
      conf: isBn ? "নাসা নিশ্চয়তা: উচ্চ" : "NASA_CONF_HIGH",
    },
    {
      label: isBn ? "খ: ভূগর্ভস্থ পানি সুরক্ষা ও সেচ হ্রাস" : "B: Deep Aquifer Water Conservation",
      biomass: "8.1 t/Ha",
      roi: "+8.5% ROI",
      pct: 63,
      conf: isBn ? "নাসা নিশ্চয়তা: উচ্চ" : "NASA_CONF_HIGH",
    },
    {
      label: isBn ? "গ: তীব্র তাপদাহ ও খরা সহনশীল" : "C: Heat-Stress Extreme Resilient",
      biomass: "7.6 t/Ha",
      roi: "+11.0% ROI",
      pct: 72,
      conf: isBn ? "নাসা নিশ্চয়তা: মাঝারি" : "NASA_CONF_MED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="planner" />

      {/* Action Bar */}
      <div className="act-fs">
        <span className="flex items-center gap-2">
          <b style={{ color: "var(--cy)" }}>{isBn ? "পরিকল্পনা কমান্ড সেন্টার" : "PLANNER_CMD_CENTER"}</b> &nbsp;|&nbsp;{" "}
          <span className="text-white text-xs font-mono">
            {isBn ? "দুর্যোগ দৃশ্যকল্প:" : "Disaster Scenario:"}
          </span>
          <select
            value={activeScenario}
            onChange={(e) => setActiveScenario(e.target.value)}
            className="rounded bg-black/50 border border-white/20 px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
          >
            <option value="Barind-Drought-Defense">
              {isBn ? "☀️ বরেন্দ্র খরা প্রতিরোধ (জুয়ার + মুগডাল)" : "☀️ Barind Drought Defense (Sorghum + Mungbean)"}
            </option>
            <option value="Coastal-Salinity-Defense">
              {isBn ? "🌊 উপকূলীয় লবণাক্ততা প্রতিরোধ (সরিষা + সূর্যমুখী)" : "🌊 Coastal Salinity Defense (Mustard + Sunflower)"}
            </option>
            <option value="Haor-Flash-Flood-Defense">
              {isBn ? "⛈️ হাওর পাহাড়ি ঢল প্রতিরোধ (আগাম সরিষা + ব্রি ৮৮)" : "⛈️ Haor Flash Flood Defense (Early Mustard + BRRI 88)"}
            </option>
            <option value="Heatwave-Extreme-Defense">
              {isBn ? "🔥 তীব্র তাপদাহ প্রতিরোধ (সি৪ ভুট্টা + তিল)" : "🔥 Heatwave Spike Defense (C4 Maize + Sesame)"}
            </option>
            <option value="NASA-Adaptive-Q3">
              {isBn ? "🛰️ নাসা মাল্টি-ইয়ার অভিযোজন বেসলাইন" : "🛰️ Baseline NASA Multi-Year Rotation"}
            </option>
          </select>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3DSoil(!show3DSoil)}
            style={{ color: "var(--cy)" }}
          >
            {show3DSoil
              ? (isBn ? "৩D মাটি লুকান" : "HIDE 3D SOIL")
              : (isBn ? "৩D মাটি দেখুন" : "VIEW 3D SOIL")}
          </button>
          <button
            onClick={() => window.print()}
            style={{ color: "var(--cy)" }}
          >
            {isBn ? "প্ল্যান PDF ডাউনলোড" : "EXPORT_PLAN_PDF"}
          </button>
        </div>
      </div>

      {/* 3D Soil Horizon Drawer if active */}
      {show3DSoil && (
        <div className="p-4 sm:p-6 pb-0">
          <div className="card-fs p-4 relative overflow-hidden bg-card/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="lx text-sm">
                  {isBn ? "ইন্টারেক্টিভ ৩D মৃত্তিকা স্তর ও শিকড় বিস্তার" : "Interactive 3D Subsoil Profile & Rhizosphere"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? `${crop.name} ফসলের জন্য মাটির বিভিন্ন স্তরে শিকড়ের বিস্তার সিমুলেশন।`
                    : `Simulating root penetration across soil horizon layers for ${crop.name}.`}
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-muted-foreground">{isBn ? "বৃদ্ধির স্তর:" : "Growth Stage:"}</span>
                {[0.2, 0.5, 0.85, 1.0].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGrowth(v)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      growth === v ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    {v === 0.2
                      ? (isBn ? "প্রারম্ভিক" : "Early")
                      : v === 0.5
                      ? (isBn ? "অঙ্গজ বৃদ্ধি" : "Vegetative")
                      : v === 0.85
                      ? (isBn ? "ফুল ও ফল" : "Reproductive")
                      : (isBn ? "পরিপক্ক" : "Harvest")}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full rounded-lg overflow-hidden border border-border/80">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground">
                    {isBn ? "৩D মৃত্তিকা স্তর লোড হচ্ছে…" : "LOADING 3D SOIL STRATIGRAPHY…"}
                  </div>
                }
              >
                <SoilProfileScene layers={field.soilLayers} crop={crop} growth={growth} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Main Gantt & Outcome Grid */}
      <div className="pad-fs two-fs flex-1">
        <div style={{ display: "grid", gap: "20px", alignContent: "start" }}>
          {/* 3-Year Rotation Gantt */}
          <div className="card-fs p-fs">
            <h3 className="lx">
              {isBn ? "৩-বছরের বহুমৌসুমী ফসল রোটেশন গ্যান্ট চার্ট" : "3-Year Multi-Season Crop Rotation Gantt"}
            </h3>
            {gantt.map((g) => (
              <div key={g.year} className="tr-fs">
                <span className="mono" style={{ fontSize: "12px" }}>
                  {g.year} {isBn ? "পরিকল্পনা" : "PLAN"}
                </span>
                <div className="blk-fs">
                  {g.a[0]}
                  <small>{g.a[1]}</small>
                </div>
                <div className="blk-fs a">
                  {g.b[0]}
                  <small>{g.b[1]}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Soil Health Forecast Curves */}
          <div className="card-fs p-fs">
            <div className="flex items-center justify-between">
              <h3 className="lx">
                {isBn ? "মাটির উর্বরতা সূচক পূর্বাভাস (জৈব কার্বন, নাইট্রোজেন, pH)" : "Soil Health Index Forecast (Organic Carbon, N, pH)"}
              </h3>
              <div className="mono text-[10px] space-x-3">
                <span style={{ color: "var(--cy)" }}>● {isBn ? "জৈব কার্বন" : "Organic Carbon"}</span>
                <span style={{ color: "var(--am)" }}>● {isBn ? "নাইট্রোজেন রিজার্ভ" : "Nitrogen Reserves"}</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div style={{ height: "100px" }}>
                <Sparkline data={[0.1, 0.2, 0.32, 0.45, 0.6, 0.85]} color="#00e5ff" height={100} />
              </div>
              <div style={{ height: "100px" }}>
                <Sparkline data={[0.5, 0.4, 0.6, 0.7, 0.85, 0.95]} color="#ffb300" height={100} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Projected Scenario Outcomes */}
        <aside className="card-fs p-fs" style={{ alignContent: "start" }}>
          <h3 className="lx">
            {isBn ? "প্রত্যাশিত ফলাফল ও লাভজনকতা" : "Projected Scenario Outcomes"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isBn
              ? "ECOSTRESS ফসলের পানির টান সূচক এবং SMAP ভিত্তিক বৃষ্টিপাত বিশ্লেষণের মাধ্যমে প্রণীত।"
              : "Derived from multi-spectral ECOSTRESS crop water stressing indexes and SMAP calibrated precipitation."}
          </p>

          <div className="space-y-3 pt-2">
            {outcomes.map((o) => (
              <div key={o.label} className="card-fs p-fs" style={{ padding: "14px" }}>
                <div className="kv-fs">
                  <b style={{ fontWeight: 500, color: "#fff", fontSize: "13px" }}>{o.label}</b>
                  <span className="bd-fs">{o.conf}</span>
                </div>
                <div className="kv-fs mt-2">
                  <div>
                    <small className="lab-fs">{isBn ? "সম্ভাব্য বায়োমাস" : "Estimated biomass"}</small>
                    <b className="lx" style={{ fontSize: "18px" }}>
                      {o.biomass}
                    </b>
                  </div>
                  <div>
                    <small className="lab-fs">{isBn ? "মুনাফা বৃদ্ধি" : "Revenue index"}</small>
                    <b className="lx" style={{ fontSize: "18px" }}>
                      {o.roi}
                    </b>
                  </div>
                </div>
                <div className="prog-fs mt-3">
                  <i style={{ width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
