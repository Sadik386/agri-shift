import { BASELINE_ROTATION_ID, CROPS, ROTATION_PLANS } from "./data";
import type { Advisory, FieldSite, RotationOutcome, RotationPlan, RotationYear } from "./types";

const NITROGEN_CREDIT = 0.2; // legume cover crop cuts next-season fertilizer cost 20%

export function irrigationRequirementMm(field: FieldSite, waterNeedMm: number) {
  // Seasonal rainfall proxy from the 7-day GPM IMERG window, scaled to a 120-day season,
  // reduced by how dry the SMAP root-zone signal currently is.
  const seasonRainMm = field.telemetry.rainfall7dMm * (120 / 7);
  const moistureFactor = 1 + (0.22 - field.telemetry.smapVwc) * 1.4;
  return Math.max(0, Math.round((waterNeedMm - seasonRainMm * 0.8) * moistureFactor));
}

export function evaluateRotation(plan: RotationPlan, field: FieldSite): RotationOutcome {
  let soc = field.soil.organicCarbonPct;
  let previousWasLegume = false;

  const years: RotationYear[] = plan.cropIds.map((cropId, index) => {
    const crop = CROPS[cropId]!;
    const irrigationMm = irrigationRequirementMm(field, crop.waterNeedMm);
    soc = Math.max(0.2, soc + crop.socDeltaPct);

    const fertilizer = crop.fertilizerCostBdtAcre * (previousWasLegume ? 1 - NITROGEN_CREDIT : 1);
    const irrigationCost = irrigationMm * 22; // BDT per mm per acre (diesel pumping)
    const revenue = crop.yieldKgAcre * crop.priceBdtKg;
    const netProfitBdtAcre = Math.round(
      revenue - (crop.seedCostBdtAcre + fertilizer + irrigationCost + 4800),
    );

    previousWasLegume = crop.nitrogenFixing;

    return {
      year: index + 1,
      crop,
      waterNeedMm: crop.waterNeedMm,
      irrigationMm,
      socPct: Number(soc.toFixed(2)),
      netProfitBdtAcre,
    };
  });

  const baseline = ROTATION_PLANS.find((p) => p.id === BASELINE_ROTATION_ID)!;
  const baselineWater = baseline.cropIds.reduce(
    (sum, id) => sum + irrigationRequirementMm(field, CROPS[id]!.waterNeedMm),
    0,
  );
  const planWater = years.reduce((sum, y) => sum + y.irrigationMm, 0);
  const legumeSeasons = plan.cropIds.filter((id) => CROPS[id]!.nitrogenFixing).length;

  return {
    years,
    waterSavingPct:
      baselineWater > 0 ? Math.round(((baselineWater - planWater) / baselineWater) * 100) : 0,
    socGainPct: Math.round(
      ((years[years.length - 1]!.socPct - field.soil.organicCarbonPct) /
        field.soil.organicCarbonPct) *
        100,
    ),
    fertilizerSavingPct: Math.round(legumeSeasons * NITROGEN_CREDIT * 100),
    totalProfitBdtAcre: years.reduce((sum, y) => sum + y.netProfitBdtAcre, 0),
  };
}

