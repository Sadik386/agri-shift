import { Suspense, lazy, useState } from "react";
import { Panel, SceneFrame, Meter } from "./ui";
import { CROPS } from "@/lib/fieldshift/data";
import { moistureGrid } from "@/lib/fieldshift/agronomy";
import { cn } from "@/lib/utils";
import type { FieldSite } from "@/lib/fieldshift/types";

const FieldTerrainScene = lazy(() =>
  import("./field-terrain-scene").then((m) => ({ default: m.FieldTerrainScene })),
);

export function TerrainPanel({ field }: { field: FieldSite }) {
  const [mode, setMode] = useState<"moisture" | "canopy">("moisture");
  const crop = CROPS[field.currentCropId]!;
  const grid = moistureGrid(field, 9).flat();
  const driest = Math.min(...grid);
  const wettest = Math.max(...grid);

  return (
    <Panel
      eyebrow="Module 02"
      title="3D field polygon, terrain & volumetric overlays"
      right={
        <div className="flex rounded-md border border-border/70 bg-secondary/50 p-0.5">
          {(["moisture", "canopy"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "moisture" ? "Root moisture" : "Canopy height"}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SceneFrame
          className="h-[340px] lg:h-[420px]"
          caption={`${field.name} · ${field.areaAcres} acres · DEM ${field.elevationM} m`}
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                EXTRUDING FIELD…
              </div>
            }
          >
            <FieldTerrainScene field={field} mode={mode} />
          </Suspense>
          <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-border/70 bg-[oklch(0.17_0.02_250)]/80 px-2.5 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "moisture" ? "SMAP column · m³/m³" : "NISAR canopy · NDVI"}
            </p>
            <div className="mt-1.5 h-1.5 w-32 rounded-full bg-[linear-gradient(to_right,#c2603a,#ffc857,#3fa9ff)]" />
            <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>{mode === "moisture" ? "dry" : "bare"}</span>
              <span>{mode === "moisture" ? "saturated" : "full"}</span>
            </div>
          </div>
        </SceneFrame>

        <div className="space-y-4 self-start">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/80 bg-secondary/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Standing crop
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {crop.emoji} {crop.name}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Root depth {crop.rootDepthCm} cm · season need {crop.waterNeedMm} mm
              </p>
            </div>
            <div className="rounded-lg border border-border/80 bg-secondary/40 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Within-field spread
              </p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {driest.toFixed(2)} – {wettest.toFixed(2)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {Math.round(((wettest - driest) / wettest) * 100)}% variation across the plot
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/80 bg-secondary/30 p-3">
            <Meter label="Field area" value={field.areaAcres} max={20} suffix=" ac" tone="cyan" />
            <Meter
              label="Elevation (DEM)"
              value={field.elevationM}
              max={40}
              suffix=" m"
              tone="amber"
            />
            <Meter
              label="Canopy cover (NDVI)"
              value={Math.round(field.telemetry.ndvi * 100)}
              max={100}
              suffix=" %"
              tone="green"
            />
            <Meter
              label="Surface wetness"
              value={Math.round(field.telemetry.smapVwc * 100)}
              max={50}
              suffix=" %"
              tone="cyan"
            />
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Each column is one management zone. Height and colour carry the fused satellite value,
            so the driest corners of the plot are visible before walking the field.
          </p>
        </div>
      </div>
    </Panel>
  );
}
