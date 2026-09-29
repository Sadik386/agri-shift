import { CROPS } from "./data";
import { irrigationRequirementMm } from "./agronomy";
import type {
  CostInputs,
  FieldSite,
  ProfitSurface,
  RiskBands,
  RotationPlan,
} from "./types";

const NITROGEN_CREDIT = 0.2;
const OVERHEAD_BDT_ACRE = 4800;

/** Deterministic PRNG so server and client agree and nothing runs at module scope. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function defaultCosts(field: FieldSite, plan: RotationPlan): CostInputs {
  const crop = CROPS[plan.cropIds[0]]!;
  return {
    seed: crop.seedCostBdtAcre,
    fertilizer: crop.fertilizerCostBdtAcre,
    fuel: 5200,
    irrigation: irrigationRequirementMm(field, crop.waterNeedMm) * 22,
    fertilizerPriceIndex: 1,
  };
}

interface ProfitArgs {
  field: FieldSite;
  plan: RotationPlan;
  costs: CostInputs;
  /** rainfall deficit, percent */
  deficitPct: number;
  /** fertilizer price index, 1 = today */
  priceIndex: number;
  /** legume in the rotation credits nitrogen to the cash crop */
  applyNitrogenCredit?: boolean;
}

/** Net profit in BDT per acre for the rotation's cash crop under one scenario. */
export function netProfitBdtAcre({
  field,
  plan,
  costs,
  deficitPct,
  priceIndex,
  applyNitrogenCredit = true,
}: ProfitArgs): number {
  const crop = CROPS[plan.cropIds[0]]!;
  const hasLegume = plan.cropIds.some((id) => CROPS[id]!.nitrogenFixing);
  const credit = applyNitrogenCredit && hasLegume ? 1 - NITROGEN_CREDIT : 1;

  const yieldLoss = Math.min(0.85, deficitPct * crop.droughtSensitivity);
  const revenue = crop.yieldKgAcre * (1 - yieldLoss) * crop.priceBdtKg;

  // A drier season means more pumping to close the same water budget.
  const irrigation = costs.irrigation * (1 + deficitPct * 0.012);
  const fertilizer = costs.fertilizer * priceIndex * credit;
  const soilPenalty = field.soil.organicCarbonPct < 0.8 ? 1400 : 0;

  return Math.round(
    revenue - (costs.seed + fertilizer + costs.fuel + irrigation + OVERHEAD_BDT_ACRE + soilPenalty),
  );
}

export function buildProfitSurface(
  field: FieldSite,
  plan: RotationPlan,
  costs: CostInputs,
): ProfitSurface {
  const deficits = Array.from({ length: 13 }, (_, i) => i * 5); // 0-60 %
  const priceIndices = Array.from({ length: 11 }, (_, i) => 0.7 + i * 0.08); // 0.70-1.50
  let min = Infinity;
  let max = -Infinity;

  const grid = deficits.map((deficitPct) =>
    priceIndices.map((priceIndex) => {
      const value = netProfitBdtAcre({ field, plan, costs, deficitPct, priceIndex }) / 1000;
      min = Math.min(min, value);
      max = Math.max(max, value);
      return value;
    }),
  );

  return { deficits, priceIndices, grid, min, max };
}

/** Monte Carlo over rainfall deficit and fertilizer price, reported as k BDT/acre. */
export function riskBands(
  field: FieldSite,
  plan: RotationPlan,
  costs: CostInputs,
  runs = 2000,
): RiskBands {
  const rand = mulberry32(1337 + plan.cropIds.join("").length * 17 + Math.round(field.lat * 100));
  const samples: number[] = [];

  for (let i = 0; i < runs; i++) {
    // Deficit skews dry in projection; price index is roughly normal around the slider value.
    const deficitPct = Math.min(60, Math.max(0, 18 + (rand() - 0.35) * 46));
    const priceIndex = Math.max(
      0.6,
      costs.fertilizerPriceIndex + (rand() + rand() + rand() - 1.5) * 0.22,
    );
    samples.push(netProfitBdtAcre({ field, plan, costs, deficitPct, priceIndex }) / 1000);
  }

  samples.sort((a, b) => a - b);
  const at = (q: number) => Number(samples[Math.floor(q * (samples.length - 1))]!.toFixed(1));

  let breakEven: number | null = null;
  for (let d = 0; d <= 60; d += 1) {
    const v = netProfitBdtAcre({
      field,
      plan,
      costs,
      deficitPct: d,
      priceIndex: costs.fertilizerPriceIndex,
    });
    if (v < 0) {
      breakEven = d;
      break;
    }
  }

  return { p10: at(0.1), p50: at(0.5), p90: at(0.9), breakEvenDeficitPct: breakEven };
}

export function formatBdt(value: number) {
  return `${value < 0 ? "−" : ""}৳${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}
