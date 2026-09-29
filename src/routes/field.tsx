import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { FIELDS } from "@/lib/fieldshift/data";
import type { FieldSite } from "@/lib/fieldshift/types";

const FieldTerrainScene = lazy(() =>
  import("@/components/fieldshift/field-terrain-scene").then((m) => ({ default: m.FieldTerrainScene })),
);

export const Route = createFileRoute("/field")({
  component: FieldMapPage,
});

function FieldMapPage() {
  const [selectedField, setSelectedField] = useState<FieldSite>(FIELDS[0]!);
  const [mode, setMode] = useState<"moisture" | "canopy">("moisture");
  const [show3D, setShow3D] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="field" />

      <div className="split-fs flex-1" style={{ gridTemplateColumns: "1fr 400px" }}>
        {/* Main 3D Terrain Viewport */}
        <div className="view-fs terr-fs flex-1 min-h-[580px] lg:min-h-[700px] relative">
          <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
            <span
              className="card-fs mono"
              style={{
                position: "relative",
                padding: "8px 14px",
                fontSize: "11px",
                color: "var(--cy)",
              }}
            >
              TARGET PARCEL · {selectedField.name.toUpperCase()} ({selectedField.district})
            </span>

            {/* Field Site Dropdown */}
            <select
              value={selectedField.id}
              onChange={(e) => {
                const found = FIELDS.find((f) => f.id === e.target.value);
                if (found) setSelectedField(found);
              }}
              className="bg-card/90 border border-border/80 text-foreground font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-md"
            >
              {FIELDS.map((f) => (
                <option key={f.id} value={f.id} className="bg-card text-foreground">
                  {f.name} ({f.district})
                </option>
              ))}
            </select>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/80 p-1 backdrop-blur-md font-mono text-[10px]">
            <button
              onClick={() => setMode("moisture")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === "moisture"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Root Moisture
            </button>
            <button
              onClick={() => setMode("canopy")}
              className={`px-2.5 py-1 rounded transition-colors ${
                mode === "canopy"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Canopy Cover
            </button>
            <button
              onClick={() => setShow3D(!show3D)}
              className="ml-1 px-2 py-1 rounded border border-border/60 text-muted-foreground hover:text-foreground"
            >
              {show3D ? "3D Mesh" : "Stylized"}
            </button>
          </div>

          {show3D ? (
            <div className="w-full h-full min-h-[580px] lg:min-h-[700px]">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                    GENERATING VOLUMETRIC TERRAIN MESH…
                  </div>
                }
              >
                <FieldTerrainScene field={selectedField} mode={mode} />
              </Suspense>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="card-fs mono px-4 py-2 text-xs text-cyan-400">
                STYLIZED DEM ORTHORECTIFICATION
              </span>
              <p className="font-mono text-xs text-muted-foreground">
                Parcel Area: {selectedField.areaAcres} Acres · Elevation: {selectedField.elevationM} m
              </p>
            </div>
          )}

          {/* Color Gradient Scale Legend */}
          <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-md border border-border/70 bg-background/85 px-3 py-2 backdrop-blur-md">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "moisture" ? "SMAP Volumetric Water Column (m³/m³)" : "NISAR / Landsat Canopy Index"}
            </p>
            <div className="mt-1.5 h-1.5 w-36 rounded-full bg-[linear-gradient(to_right,#c2603a,#ffc857,#3fa9ff)]" />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>Dry / Stressed</span>
              <span>Optimal Saturation</span>
            </div>
          </div>
        </div>

        {/* Right NASA Dataset Telemetry Rail */}
        <aside className="panel-fs" style={{ borderLeft: "1px solid var(--line)" }}>
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="mono" style={{ fontSize: "11px", color: "var(--cy)" }}>
              ◔ NASA DATASET TELEMETRY
            </span>
            <Link
              to="/datasets"
              className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              OFFLINE GRANULES ›
            </Link>
          </div>

          <h2 className="lx" style={{ fontSize: "22px" }}>
            Soil &amp; Canopy State
          </h2>

          {/* Card 1: Soil Moisture */}
          <div className="card-fs mc-fs">
            <div className="h">
              <span>Soil Moisture</span>
              <small>SMAP ROOT-ZONE</small>
            </div>
            <div className="d">
              <b>{(selectedField.telemetry.smapVwc * 100).toFixed(1)} %</b>
              <small className="lab-fs" style={{ textTransform: "none" }}>
                Optimal capacity: 28-36%
              </small>
            </div>
            <div style={{ height: "36px" }}>
              <Sparkline data={[0.05, 0.25, 0.5, 0.65, 0.9, 0.8]} color="#00e5ff" height={36} />
            </div>
          </div>

          {/* Card 2: Evapotranspiration */}
          <div className="card-fs mc-fs">
            <div className="h">
              <span>Evapotranspiration</span>
              <small>OpenET MONTHLY</small>
            </div>
            <div className="d">
              <b>{Math.round(selectedField.telemetry.etaMmDay * 30)} mm</b>
              <small className="lab-fs" style={{ textTransform: "none" }}>
                Water loss benchmark: normal
              </small>
            </div>
            <div className="bars-fs">
              {[8, 11, 13, 16, 22, 29, 24].map((h, i) => (
                <i key={i} style={{ height: `${h * 1.2}px` }} />
              ))}
            </div>
          </div>

          {/* Card 3: Surface Temperature */}
          <div className="card-fs mc-fs">
            <div className="h">
              <span>Surface Temp</span>
              <small>ECOSTRESS THERMAL</small>
            </div>
            <div className="d">
              <b>{selectedField.telemetry.lstC.toFixed(1)} °C</b>
              <small className="lab-fs" style={{ textTransform: "none" }}>
                {selectedField.telemetry.lstC > 34 ? "Heat anomaly active" : "No critical heat anomalies"}
              </small>
            </div>
            <div className="grad-fs" />
          </div>

          {/* Card 4: NDVI */}
          <div className="card-fs mc-fs">
            <div className="h">
              <span>NDVI</span>
              <small>LANDSAT TIME-SERIES</small>
            </div>
            <div className="d">
              <b>{selectedField.telemetry.ndvi.toFixed(2)} Max</b>
              <small className="lab-fs" style={{ textTransform: "none" }}>
                {selectedField.telemetry.ndvi > 0.6 ? "Healthy dense canopy" : "Moderate canopy cover"}
              </small>
            </div>
            <div style={{ height: "36px" }}>
              <Sparkline
                data={[0.05, 0.2, 0.45, 0.75, 0.95, 0.98]}
                color="#10b981"
                height={36}
              />
            </div>
          </div>

          {/* SoilGrids Characteristics */}
          <div className="card-fs p-3 space-y-1.5 font-mono text-[11px] bg-secondary/20">
            <div className="flex justify-between text-muted-foreground">
              <span>Soil Texture:</span>
              <span className="text-foreground capitalize">{selectedField.soil.texture}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Soil pH:</span>
              <span className="text-cyan-400 font-semibold">{selectedField.soil.ph.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Organic Carbon:</span>
              <span className="text-emerald-400 font-semibold">
                {selectedField.soil.organicCarbonPct.toFixed(2)} %
              </span>
            </div>
          </div>

          <Link
            to="/datasets"
            className="card-fs p-3 font-mono text-xs flex items-center justify-between hover:border-cyan-500/50 transition-colors group"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] text-cyan-400 block font-bold">NASA EARTHDATA OFFLINE CACHE</span>
              <span className="text-slate-400 text-[11px] block">Download SMAP &amp; Landsat GeoJSON</span>
            </div>
            <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
