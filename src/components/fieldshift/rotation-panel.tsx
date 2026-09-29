import { Suspense, lazy, useState, useEffect } from "react";
import { Panel, SceneFrame, StatusBadge } from "./ui";
import { CROPS, CROP_LIST, ROTATION_PLANS } from "@/lib/fieldshift/data";
import { evaluateRotation } from "@/lib/fieldshift/agronomy";
import { formatBdt } from "@/lib/fieldshift/finance";
import { cn } from "@/lib/utils";
import type { Crop, FieldSite, RotationPlan } from "@/lib/fieldshift/types";
import { Play, Pause, RotateCcw, Droplets, TrendingUp, ShieldCheck, Sparkles, Layers } from "lucide-react";

const SoilProfileScene = lazy(() =>
  import("./soil-profile-scene").then((m) => ({ default: m.SoilProfileScene })),
);

export function RotationPanel({
  field,
  selectedPlan,
  onSelectPlan,
}: {
  field: FieldSite;
  selectedPlan: RotationPlan;
  onSelectPlan: (plan: RotationPlan) => void;
}) {
  const [customCrops, setCustomCrops] = useState<[string, string, string]>(selectedPlan.cropIds);
  const [isCustom, setIsCustom] = useState(false);
  const [activeYearIndex, setActiveYearIndex] = useState(0);
  const [growth, setGrowth] = useState(0.85);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync custom crops when preset changes externally
  useEffect(() => {
    if (!isCustom) {
      setCustomCrops(selectedPlan.cropIds);
    }
  }, [selectedPlan, isCustom]);

  // Handle auto-growth animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setGrowth((prev) => {
        if (prev >= 1) return 0.05;
        return Math.min(1, prev + 0.025);
      });
    }, 70);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentPlan: RotationPlan = isCustom
    ? {
        id: "custom",
        label: `${CROPS[customCrops[0]]?.name || "Year 1"} → ${CROPS[customCrops[1]]?.name || "Year 2"} → ${CROPS[customCrops[2]]?.name || "Year 3"}`,
        cropIds: customCrops,
        note: "Custom user-configured 3-year crop sequence.",
      }
    : selectedPlan;

  const outcome = evaluateRotation(currentPlan, field);
  const activeCropId = currentPlan.cropIds[activeYearIndex] ?? currentPlan.cropIds[0];
  const activeCrop: Crop = CROPS[activeCropId] ?? CROPS["maize"]!;

  const handleCustomCropChange = (index: 0 | 1 | 2, cropId: string) => {
    const updated: [string, string, string] = [...customCrops];
    updated[index] = cropId;
    setCustomCrops(updated);
    setIsCustom(true);
    onSelectPlan({
      id: "custom",
      label: `${CROPS[updated[0]]?.name} → ${CROPS[updated[1]]?.name} → ${CROPS[updated[2]]?.name}`,
      cropIds: updated,
      note: "Custom user-configured 3-year crop sequence.",
    });
  };

  const handleSelectPreset = (plan: RotationPlan) => {
    setIsCustom(false);
    setCustomCrops(plan.cropIds);
    onSelectPlan(plan);
  };

  const stages = [
    { label: "Germination", val: 0.15 },
    { label: "Vegetative", val: 0.45 },
    { label: "Flowering", val: 0.75 },
    { label: "Harvest", val: 1.0 },
  ];

  return (
    <Panel
      eyebrow="Module 03"
      title="3-year crop rotation planner & dynamic soil profile"
      right={
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
            Preservation Index:
          </span>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
            {outcome.waterSavingPct > 0 ? `+${outcome.waterSavingPct}% WATER SAVED` : "BASELINE DRAW"}
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Preset Rotation Plan Selector */}
        <div>
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
            Select Rotation Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {ROTATION_PLANS.map((plan) => {
              const isSelected = !isCustom && selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPreset(plan)}
                  className={cn(
                    "flex flex-col text-left p-3 rounded-lg border transition-all relative overflow-hidden",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(79,209,255,0.15)] ring-1 ring-primary/40"
                      : "border-border/80 bg-secondary/30 hover:border-border hover:bg-secondary/50",
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-semibold text-xs text-foreground">
                      {plan.id === "climate-smart" && "⚡ "}
                      {plan.id === "water-lean" && "💧 "}
                      {plan.id === "business-as-usual" && "⚠️ "}
                      {plan.id === "fibre-food" && "🌾 "}
                      {plan.label.split(" → ")[0]} + 2
                    </span>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <span className="font-mono text-[11px] text-foreground/90 truncate w-full">
                    {plan.label}
                  </span>
                  <p className="mt-1.5 text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {plan.note}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Year Sequence Interactive Stage Builder */}
        <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Sequence Architecture (Click Year to preview 3D root zone)
              </p>
              <p className="text-xs text-foreground/80 mt-0.5">
                Each year influences soil carbon accumulation and subsequent season fertilizer requirements.
              </p>
            </div>
            {isCustom && (
              <span className="px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Custom Configuration
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {currentPlan.cropIds.map((cropId, idx) => {
              const crop: Crop = CROPS[cropId] ?? CROPS["maize"]!;
              const yearData = outcome.years[idx];
              const isActive = activeYearIndex === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveYearIndex(idx)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-3.5 transition-all relative",
                    isActive
                      ? "border-primary bg-primary/10 shadow-[0_0_12px_rgba(79,209,255,0.12)]"
                      : "border-border/70 bg-card/40 hover:bg-card/70",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Year {idx + 1}
                    </span>
                    {crop.nitrogenFixing && (
                      <span className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Sparkles className="w-2.5 h-2.5" /> N-FIXING
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{crop.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <select
                        value={cropId}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleCustomCropChange(idx as 0 | 1 | 2, e.target.value);
                        }}
                        className="w-full bg-secondary/80 border border-border/80 rounded px-2 py-1 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {CROP_LIST.map((c) => (
                          <option key={c.id} value={c.id} className="bg-card text-foreground">
                            {c.emoji} {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 font-mono text-[11px] border-t border-border/50 pt-2.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Water Need:</span>
                      <span className="text-foreground">{crop.waterNeedMm} mm</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Irrigation Deficit:</span>
                      <span className={yearData && yearData.irrigationMm > 500 ? "text-amber-400" : "text-cyan-400"}>
                        {yearData?.irrigationMm ?? 0} mm
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Soil Organic Carbon:</span>
                      <span className="text-emerald-400 font-medium">{yearData?.socPct}%</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Est. Net Margin:</span>
                      <span className="text-foreground font-medium">
                        {yearData ? formatBdt(yearData.netProfitBdtAcre) : "৳0"}/ac
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3D Soil Profile & Multi-metric Analytics Grid */}
        <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          {/* 3D Soil Profile Viewer */}
          <SceneFrame
            className="h-[380px] lg:h-[440px]"
            caption={`Soil Horizon & Root System: ${activeCrop.name} · Root Depth ${Math.round(activeCrop.rootDepthCm * growth)} cm`}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                  COMPUTING STRATIGRAPHY & ROOT MORPHOLOGY…
                </div>
              }
            >
              <SoilProfileScene
                layers={field.soilLayers}
                crop={activeCrop}
                growth={growth}
              />
            </Suspense>

            {/* Growth Stage Controls Floating Overlay */}
            <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-border/80 bg-background/80 p-2 backdrop-blur-md">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 rounded bg-primary/20 hover:bg-primary/30 border border-primary/40 px-2 py-1 font-mono text-[10px] text-primary transition-colors"
                title={isPlaying ? "Pause simulation" : "Play seasonal growth cycle"}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {isPlaying ? "PAUSE" : "PLAY CYCLE"}
              </button>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setGrowth(0.1);
                }}
                className="rounded bg-secondary/60 hover:bg-secondary border border-border/80 p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Reset germination stage"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <div className="h-4 w-[1px] bg-border/80 mx-0.5" />
              <div className="flex items-center gap-1">
                {stages.map((st) => (
                  <button
                    key={st.label}
                    onClick={() => {
                      setIsPlaying(false);
                      setGrowth(st.val);
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider transition-colors",
                      Math.abs(growth - st.val) < 0.12
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    )}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stratigraphy Legend Overlay */}
            <div className="pointer-events-none absolute right-3 bottom-8 z-20 space-y-1 rounded border border-border/70 bg-background/85 p-2 backdrop-blur-md">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Soil Stratigraphy
              </p>
              {field.soilLayers.map((l) => (
                <div key={l.label} className="flex items-center gap-2 font-mono text-[9px]">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: l.color }} />
                  <span className="text-foreground/90">{l.label}</span>
                  <span className="text-cyan-400 font-medium ml-auto">{l.moisturePct}% H₂O</span>
                </div>
              ))}
            </div>
          </SceneFrame>

          {/* Outcome Metric Cards */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3">
              <StatusBadge
                label="Groundwater Drawdown"
                value={`${outcome.waterSavingPct > 0 ? "-" : "+"}${Math.abs(outcome.waterSavingPct)}`}
                unit="%"
                tone={outcome.waterSavingPct >= 20 ? "green" : outcome.waterSavingPct > 0 ? "cyan" : "rose"}
                hint="Relative to 3-year continuous Boro practice"
              />
              <StatusBadge
                label="Soil Organic Carbon"
                value={`+${outcome.socGainPct}`}
                unit="%"
                tone="green"
                hint="3-year microbial biomass accumulation"
              />
              <StatusBadge
                label="N Fertilizer Savings"
                value={`${outcome.fertilizerSavingPct}`}
                unit="%"
                tone={outcome.fertilizerSavingPct > 0 ? "green" : "amber"}
                hint="Nitrogen fixed via rhizobia root nodules"
              />
              <StatusBadge
                label="3-Yr Cumulative Profit"
                value={formatBdt(outcome.totalProfitBdtAcre)}
                tone="cyan"
                hint="Net margin across all 3 rotation seasons"
              />
            </div>

            {/* Agronomic Impact Summary Card */}
            <div className="rounded-lg border border-border/80 bg-secondary/30 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Resilience & Aquifer Protection Analysis
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                In Bangladesh's northwestern drought-prone Barind tract and char ecosystems, continuous flood-irrigated Boro rice causes groundwater table depletion of up to 0.75m/year. Introducing deep-rooting Sorghum and nitrogen-fixing Mungbean cover crops recovers subsoil hydraulic conductivity, suppresses weed cycles, and breaks root-knot nematode lifecycles without chemical fumigation.
              </p>
              <div className="pt-2 border-t border-border/60 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                <span>Selected Crop Canopy Vigour:</span>
                <span className="font-semibold text-foreground" style={{ color: activeCrop.canopyColor }}>
                  {activeCrop.emoji} {activeCrop.name} (NDVI Ref: {(activeCrop.droughtSensitivity < 0.008 ? "High Resilience" : "Moderate")})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