export function buildAdvisories(field: FieldSite, plan: RotationPlan): Advisory[] {
  const t = field.telemetry;
  const crop = CROPS[plan.cropIds[0]]!;
  const out: Advisory[] = [];

  const weeklyDeficitMm = Math.max(0, t.etaMmDay * 7 - t.rainfall7dMm);
  out.push({
    id: "irrigation",
    severity: weeklyDeficitMm > 22 ? "critical" : weeklyDeficitMm > 10 ? "warning" : "info",
    source: "OpenET · GPM IMERG",
    title: `Variable rate irrigation: ${weeklyDeficitMm.toFixed(0)} mm this week`,
    detail: `Actual ET is ${t.etaMmDay.toFixed(1)} mm/day against ${t.rainfall7dMm} mm of rainfall in the last 7 days.`,
    action:
      weeklyDeficitMm > 22
        ? `Split into two ${(weeklyDeficitMm / 2).toFixed(0)} mm passes, prioritising the drier western strip.`
        : `Single ${weeklyDeficitMm.toFixed(0)} mm pass is sufficient; hold back if rain is forecast.`,
  });

  if (t.ndvi < 0.6) {
    out.push({
      id: "nitrogen",
      severity: t.ndvi < 0.5 ? "critical" : "warning",
      source: "Sentinel-2 · Landsat 9",
      title: `Nitrogen deficit signal (NDVI ${t.ndvi.toFixed(2)})`,
      detail: `Canopy vigour is below the ${crop.name.toLowerCase()} benchmark of 0.68 for this growth stage.`,
      action: "Apply 15 kg/acre top-dress urea in the low-NDVI zones, then re-check after 6 days.",
    });
  }

  if (t.lstC > 33) {
    out.push({
      id: "thermal",
      severity: t.lstC > 36 ? "critical" : "warning",
      source: "ECOSTRESS",
      title: `Thermal anomaly: ${t.lstC.toFixed(1)} °C surface temperature`,
      detail: "Canopy temperature is running above air temperature — heat and fungal disease pressure.",
      action: "Irrigate before 9:00, scout for leaf blight, and delay any foliar spray until the evening.",
    });
  }

  if (t.smapVwc < 0.18) {
    out.push({
      id: "moisture",
      severity: "critical",
      source: "SMAP",
      title: `Root-zone moisture critically low (${t.smapVwc.toFixed(2)} m³/m³)`,
      detail: "Surface layer is near wilting point for this soil texture.",
      action: "Bring the next irrigation forward by 3 days and mulch residue to cut evaporation.",
    });
  }

  if (field.soil.ph > 7.5) {
    out.push({
      id: "ph",
      severity: "warning",
      source: "ISRIC SoilGrids",
      title: `Alkaline soil (pH ${field.soil.ph.toFixed(1)})`,
      detail: "Phosphorus and zinc availability drops sharply above pH 7.5.",
      action: "Band phosphorus with the seed and add 2 kg/acre zinc sulphate.",
    });
  } else if (field.soil.ph < 6.2) {
    out.push({
      id: "ph",
      severity: "info",
      source: "ISRIC SoilGrids",
      title: `Slightly acidic soil (pH ${field.soil.ph.toFixed(1)})`,
      detail: "Acceptable for the planned rotation, but legume nodulation improves nearer pH 6.5.",
      action: "Apply 120 kg/acre dolomite before the legume season.",
    });
  }

  out.push({
    id: "phenology",
    severity: "info",
    source: "NEX-GDDP-CMIP6",
    title: "Phenology window shifting 9 days earlier by 2035",
    detail: "Downscaled projections advance the safe sowing window for this district.",
    action: `Plan ${crop.name.toLowerCase()} sowing for the first week of the season rather than mid-month.`,
  });

  return out;
}

export function moistureGrid(field: FieldSite, size = 9): number[][] {
  const base = field.telemetry.smapVwc;
  const grid: number[][] = [];
  for (let z = 0; z < size; z++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1) - 0.5;
      const v = z / (size - 1) - 0.5;
      const ripple = Math.sin(u * 5.2 + field.elevationM * 0.08) * Math.cos(v * 4.1) * 0.045;
      const slope = -v * 0.03;
      row.push(Math.min(0.48, Math.max(0.05, base + ripple + slope)));
    }
    grid.push(row);
  }
  return grid;
}

export function canopyGrid(field: FieldSite, size = 9): number[][] {
  const base = field.telemetry.ndvi;
  const grid: number[][] = [];
  for (let z = 0; z < size; z++) {
    const row: number[] = [];
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1) - 0.5;
      const v = z / (size - 1) - 0.5;
      const bump = Math.cos(u * 3.4) * Math.sin(v * 3.9 + 0.7) * 0.12;
      row.push(Math.min(0.95, Math.max(0.08, base + bump)));
    }
    grid.push(row);
  }
  return grid;
}
