import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import { FIELDS, ROTATION_PLANS } from "@/lib/fieldshift/data";
import { fetchLiveSoil, fetchLiveWeather, type LiveSoil, type LiveWeather } from "@/lib/fieldshift/external.functions";
import type { FieldSite, RotationPlan } from "@/lib/fieldshift/types";

import { Sidebar } from "@/components/fieldshift/sidebar";
import { Header } from "@/components/fieldshift/header";
import { TelemetryPanel } from "@/components/fieldshift/telemetry-panel";
import { TerrainPanel } from "@/components/fieldshift/terrain-panel";
import { RotationPanel } from "@/components/fieldshift/rotation-panel";
import { AdvisoryPanel } from "@/components/fieldshift/advisory-panel";
import { ProfitPanel } from "@/components/fieldshift/profit-panel";
import { RegionalPanel } from "@/components/fieldshift/regional-panel";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const [selectedField, setSelectedField] = useState<FieldSite>(FIELDS[0]!);
  const [selectedSeason, setSelectedSeason] = useState<string>("rabi");
  const [selectedPlan, setSelectedPlan] = useState<RotationPlan>(ROTATION_PLANS[0]!);
  const [activeSection, setActiveSection] = useState<string>("telemetry");

  const [liveSoil, setLiveSoil] = useState<LiveSoil | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync live external feeds (SoilGrids & Open-Meteo) for the selected field
  const syncFeeds = useCallback(async (field: FieldSite) => {
    setIsSyncing(true);
    try {
      const [soilRes, weatherRes] = await Promise.allSettled([
        fetchLiveSoil({ data: { lat: field.lat, lon: field.lon } }),
        fetchLiveWeather({ data: { lat: field.lat, lon: field.lon } }),
      ]);

      if (soilRes.status === "fulfilled" && soilRes.value.ok) {
        setLiveSoil(soilRes.value);
      } else {
        setLiveSoil(null);
      }

      if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
        setLiveWeather(weatherRes.value);
      } else {
        setLiveWeather(null);
      }
    } catch (err) {
      console.warn("Could not sync live feeds, using modeled and calibrated sample values:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on initial load and when field changes
  useEffect(() => {
    syncFeeds(selectedField);
  }, [selectedField, syncFeeds]);

  // Merge live telemetry & soil readings if available
  const activeField: FieldSite = useMemo(() => {
    const f: FieldSite = {
      ...selectedField,
      soil: { ...selectedField.soil },
      telemetry: { ...selectedField.telemetry },
    };

    if (liveSoil?.ok) {
      if (liveSoil.ph !== undefined) f.soil.ph = liveSoil.ph;
      if (liveSoil.clayPct !== undefined) f.soil.clayPct = liveSoil.clayPct;
      if (liveSoil.sandPct !== undefined) f.soil.sandPct = liveSoil.sandPct;
      if (liveSoil.siltPct !== undefined) f.soil.siltPct = liveSoil.siltPct;
      if (liveSoil.organicCarbonPct !== undefined) f.soil.organicCarbonPct = liveSoil.organicCarbonPct;
      f.soil.origin = "live";
    }

    if (liveWeather?.ok) {
      if (liveWeather.rainfall7dMm !== undefined) f.telemetry.rainfall7dMm = liveWeather.rainfall7dMm;
      if (liveWeather.maxTempC !== undefined && liveWeather.maxTempC > -50) f.telemetry.lstC = liveWeather.maxTempC;
      f.telemetry.origin = "live";
    }

    return f;
  }, [selectedField, liveSoil, liveWeather]);

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-foreground flex flex-col lg:flex-row font-sans selection:bg-primary/30 selection:text-primary">
      {/* Fixed Desktop / Responsive Mobile Left Rail */}
      <Sidebar
        selectedField={activeField}
        onSelectField={(f) => {
          setSelectedField(f);
        }}
        selectedSeason={selectedSeason}
        onSelectSeason={setSelectedSeason}
        activeSection={activeSection}
        onNavigateSection={handleNavigateSection}
      />

      {/* Main Mission Control Canvas */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <Header
          field={activeField}
          isLiveWeather={Boolean(liveWeather?.ok)}
          isLiveSoil={Boolean(liveSoil?.ok)}
          isRefreshing={isSyncing}
          onRefresh={() => syncFeeds(selectedField)}
        />

        {/* Dashboard Modules Canvas */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Module 01: Satellite Fusion & Orbital Coverage */}
          <div id="telemetry" className="scroll-mt-20">
            <TelemetryPanel
              field={activeField}
              weatherNote={
                liveWeather?.ok
                  ? `Live 7-day observed: ${liveWeather.rainfall7dMm} mm`
                  : undefined
              }
            />
          </div>

          {/* Module 02: Field 3D Polygon & Volumetric Soil Moisture */}
          <div id="terrain" className="scroll-mt-20">
            <TerrainPanel field={activeField} />
          </div>

          {/* Module 03: 3-Year Crop Rotation Planner & 3D Soil Horizon */}
          <div id="rotation" className="scroll-mt-20">
            <RotationPanel
              field={activeField}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </div>

          {/* Module 04: Agronomic Anomaly Advisory & Microclimate Window */}
          <div id="advisory" className="scroll-mt-20">
            <AdvisoryPanel
              field={activeField}
              plan={selectedPlan}
              liveWeather={liveWeather}
              isLoadingWeather={isSyncing}
            />
          </div>

          {/* Module 05: Financial Risk Calculator & 3D Monte Carlo Surface */}
          <div id="profit" className="scroll-mt-20">
            <ProfitPanel field={activeField} plan={selectedPlan} />
          </div>

          {/* Module 06: Regional Collective Action & Market Balance */}
          <div id="regional" className="scroll-mt-20">
            <RegionalPanel currentField={activeField} />
          </div>

          {/* Mission Control Footer */}
          <footer className="pt-8 pb-12 border-t border-border/70 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <p className="font-mono text-xs font-semibold text-foreground tracking-wider uppercase">
                    Field Shift · Earth Observation Agronomy Engine
                  </p>
                </div>
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Engineered for the NASA Space Apps Challenge "Field Shift: Adapting Farms with NASA Data". Fusing synthetic aperture radar (SAR), passive radiometry, thermal infrared, and optical spectral bands to safeguard Bangladesh groundwater resources while maximising farmer profitability.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <span className="px-2.5 py-1 rounded bg-secondary/50 border border-border/60 text-foreground">
                  v2.05-PRODUCTION
                </span>
                <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/30 text-primary">
                  BANGLADESH GRID ACTIVE
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-muted-foreground">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>NASA/JPL SMAP (L3 Soil Moisture)</span>
                <span>USGS Landsat 9 (30m NDVI)</span>
                <span>OpenET (DisALEXI ETa)</span>
                <span>NASA ECOSTRESS (LST)</span>
                <span>ISRIC SoilGrids 250m</span>
                <span>Open-Meteo ECMWF</span>
              </div>
              <div>© 2026 Field Shift Consortium · Zero-credential instant deployment</div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
