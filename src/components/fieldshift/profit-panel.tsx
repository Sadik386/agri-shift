import { Suspense, lazy, useState, useMemo } from "react";
import { Panel, SceneFrame, StatusBadge } from "./ui";
import { CROPS } from "@/lib/fieldshift/data";
import {
  buildProfitSurface,
  defaultCosts,
  formatBdt,
  netProfitBdtAcre,
  riskBands,
} from "@/lib/fieldshift/finance";
import { cn } from "@/lib/utils";
import type { CostInputs, FieldSite, RotationPlan, Crop } from "@/lib/fieldshift/types";
import { RotateCcw, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Gauge, Sliders } from "lucide-react";

const ProfitSurfaceScene = lazy(() =>
  import("./profit-surface-scene").then((m) => ({ default: m.ProfitSurfaceScene })),
);

export function ProfitPanel({
  field,
  plan,
}: {
  field: FieldSite;
  plan: RotationPlan;
}) {
  const initialCosts = useMemo(() => defaultCosts(field, plan), [field, plan]);
  const [costs, setCosts] = useState<CostInputs>(initialCosts);
  const [nitrogenCreditActive, setNitrogenCreditActive] = useState(true);

  // Sync if plan changes
  useMemo(() => {
    setCosts(defaultCosts(field, plan));
  }, [field, plan]);

  const hasLegume = plan.cropIds.some((id) => CROPS[id]?.nitrogenFixing);
  const crop: Crop = CROPS[plan.cropIds[0]] ?? CROPS["maize"]!;

  const surface = useMemo(
    () => buildProfitSurface(field, plan, costs),
    [field, plan, costs],
  );

  const bands = useMemo(
    () => riskBands(field, plan, costs, 2500),
    [field, plan, costs],
  );

  const handleReset = () => {
    setCosts(defaultCosts(field, plan));
  };

  const handleCostChange = (key: keyof CostInputs, val: number) => {
    setCosts((prev) => ({ ...prev, [key]: val }));
  };

  // Scenarios for quick comparison
  const scenarios = [
    { label: "Optimal Season", deficit: 0, mult: costs.fertilizerPriceIndex },
    { label: "Moderate Drought", deficit: 25, mult: costs.fertilizerPriceIndex * 1.1 },
    { label: "Severe Stress", deficit: 50, mult: costs.fertilizerPriceIndex * 1.25 },
  ].map((sc) => {
    const net = netProfitBdtAcre({
      field,
      plan,
      costs,
      deficitPct: sc.deficit,
      priceIndex: sc.mult,
      applyNitrogenCredit: nitrogenCreditActive,
    });
    const yieldLoss = Math.min(0.85, sc.deficit * crop.droughtSensitivity);
    const revenue = Math.round(crop.yieldKgAcre * (1 - yieldLoss) * crop.priceBdtKg);
    const totalCost = revenue - net;
    const roi = totalCost > 0 ? ((net / totalCost) * 100).toFixed(0) : "0";
    return { ...sc, net, revenue, totalCost, roi };
  });

  return (
    <Panel
      eyebrow="Module 05"
      title="Financial risk calculator & 3D profit surface"
      right={
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded border border-border/80 bg-secondary/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Reset costs to baseline agronomic defaults"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Baseline Costs
        </button>
      }
    >
      <div className="space-y-6">
        {/* Risk Distribution Monte Carlo Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusBadge
            label="P10 Downside Risk"
            value={formatBdt(bands.p10 * 1000)}
            tone={bands.p10 < 0 ? "rose" : "amber"}
            hint="10th percentile worst-case drought/cost shock"
          />
          <StatusBadge
            label="P50 Expected Median"
            value={formatBdt(bands.p50 * 1000)}
            tone="cyan"
            hint="Median expected margin across 2,500 simulations"
          />
          <StatusBadge
            label="P90 Upside Potential"
            value={formatBdt(bands.p90 * 1000)}
            tone="green"
            hint="90th percentile favorable weather & pricing"
          />
          <StatusBadge
            label="Drought Break-Even"
            value={bands.breakEvenDeficitPct !== null ? `${bands.breakEvenDeficitPct}%` : "No Loss"}
            unit={bands.breakEvenDeficitPct !== null ? "deficit" : ""}
            tone={
              bands.breakEvenDeficitPct === null || bands.breakEvenDeficitPct > 40
                ? "green"
                : bands.breakEvenDeficitPct > 20
                  ? "amber"
                  : "rose"
            }
            hint="Rainfall deficit before margin crosses into negative"
          />
        </div>

        {/* 3D Surface & Slider Controls Grid */}
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* 3D Profit Surface Scene */}
          <SceneFrame
            className="h-[380px] lg:h-[460px]"
            caption="Interactive 3D Profit Landscape · Drag to rotate · Zoom to inspect zero-plane"
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                  COMPUTING MONTE CARLO PROFIT SURFACE…
                </div>
              }
            >
              <ProfitSurfaceScene surface={surface} />
            </Suspense>

            {/* Zero-profit Plane / Palette Guide */}
            <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-border/70 bg-background/85 px-2.5 py-2 backdrop-blur-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Surface Elevation & Color
              </p>
              <div className="mt-1.5 h-1.5 w-32 rounded-full bg-[linear-gradient(to_right,#ff5d5d,#ffc857,#4ce0a5)]" />
              <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                <span className="text-rose-400">Deficit Loss</span>
                <span className="text-emerald-400">High Margin</span>
              </div>
            </div>
          </SceneFrame>

          {/* Interactive Cost Sliders & Price Index */}
          <div className="space-y-4 self-start rounded-xl border border-border/80 bg-secondary/20 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
                  Cost Architecture (BDT/Acre)
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                Crop: {crop.name}
              </span>
            </div>

            {/* Seed Cost Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Seed Cost:</span>
                <span className="font-mono text-foreground font-semibold">
                  ৳{costs.seed.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                step="200"
                value={costs.seed}
                onChange={(e) => handleCostChange("seed", Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Fertilizer Cost Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fertilizer (Baseline):</span>
                <span className="font-mono text-foreground font-semibold">
                  ৳{costs.fertilizer.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="3000"
                max="25000"
                step="500"
                value={costs.fertilizer}
                onChange={(e) => handleCostChange("fertilizer", Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Fuel & Machinery Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fuel & Tillage:</span>
                <span className="font-mono text-foreground font-semibold">
                  ৳{costs.fuel.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="12000"
                step="200"
                value={costs.fuel}
                onChange={(e) => handleCostChange("fuel", Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Irrigation Pumping Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Irrigation Power (Diesel/Electric):</span>
                <span className="font-mono text-foreground font-semibold">
                  ৳{Math.round(costs.irrigation).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="22000"
                step="500"
                value={costs.irrigation}
                onChange={(e) => handleCostChange("irrigation", Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            {/* Fertilizer Price Index Multiplier */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fertilizer Global Price Index:</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {costs.fertilizerPriceIndex.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={costs.fertilizerPriceIndex}
                onChange={(e) => handleCostChange("fertilizerPriceIndex", Number(e.target.value))}
                className="w-full accent-amber-400 h-1.5 bg-secondary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                <span>-30% Subsidized</span>
                <span>Current 1.0×</span>
                <span>+50% Global Spike</span>
              </div>
            </div>

            {/* Legume Nitrogen Credit Toggle */}
            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-foreground block">
                    Legume N-Credit (-20% Urea)
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {hasLegume
                      ? "Active in rotation (Mungbean fixes N)"
                      : "No legume in rotation sequence"}
                  </span>
                </div>
                <input
                  type="checkbox"
                  disabled={!hasLegume}
                  checked={nitrogenCreditActive && hasLegume}
                  onChange={(e) => setNitrogenCreditActive(e.target.checked)}
                  className="rounded border-border accent-primary h-4 w-4 disabled:opacity-40"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Climate Shock Scenario Comparison Matrix */}
        <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Scenario Sensitivity Matrix (Per Acre Return)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scenarios.map((sc) => {
              const isProfitable = sc.net > 0;
              return (
                <div
                  key={sc.label}
                  className={cn(
                    "rounded-lg border p-3 bg-card/40 space-y-2",
                    isProfitable ? "border-border/80" : "border-rose-500/40 bg-rose-500/[0.04]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{sc.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {sc.deficit}% Rain Deficit
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-mono text-xl font-bold tracking-tight" style={{ color: isProfitable ? "#4ce0a5" : "#ff5d5d" }}>
                      {formatBdt(sc.net)}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ROI: <span className={isProfitable ? "text-emerald-400" : "text-rose-400"}>{sc.roi}%</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 space-y-1 font-mono text-[10px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Gross Farmgate Revenue:</span>
                      <span className="text-foreground">৳{sc.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operational Inputs:</span>
                      <span className="text-foreground">৳{sc.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
