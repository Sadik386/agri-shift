export type DataOrigin = "live" | "sample" | "modeled";

export interface SoilProfileLayer {
  label: string;
  depthCm: number;
  texture: "clay" | "loam" | "sandy loam" | "sand" | "silt loam";
  color: string;
  moisturePct: number;
}

export interface SoilReading {
  texture: string;
  ph: number;
  clayPct: number;
  sandPct: number;
  siltPct: number;
  organicCarbonPct: number;
  origin: DataOrigin;
}

export interface Telemetry {
  /** Landsat 8/9 NDVI (30 m) */
  ndvi: number;
  /** OpenET actual evapotranspiration, mm/day */
  etaMmDay: number;
  /** SMAP volumetric soil moisture 0-5 cm, m3/m3 */
  smapVwc: number;
  /** ECOSTRESS land surface temperature, deg C */
  lstC: number;
  /** GPM IMERG 7-day rainfall, mm */
  rainfall7dMm: number;
  /** NISAR-derived canopy/structure index 0-1 */
  structureIndex: number;
  origin: DataOrigin;
}

export interface FieldSite {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  areaAcres: number;
  elevationM: number;
  currentCropId: string;
  telemetry: Telemetry;
  soil: SoilReading;
  soilLayers: SoilProfileLayer[];
  /** normalized field outline, local metres from centre */
  outline: [number, number][];
}

export interface Crop {
  id: string;
  name: string;
  emoji: string;
  /** seasonal water requirement, mm */
  waterNeedMm: number;
  /** fixes atmospheric nitrogen (legume) */
  nitrogenFixing: boolean;
  /** soil organic carbon change per season, percentage points */
  socDeltaPct: number;
  /** expected yield, kg per acre */
  yieldKgAcre: number;
  /** farmgate price, BDT per kg */
  priceBdtKg: number;
  /** 0-1, share of yield lost per 1% rainfall deficit */
  droughtSensitivity: number;
  seedCostBdtAcre: number;
  fertilizerCostBdtAcre: number;
  rootDepthCm: number;
  canopyColor: string;
}

export interface RotationPlan {
  id: string;
  label: string;
  cropIds: [string, string, string];
  note: string;
}

export interface RotationYear {
  year: number;
  crop: Crop;
  waterNeedMm: number;
  irrigationMm: number;
  socPct: number;
  netProfitBdtAcre: number;
}

export interface RotationOutcome {
  years: RotationYear[];
  waterSavingPct: number;
  socGainPct: number;
  fertilizerSavingPct: number;
  totalProfitBdtAcre: number;
}

export interface Advisory {
  id: string;
  severity: "critical" | "warning" | "info";
  source: string;
  title: string;
  detail: string;
  action: string;
}

export interface CostInputs {
  seed: number;
  fertilizer: number;
  fuel: number;
  irrigation: number;
  /** fertilizer price index, 1 = today */
  fertilizerPriceIndex: number;
}

export interface ProfitSurface {
  deficits: number[];
  priceIndices: number[];
  /** profit[iDeficit][iPrice] in thousand BDT per acre */
  grid: number[][];
  min: number;
  max: number;
}

export interface RiskBands {
  p10: number;
  p50: number;
  p90: number;
  breakEvenDeficitPct: number | null;
}

export interface RegionalCrop {
  cropId: string;
  acres: number;
  growers: number;
  demandAcres: number;
}

export interface Grower {
  name: string;
  district: string;
  acres: number;
  plannedCropId: string;
}
