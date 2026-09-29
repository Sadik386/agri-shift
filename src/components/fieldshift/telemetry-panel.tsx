import { Suspense, lazy } from "react";
import { Link } from "@tanstack/react-router";
import { Panel, SceneFrame, StatusBadge } from "./ui";
import { SATELLITES } from "@/lib/fieldshift/data";
import type { FieldSite } from "@/lib/fieldshift/types";

const GlobeScene = lazy(() =>
  import("./globe-scene").then((m) => ({ default: m.GlobeScene })),
);

export function TelemetryPanel({
  field,
  weatherNote,
}: {
  field: FieldSite;
  weatherNote?: string | undefined;
}) {
  const t = field.telemetry;
  return (
    <Panel
      eyebrow="Module 01"
      title="Data fusion & satellite telemetry"
      right={
        <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-2.5 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.8_0.17_150)]" />
          <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">
            STREAMS {SATELLITES.length + 2}/6 ONLINE
          </span>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        <SceneFrame className="h-[340px] lg:h-[420px]" caption="Orbital coverage · drag to rotate">
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                ACQUIRING ORBITS…
              </div>
            }
          >
            <GlobeScene field={field} />
          </Suspense>
          <div className="pointer-events-none absolute right-3 top-3 z-20 space-y-1.5">
            {SATELLITES.map((s) => (
              <div key={s.id} className="flex items-center justify-end gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{s.product}</span>
                <span className="font-mono text-[10px] text-foreground">{s.name}</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              </div>
            ))}
          </div>
        </SceneFrame>

        <div className="grid grid-cols-2 gap-3 self-start">
          <StatusBadge
            label="NDVI · Landsat 9"
            value={t.ndvi.toFixed(2)}
            tone="green"
            origin={t.origin}
            hint="Canopy vigour, 30 m resolution"
          />
          <StatusBadge
            label="ETa · OpenET"
            value={t.etaMmDay.toFixed(1)}
            unit="mm/d"
            tone="cyan"
            origin={t.origin}
            hint="Actual evapotranspiration"
          />
          <StatusBadge
            label="Soil moisture · SMAP"
            value={t.smapVwc.toFixed(2)}
            unit="m³/m³"
            tone="cyan"
            origin={t.origin}
            hint="Root zone 0–5 cm"
          />
          <StatusBadge
            label="LST · ECOSTRESS"
            value={t.lstC.toFixed(1)}
            unit="°C"
            tone={t.lstC > 34 ? "rose" : "amber"}
            origin={t.origin}
            hint="Land surface temperature"
          />
          <StatusBadge
            label="Rain 7d · GPM IMERG"
            value={String(Math.round(t.rainfall7dMm))}
            unit="mm"
            tone="cyan"
            origin={t.origin}
            hint={weatherNote ?? "Observed accumulation"}
          />
          <StatusBadge
            label="Structure · NISAR"
            value={t.structureIndex.toFixed(2)}
            tone="amber"
            origin="modeled"
            hint="L-band canopy structure index"
          />
          <StatusBadge
            label="Soil texture · SoilGrids"
            value={field.soil.texture}
            tone="amber"
            origin={field.soil.origin}
            hint={`Clay ${field.soil.clayPct.toFixed(0)}% · Sand ${field.soil.sandPct.toFixed(0)}% · Silt ${field.soil.siltPct.toFixed(0)}%`}
          />
          <StatusBadge
            label="Soil pH · SoilGrids"
            value={field.soil.ph.toFixed(1)}
            tone="green"
            origin={field.soil.origin}
            hint={`Organic carbon ${field.soil.organicCarbonPct.toFixed(2)}%`}
          />
        </div>
      </div>

      {/* Offline NASA Earthdata Indicator */}
      <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>7 NASA Earth Observation Datasets (SMAP, Landsat, ECOSTRESS, OpenET, NISAR, GRACE-FO, GPM) Cached for Offline Use</span>
        </div>
        <Link
          to="/datasets"
          className="text-cyan-400 hover:text-cyan-300 font-semibold tracking-wider text-[11px] transition-colors"
        >
          VIEW OFFLINE NASA CATALOG ›
        </Link>
      </div>
    </Panel>
  );
}
