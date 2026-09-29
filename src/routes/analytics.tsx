import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useState, useMemo } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { FIELDS, ROTATION_PLANS } from "@/lib/fieldshift/data";
import { buildProfitSurface, defaultCosts } from "@/lib/fieldshift/finance";

const ProfitSurfaceScene = lazy(() =>
  import("@/components/fieldshift/profit-surface-scene").then((m) => ({ default: m.ProfitSurfaceScene })),
);

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [show3DSurface, setShow3DSurface] = useState(true);

  const field = FIELDS[0]!;
  const plan = ROTATION_PLANS[0]!;
  const costs = useMemo(() => defaultCosts(field, plan), [field, plan]);
  const surface = useMemo(() => buildProfitSurface(field, plan, costs), [field, plan, costs]);

  const kpis = [
    {
      title: "TOTAL YIELD FORECAST",
      badge: "+8.4%",
      val: "1,452.4 t",
      data: [0.1, 0.2, 0.15, 0.35, 0.5, 0.7],
    },
    {
      title: "WATER USE EFFICIENCY",
      badge: "+12.1%",
      val: "98.2 WUE",
      data: [0.1, 0.25, 0.2, 0.5, 0.6, 0.85],
    },
    {
      title: "CARBON SEQUESTRATION",
      badge: "+3.2%",
      val: "340 tCO2e",
      data: [0.1, 0.3, 0.4, 0.6, 0.6, 0.8],
    },
    {
      title: "ROI PROJECTION",
      badge: "+15.6%",
      val: "$142,500",
      data: [0.1, 0.25, 0.2, 0.45, 0.65, 0.9],
    },
  ];

  const stratigraphy = [
    { layer: "CLAY LAYER (0 - 30cm)", note: "HIGH_MOISTURE" },
    { layer: "LOAM / SAND HYBRID (30 - 80cm)", note: "BALANCED_DRAINAGE" },
    { layer: "BEDROCK / PARENT MATERIAL (80cm+)", note: "SOLID_BARRIER" },
  ];

  const riskMatrix = [
    { title: "DROUGHT RISK", level: "LOW", color: "var(--gr)" },
    { title: "PEST ANOMALY", level: "MEDIUM", color: "var(--am)" },
    { title: "FROST / TEMP VOLATILITY", level: "HIGH", color: "var(--rd)" },
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
              <h3 className="lx">3D Financial &amp; Climate Volatility Risk Surface</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monte Carlo stochastic simulation across rainfall deficit % vs global fertilizer cost index.
              </p>
            </div>
            <button
              onClick={() => setShow3DSurface(!show3DSurface)}
              className="font-mono text-[10px] uppercase px-3 py-1 rounded border border-border/80 hover:bg-secondary/60 text-cyan-400"
            >
              {show3DSurface ? "Collapse 3D Surface" : "Expand 3D Surface"}
            </button>
          </div>

          {show3DSurface && (
            <div className="mt-4 h-[340px] w-full rounded-lg overflow-hidden border border-border/80 relative">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground">
                    CALCULATING STOCHASTIC PROFIT POLYNOMIALS…
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
            <h3 className="lx">Yield Projection Overlay with SMAP Precipitation Bands</h3>
            <span className="mono" style={{ fontSize: "10px" }}>
              <b style={{ color: "var(--cy)" }}>●</b> YIELD_PROJ &nbsp;{" "}
              <b style={{ color: "var(--am)" }}>●</b> SMAP_PRECIP
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
            <h3 className="lx mb-1">Soil Stratigraphy Profile Diagram</h3>
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
            <h3 className="lx mb-1">Climate Adaptive Risk Matrix</h3>
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
            <b>NASA EARTH DATA SYNC COMMAND</b>
            <span>SMAP: OK_12M_AGO</span>
            <span>ECOSTRESS: OK_02H_AGO</span>
            <span>LANDSAT_9: OK_08H_AGO</span>
            <span>OPENET: OK_DAILY</span>
          </div>
          <Link
            to="/datasets"
            className="text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold shrink-0"
          >
            INSPECT 7 OFFLINE DATASETS ›
          </Link>
        </div>
      </div>
    </div>
  );
}
