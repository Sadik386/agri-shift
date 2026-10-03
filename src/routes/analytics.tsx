import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useState, useMemo } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { FIELDS, ROTATION_PLANS } from "@/lib/fieldshift/data";
import { buildProfitSurface, defaultCosts } from "@/lib/fieldshift/finance";
import { useLang } from "@/lib/i18n";

const ProfitSurfaceScene = lazy(() =>
  import("@/components/fieldshift/profit-surface-scene").then((m) => ({ default: m.ProfitSurfaceScene })),
);

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [show3DSurface, setShow3DSurface] = useState(true);

  const field = FIELDS[0]!;
  const plan = ROTATION_PLANS[0]!;
  const costs = useMemo(() => defaultCosts(field, plan), [field, plan]);
  const surface = useMemo(() => buildProfitSurface(field, plan, costs), [field, plan, costs]);

  const kpis = [
    {
      title: isBn ? "মোট সম্ভাব্য ফলন" : "TOTAL YIELD FORECAST",
      badge: "+8.4%",
      val: "1,452.4 t",
      data: [0.1, 0.2, 0.15, 0.35, 0.5, 0.7],
    },
    {
      title: isBn ? "পানি ব্যবহারের দক্ষতা" : "WATER USE EFFICIENCY",
      badge: "+12.1%",
      val: "98.2 WUE",
      data: [0.1, 0.25, 0.2, 0.5, 0.6, 0.85],
    },
    {
      title: isBn ? "কার্বন সঞ্চয়ন" : "CARBON SEQUESTRATION",
      badge: "+3.2%",
      val: "340 tCO2e",
      data: [0.1, 0.3, 0.4, 0.6, 0.6, 0.8],
    },
    {
      title: isBn ? "প্রত্যাশিত নিট লাভ" : "ROI PROJECTION",
      badge: "+15.6%",
      val: "$142,500",
      data: [0.1, 0.25, 0.2, 0.45, 0.65, 0.9],
    },
  ];

  const stratigraphy = [
    { layer: isBn ? "ক্লে স্তর (০ - ৩০ সেমি)" : "CLAY LAYER (0 - 30cm)", note: isBn ? "উচ্চ আর্দ্রতা" : "HIGH_MOISTURE" },
    { layer: isBn ? "দোআঁশ / বেলে মিশ্রণ (৩০ - ৮০ সেমি)" : "LOAM / SAND HYBRID (30 - 80cm)", note: isBn ? "সুনিষ্কাশিত" : "BALANCED_DRAINAGE" },
    { layer: isBn ? "মাদার রক স্তর (৮০ সেমি+)" : "BEDROCK / PARENT MATERIAL (80cm+)", note: isBn ? "কঠিন ভিত্তি" : "SOLID_BARRIER" },
  ];

  const riskMatrix = [
    { title: isBn ? "খরা ঝুঁকি" : "DROUGHT RISK", level: isBn ? "কম" : "LOW", color: "var(--gr)" },
    { title: isBn ? "কীটপতঙ্গ আক্রমণ" : "PEST ANOMALY", level: isBn ? "মাঝারি" : "MEDIUM", color: "var(--am)" },
    { title: isBn ? "তাপমাত্রার আকস্মিক তীব্রতা" : "FROST / TEMP VOLATILITY", level: isBn ? "উচ্চ" : "HIGH", color: "var(--rd)" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="analytics" />

      <div className="pad-fs flex-1 space-y-6">
        {/* KPI Cards Grid */}
        <div className="k4-fs">
          {kpis.map((k) => (
            <div key={k.title} className="card-fs kpi-fs">
              <div className="h">
                <span>{k.title}</span>
                <span>{k.badge}</span>
              </div>
              <div className="flex justify-between items-center gap-3 mt-2">
                <b className="lx">{k.val}</b>
                <div style={{ width: "60px", height: "30px" }}>
                  <Sparkline data={k.data} color="#00e5ff" height={30} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3D Profit & Risk Landscape Option */}
        <div className="card-fs p-fs">
          <div className="kv-fs items-center">
            <div>
              <h3 className="lx">{isBn ? "৩D আর্থিক ও জলবায়ু ঝুঁকি সারফেস মডেল" : "3D Financial & Climate Volatility Risk Surface"}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBn ? "বৃষ্টিপাত ঘাটতি ও বিশ্বব্যাপী সার খরচ সূচকের ওপর মন্টে কার্লো সিমুলেশন।" : "Monte Carlo stochastic simulation across rainfall deficit % vs global fertilizer cost index."}
              </p>
            </div>
            <button
              onClick={() => setShow3DSurface(!show3DSurface)}
              className="font-mono text-[10px] uppercase px-3 py-1 rounded border border-border/80 hover:bg-secondary/60 text-cyan-400"
            >
              {show3DSurface 
                ? (isBn ? "৩D সারফেস সংক্ষেপ করুন" : "Collapse 3D Surface") 
                : (isBn ? "৩D সারফেস উন্মোচন করুন" : "Expand 3D Surface")}
            </button>
          </div>

          {show3DSurface && (
            <div className="mt-4 h-[340px] w-full rounded-lg overflow-hidden border border-border/80 relative">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground">
                    {isBn ? "স্টোকাস্টিক মুনাফা বহুপদী গণনা করা হচ্ছে…" : "CALCULATING STOCHASTIC PROFIT POLYNOMIALS…"}
                  </div>
                }
              >
                <ProfitSurfaceScene surface={surface} />
              </Suspense>
            </div>
          )}
        </div>

        {/* Yield Projection Overlay with SMAP Precipitation Bands */}
        <div className="card-fs p-fs">
          <div className="kv-fs items-center mb-2">
            <h3 className="lx">{isBn ? "ফলন অভিক্ষেপ এবং SMAP বৃষ্টিপাত ব্যান্ড ওভারলে" : "Yield Projection Overlay with SMAP Precipitation Bands"}</h3>
            <span className="mono" style={{ fontSize: "10px" }}>
              <b style={{ color: "var(--cy)" }}>●</b> {isBn ? "ফলন অভিক্ষেপ" : "YIELD_PROJ"} &nbsp;{" "}
              <b style={{ color: "var(--am)" }}>●</b> {isBn ? "বৃষ্টিপাত ব্যান্ড" : "SMAP_PRECIP"}
            </span>
          </div>
          <div style={{ height: "180px" }}>
            <Sparkline
              data={[0.05, 0.3, 0.15, 0.5, 0.35, 0.7, 0.95, 0.85]}
              color="#00e5ff"
              height={180}
            />
          </div>
        </div>

        {/* Stratigraphy & Risk Matrix Two Columns */}
        <div className="two-fs">
          {/* Soil Stratigraphy */}
          <div className="card-fs p-fs">
            <h3 className="lx mb-1">{isBn ? "মাটির স্তরবিন্যাস ও স্ট্র্যাটিগ্রাফি প্রোফাইল" : "Soil Stratigraphy Profile Diagram"}</h3>
            <div className="space-y-2">
              {stratigraphy.map((s) => (
                <div key={s.layer} className="lay-fs">
                  <span>{s.layer}</span>
                  <small>{s.note}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Climate Adaptive Risk Matrix */}
          <div className="card-fs p-fs">
            <h3 className="lx mb-1">{isBn ? "জলবায়ু সহনশীল ঝুঁকি বিশ্লেষণ ম্যাট্রিক্স" : "Climate Adaptive Risk Matrix"}</h3>
            <div className="space-y-2">
              {riskMatrix.map((r) => (
                <div key={r.title} className="rk-fs">
                  <span className="text-xs font-medium text-foreground">{r.title}</span>
                  <span
                    className="ri-fs"
                    style={{
                      color: r.color,
                      backgroundColor: `color-mix(in srgb, ${r.color} 15%, transparent)`,
                    }}
                  >
                    {r.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NASA Earth Data Sync Command Strip */}
        <div className="strip-fs card-fs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <b>{isBn ? "নাসা আর্থ ডেটা সিঙ্ক কমান্ড" : "NASA EARTH DATA SYNC COMMAND"}</b>
            <span>SMAP: OK_12M_AGO</span>
            <span>ECOSTRESS: OK_02H_AGO</span>
            <span>LANDSAT_9: OK_08H_AGO</span>
            <span>OPENET: OK_DAILY</span>
          </div>
          <Link
            to="/datasets"
            className="text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold shrink-0"
          >
            {isBn ? "৭টি অফলাইন ডেটাসেট পরিদর্শন করুন ›" : "INSPECT 7 OFFLINE DATASETS ›"}
          </Link>
        </div>
      </div>
    </div>
  );
}
