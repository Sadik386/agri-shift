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
import { useLang } from "@/lib/i18n";

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
  const { lang } = useLang();
  const isBn = lang === "bn";
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
    { label: isBn ? "অনুকূল মৌসুম" : "Optimal Season", deficit: 0, mult: costs.fertilizerPriceIndex },
    { label: isBn ? "মাঝারি খরা" : "Moderate Drought", deficit: 25, mult: costs.fertilizerPriceIndex * 1.1 },
    { label: isBn ? "চরম জলবায়ু চাপ" : "Severe Stress", deficit: 50, mult: costs.fertilizerPriceIndex * 1.25 },
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
      eyebrow={isBn ? "মডিউল ০৫" : "Module 05"}
      title={isBn ? "আর্থিক ঝুঁকি ক্যালকুলেটর ও ৩D লাভ-লোকসান সারফেস" : "Financial risk calculator & 3D profit surface"}
      right={
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded border border-border/80 bg-secondary/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={isBn ? "বেসলাইন কৃষি খরচে পুনঃস্থাপন করুন" : "Reset costs to baseline agronomic defaults"}
        >
          <RotateCcw className="w-3 h-3" />
          {isBn ? "বেসলাইন খরচে ফেরত যান" : "Reset Baseline Costs"}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Risk Distribution Monte Carlo Stat Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatusBadge
            label={isBn ? "P10 সর্বোচ্চ ঝুঁকি" : "P10 Downside Risk"}
            value={formatBdt(bands.p10 * 1000)}
            tone={bands.p10 < 0 ? "rose" : "amber"}
            hint={isBn ? "১০ম পার্সেন্টাইল চরম খরা ও ব্যয় ধাক্কা" : "10th percentile worst-case drought/cost shock"}
          />
          <StatusBadge
            label={isBn ? "P50 প্রত্যাশিত মধ্যক" : "P50 Expected Median"}
            value={formatBdt(bands.p50 * 1000)}
            tone="cyan"
            hint={isBn ? "২,৫০০টি সিমুলেশনে প্রত্যাশিত মধ্যক লাভ" : "Median expected margin across 2,500 simulations"}
          />
          <StatusBadge
            label={isBn ? "P90 সর্বোচ্চ সম্ভাব্যতা" : "P90 Upside Potential"}
            value={formatBdt(bands.p90 * 1000)}
            tone="green"
            hint={isBn ? "৯০তম পার্সেন্টাইল অনুকূল আবহাওয়া ও বাজারদর" : "90th percentile favorable weather & pricing"}
          />
          <StatusBadge
            label={isBn ? "খরা ব্রেক-ইভেন স্তর" : "Drought Break-Even"}
            value={bands.breakEvenDeficitPct !== null ? `${bands.breakEvenDeficitPct}%` : (isBn ? "ক্ষতি নেই" : "No Loss")}
            unit={bands.breakEvenDeficitPct !== null ? (isBn ? "ঘাটতি" : "deficit") : ""}
            tone={
              bands.breakEvenDeficitPct === null || bands.breakEvenDeficitPct > 40
                ? "green"
                : bands.breakEvenDeficitPct > 20
                  ? "amber"
                  : "rose"
            }
            hint={isBn ? "নিট লাভ শূন্যে নামার পূর্ব পর্যন্ত বৃষ্টির ঘাটতি" : "Rainfall deficit before margin crosses into negative"}
          />
        </div>

        {/* 3D Surface & Slider Controls Grid */}
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {/* 3D Profit Surface Scene */}
          <SceneFrame
            className="h-[380px] lg:h-[460px]"
            caption={isBn 
              ? "ইন্টারেক্টিভ ৩D মুনাফা ল্যান্ডস্কেপ · ঘোরাতে ড্র্যাগ করুন · জিরো-প্লেন দেখতে জুম করুন"
              : "Interactive 3D Profit Landscape · Drag to rotate · Zoom to inspect zero-plane"}
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
                  {isBn ? "মন্টে কার্লো মুনাফা সারফেস গণনা করা হচ্ছে…" : "COMPUTING MONTE CARLO PROFIT SURFACE…"}
                </div>
              }
            >
              <ProfitSurfaceScene surface={surface} />
            </Suspense>

            {/* Zero-profit Plane / Palette Guide */}
            <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md border border-border/70 bg-background/85 px-2.5 py-2 backdrop-blur-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {isBn ? "উচ্চতা ও রঙ সূচক" : "Surface Elevation & Color"}
              </p>
              <div className="mt-1.5 h-1.5 w-32 rounded-full bg-[linear-gradient(to_right,#ff5d5d,#ffc857,#4ce0a5)]" />
              <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground">
                <span className="text-rose-400">{isBn ? "ঘাটতি জনিত ক্ষতি" : "Deficit Loss"}</span>
                <span className="text-emerald-400">{isBn ? "উচ্চ নিট মুনাফা" : "High Margin"}</span>
              </div>
            </div>
          </SceneFrame>

          {/* Interactive Cost Sliders & Price Index */}
          <div className="space-y-4 self-start rounded-xl border border-border/80 bg-secondary/20 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
                  {isBn ? "উৎপাদন খরচ কাঠামো (টাকা/একর)" : "Cost Architecture (BDT/Acre)"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                {isBn ? `ফসল: ${crop.name}` : `Crop: ${crop.name}`}
              </span>
            </div>

            {/* Seed Cost Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{isBn ? "বীজ খরচ:" : "Seed Cost:"}</span>
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
                <span className="text-muted-foreground">{isBn ? "সার খরচ (বেসলাইন):" : "Fertilizer (Baseline):"}</span>
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
                <span className="text-muted-foreground">{isBn ? "জ্বালানি ও জমি চাষ:" : "Fuel & Tillage:"}</span>
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
                <span className="text-muted-foreground">{isBn ? "সেচ খরচ (ডিজেল/বিদ্যুৎ):" : "Irrigation Power (Diesel/Electric):"}</span>
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
                <span className="text-muted-foreground">{isBn ? "বিশ্বব্যাপী সারের মূল্য সূচক:" : "Fertilizer Global Price Index:"}</span>
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
                <span>{isBn ? "-৩০% ভরতুকি" : "-30% Subsidized"}</span>
                <span>{isBn ? "বর্তমান ১.০×" : "Current 1.0×"}</span>
                <span>{isBn ? "+৫০% বৈশ্বিক বৃদ্ধি" : "+50% Global Spike"}</span>
              </div>
            </div>

            {/* Legume Nitrogen Credit Toggle */}
            <div className="pt-2 border-t border-border/60">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-foreground block">
                    {isBn ? "ডালজাতীয় নাইট্রোজেন ক্রেডিট (-২০% ইউরিয়া)" : "Legume N-Credit (-20% Urea)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {hasLegume
                      ? (isBn ? "পর্যায়ক্রমে সক্রিয় (মুগডাল নাইট্রোজেন যোগ করে)" : "Active in rotation (Mungbean fixes N)")
                      : (isBn ? "পর্যায়ক্রমে কোনো ডালজাতীয় ফসল নেই" : "No legume in rotation sequence")}
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
            {isBn ? "জলবায়ু ধাক্কা সংবেদনশীলতা ম্যাট্রিক্স (প্রতি একরে আয়)" : "Scenario Sensitivity Matrix (Per Acre Return)"}
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
                      {sc.deficit}% {isBn ? "বৃষ্টির ঘাটতি" : "Rain Deficit"}
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
                      <span>{isBn ? "খামার পর্যায়ের মোট আয়:" : "Gross Farmgate Revenue:"}</span>
                      <span className="text-foreground">৳{sc.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isBn ? "মোট পরিচালন ব্যয়:" : "Operational Inputs:"}</span>
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
