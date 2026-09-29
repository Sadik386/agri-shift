import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { CROPS, FIELDS } from "@/lib/fieldshift/data";
import type { Crop } from "@/lib/fieldshift/types";

const SoilProfileScene = lazy(() =>
  import("@/components/fieldshift/soil-profile-scene").then((m) => ({ default: m.SoilProfileScene })),
);

export const Route = createFileRoute("/planner")({
  component: PlannerPage,
});

function PlannerPage() {
  const [activeScenario, setActiveScenario] = useState("NASA-Adaptive-Q3");
  const [show3DSoil, setShow3DSoil] = useState(true);
  const [growth, setGrowth] = useState(0.85);

  const field = FIELDS[0]!;
  const crop: Crop = CROPS["mungbean"] ?? CROPS["maize"]!;

  const gantt = [
    {
      year: "2024",
      a: ["Winter Wheat / Maize", "40% Allocated"],
      b: ["Cover Crop (Mungbean / Clover)", "60% Allocated"],
    },
    {
      year: "2025",
      a: ["Legume Cover / Soybeans", "50% Allocated"],
      b: ["Residual Moisture Sorghum", "50% Allocated"],
    },
    {
      year: "2026",
      a: ["High Biomass Grain Corn", "70% Allocated"],
      b: ["Fallow / Bio-Mulch Cover", "30% Allocated"],
    },
  ];

  const outcomes = [
    {
      label: "A: Optimal Yield & Nitrogen Fix",
      biomass: "9.4 t/Ha",
      roi: "+14.2% ROI",
      pct: 84,
      conf: "NASA_CONF_HIGH",
    },
    {
      label: "B: Deep Aquifer Water Conservation",
      biomass: "8.1 t/Ha",
      roi: "+8.5% ROI",
      pct: 63,
      conf: "NASA_CONF_HIGH",
    },
    {
      label: "C: Heat-Stress Extreme Resilient",
      biomass: "7.6 t/Ha",
      roi: "+11.0% ROI",
      pct: 72,
      conf: "NASA_CONF_MED",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="planner" />

      {/* Action Bar */}
      <div className="act-fs">
        <span>
          <b style={{ color: "var(--cy)" }}>PLANNER_CMD_CENTER</b> &nbsp;|&nbsp;{" "}
          <span style={{ color: "#fff" }}>Active Scenario: {activeScenario}</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShow3DSoil(!show3DSoil)}
            style={{ color: "var(--cy)" }}
          >
            {show3DSoil ? "HIDE 3D SOIL" : "VIEW 3D SOIL"}
          </button>
          <button
            onClick={() =>
              setActiveScenario((prev) =>
                prev === "NASA-Adaptive-Q3" ? "Barind-Water-Lean-V2" : "NASA-Adaptive-Q3",
              )
            }
          >
            Switch Scenario
          </button>
          <button
            onClick={() => window.print()}
            style={{ color: "var(--cy)" }}
          >
            EXPORT_PLAN_PDF
          </button>
        </div>
      </div>

      {/* 3D Soil Horizon Drawer if active */}
      {show3DSoil && (
        <div className="p-4 sm:p-6 pb-0">
          <div className="card-fs p-4 relative overflow-hidden bg-card/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="lx text-sm">Interactive 3D Subsoil Profile &amp; Rhizosphere</h3>
                <p className="text-xs text-muted-foreground">
                  Simulating root penetration across soil horizon layers for {crop.name}.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-muted-foreground">Growth Stage:</span>
                {[0.2, 0.5, 0.85, 1.0].map((v) => (
                  <button
                    key={v}
                    onClick={() => setGrowth(v)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      growth === v ? "bg-primary text-primary-foreground font-semibold" : "bg-secondary/60 text-muted-foreground"
                    }`}
                  >
                    {v === 0.2 ? "Early" : v === 0.5 ? "Vegetative" : v === 0.85 ? "Reproductive" : "Harvest"}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[280px] w-full rounded-lg overflow-hidden border border-border/80">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground">
                    LOADING 3D SOIL STRATIGRAPHY…
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
            <h3 className="lx">3-Year Multi-Season Crop Rotation Gantt</h3>
            {gantt.map((g) => (
              <div key={g.year} className="tr-fs">
                <span className="mono" style={{ fontSize: "12px" }}>
                  {g.year} PLAN
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
              <h3 className="lx">Soil Health Index Forecast (Organic Carbon, N, pH)</h3>
              <div className="mono text-[10px] space-x-3">
                <span style={{ color: "var(--cy)" }}>● Organic Carbon</span>
                <span style={{ color: "var(--am)" }}>● Nitrogen Reserves</span>
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
          <h3 className="lx">Projected Scenario Outcomes</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Derived from multi-spectral ECOSTRESS crop water stressing indexes and SMAP calibrated precipitation.
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
                    <small className="lab-fs">Estimated biomass</small>
                    <b className="lx" style={{ fontSize: "18px" }}>
                      {o.biomass}
                    </b>
                  </div>
                  <div>
                    <small className="lab-fs">Revenue index</small>
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
