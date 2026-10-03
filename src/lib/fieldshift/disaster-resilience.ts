/**
 * Climate Disaster Analysis & Low-Cost Resilient Crop Optimization Engine
 * Fuses NASA Earth Observations (SMAP, GPM IMERG, MODIS LST, OpenET, Landsat NDVI)
 * to recommend low-input, high-yield, disaster-proof crops for Bangladesh agro-ecological zones.
 */

export type DisasterType = "drought" | "salinity" | "flash_flood" | "heatwave";

export interface DisasterProfile {
  id: DisasterType;
  nameEn: string;
  nameBn: string;
  icon: string;
  vulnerableRegionEn: string;
  vulnerableRegionBn: string;
  districtsEn: string[];
  districtsBn: string[];
  nasaSignals: {
    telemetry: string;
    source: string;
    value: string;
    alertStatus: "critical" | "warning";
  }[];
  baselineCrop: {
    nameEn: string;
    nameBn: string;
    emoji: string;
    issueEn: string;
    issueBn: string;
    inputCostBdtAcre: number;
    dieselIrrigationBdtAcre: number;
    disasterSurvivalPct: number;
    netProfitBdtAcre: number;
  };
  resilientSolution: {
    cropId: string;
    nameEn: string;
    nameBn: string;
    emoji: string;
    mechanismEn: string;
    mechanismBn: string;
    inputCostBdtAcre: number;
    dieselIrrigationBdtAcre: number;
    disasterSurvivalPct: number;
    netProfitBdtAcre: number;
    waterReductionPct: number;
    maturityDays: number;
    nitrogenFixing: boolean;
  };
}

export const DISASTER_PROFILES: Record<DisasterType, DisasterProfile> = {
  drought: {
    id: "drought",
    nameEn: "Drought & Aquifer Depletion",
    nameBn: "খরা ও ভূগর্ভস্থ পানির সংকট",
    icon: "☀️",
    vulnerableRegionEn: "Barind Tract & High Western Plains",
    vulnerableRegionBn: "বরেন্দ্র অঞ্চল ও উত্তর-পশ্চিমাঞ্চল",
    districtsEn: ["Rajshahi", "Naogaon", "Chapai Nawabganj", "Dinajpur"],
    districtsBn: ["রাজশাহী", "নওগাঁ", "চাঁপাইনবাবগঞ্জ", "দিনাজপুর"],
    nasaSignals: [
      {
        telemetry: "SMAP Root-Zone Soil Moisture",
        source: "NASA SMAP L4",
        value: "0.14 m³/m³ (Severe Deficit)",
        alertStatus: "critical",
      },
      {
        telemetry: "Surface Thermal Anomaly",
        source: "MODIS Terra LST",
        value: "+3.8°C above 10-yr mean",
        alertStatus: "warning",
      },
      {
        telemetry: "Precipitation Deficit (7-day)",
        source: "GPM IMERG",
        value: "4 mm (Normal: 32 mm)",
        alertStatus: "critical",
      },
      {
        telemetry: "Crop Evapotranspiration",
        source: "OpenET Ensemble",
        value: "5.8 mm/day draw",
        alertStatus: "warning",
      },
    ],
    baselineCrop: {
      nameEn: "Traditional Boro Rice",
      nameBn: "ঐতিহ্যবাহী বোরো ধান",
      emoji: "🌾",
      issueEn: "Requires 1,200mm pumped groundwater. Crippling diesel pump bills (৳16,800/acre). 70% yield loss in dry spells.",
      issueBn: "১,২০০ মিমি উত্তোলিত পানি লাগে। সেচ ডিজেল খরচ অত্যন্ত বেশি (১৬,৮০০৳/একর)। তীব্র খরায় ৭০% ফলন নষ্ট হয়।",
      inputCostBdtAcre: 34500,
      dieselIrrigationBdtAcre: 16800,
      disasterSurvivalPct: 32,
      netProfitBdtAcre: 12400,
    },
    resilientSolution: {
      cropId: "sorghum_mungbean",
      nameEn: "Sorghum + Mungbean Relay",
      nameBn: "জুয়ার + মুগডাল রিলে চাষ",
      emoji: "🌾🫘",
      mechanismEn: "Sorghum survives on residual soil moisture; Mungbean fixes 42 kg/acre atmospheric Nitrogen, reducing urea costs by 50%.",
      mechanismBn: "জুয়ার মাটির অবশিষ্ট আর্দ্রতায় বেঁচে থাকে; মুগডাল জমিতে ৪২ কেজি/একর নাইট্রোজেন যুক্ত করে ইউরিয়া খরচ অর্ধেক কমায়।",
      inputCostBdtAcre: 11200,
      dieselIrrigationBdtAcre: 3800,
      disasterSurvivalPct: 94,
      netProfitBdtAcre: 41600,
      waterReductionPct: 72,
      maturityDays: 85,
      nitrogenFixing: true,
    },
  },
  salinity: {
    id: "salinity",
    nameEn: "Coastal Salinity & Tidal Surges",
    nameBn: "উপকূলীয় লবণাক্ততা ও জলোচ্ছ্বাস",
    icon: "🌊",
    vulnerableRegionEn: "Southwest Coastal Delta",
    vulnerableRegionBn: "দক্ষিণ-পশ্চিমাঞ্চলীয় উপকূলীয় জেলাসমূহ",
    districtsEn: ["Khulna (Dacope)", "Satkhira", "Bagerhat", "Barguna"],
    districtsBn: ["খুলনা (দাকোপ)", "সাতক্ষীরা", "বাগেরহাট", "বরগুনা"],
    nasaSignals: [
      {
        telemetry: "Root-Zone Salinity Equivalent",
        source: "SMAP + SoilGrids",
        value: "8.4 dS/m (High Saline)",
        alertStatus: "critical",
      },
      {
        telemetry: "Standing Moisture & Tide Surge",
        source: "Sentinel-1 / NISAR Proxy",
        value: "0.29 m³/m³ saturated",
        alertStatus: "warning",
      },
      {
        telemetry: "Vegetation Stress Index",
        source: "Landsat 9 NDVI",
        value: "0.48 (Chlorophyll decline)",
        alertStatus: "warning",
      },
      {
        telemetry: "Evapotranspiration Capillary Rise",
        source: "OpenET",
        value: "Salt crusting risk: High",
        alertStatus: "critical",
      },
    ],
    baselineCrop: {
      nameEn: "Unadapted Boro / Winter Fallow",
      nameBn: "অননুকূল বোরো ধান / অনাবাদি জমি",
      emoji: "🥀",
      issueEn: "Soil electrical conductivity >6 dS/m desiccates root cells, leading to leaf scorching and total harvest failure.",
      issueBn: "মাটির লবণাক্ততা >৬ dS/m হলে শিকড় পানি টানতে পারে না। পাতা পুড়ে ধান চিটা হয়ে ব্যাপক আর্থিক ক্ষতি হয়।",
      inputCostBdtAcre: 26500,
      dieselIrrigationBdtAcre: 11500,
      disasterSurvivalPct: 24,
      netProfitBdtAcre: 4200,
    },
    resilientSolution: {
      cropId: "saline_mustard_sunflower",
      nameEn: "Saline-Tolerant Mustard & Sunflower",
      nameBn: "লবণ-সহনশীল সরিষা ও সূর্যমুখী",
      emoji: "🌻🌱",
      mechanismEn: "Deep taproots extract subsoil water below saline crust. High oilseed market value with minimal freshwater irrigation.",
      mechanismBn: "সূর্যমুখীর দীর্ঘ মূল মাটির লবণাক্ত স্তরের নিচ থেকে পানি সংগ্রহ করে। সামান্য মিষ্টি পানিতে বাম্পার ফলন ও চড়া বাজারমূল্য।",
      inputCostBdtAcre: 9800,
      dieselIrrigationBdtAcre: 2400,
      disasterSurvivalPct: 91,
      netProfitBdtAcre: 39500,
      waterReductionPct: 68,
      maturityDays: 78,
      nitrogenFixing: false,
    },
  },
  flash_flood: {
    id: "flash_flood",
    nameEn: "Haor Flash Floods & Waterlogging",
    nameBn: "হাওরের পাহাড়ি ঢল ও আগাম বন্যা",
    icon: "⛈️",
    vulnerableRegionEn: "Northeastern Haor Basin",
    vulnerableRegionBn: "উত্তর-পূর্বাঞ্চলীয় হাওর অববাহিকা",
    districtsEn: ["Sunamganj", "Sylhet", "Netrokona", "Kishoreganj"],
    districtsBn: ["সুনামগঞ্জ", "সিলেট", "নেত্রকোনা", "কিশোরগঞ্জ"],
    nasaSignals: [
      {
        telemetry: "Upstream Meghalaya Runoff Alert",
        source: "GPM IMERG 3-Day",
        value: "168 mm upstream deluge",
        alertStatus: "critical",
      },
      {
        telemetry: "Haor Inundation Velocity",
        source: "NISAR / Sentinel-1 SAR",
        value: "+18 cm/day water rise",
        alertStatus: "critical",
      },
      {
        telemetry: "Canopy Reflectance Alert",
        source: "MODIS Terra 16-day",
        value: "Submergence window: <14 days",
        alertStatus: "warning",
      },
      {
        telemetry: "Solar Radiation Potential",
        source: "NASA POWER All-Sky",
        value: "18.4 MJ/m²/day",
        alertStatus: "warning",
      },
    ],
    baselineCrop: {
      nameEn: "Late-Maturing Boro Rice (BR-29)",
      nameBn: "দেরিতে পাকা বোরো ধান (বিআর-২৯)",
      emoji: "🌾",
      issueEn: "Matures in late April/May. Sudden upstream flash floods submerge ripening panicles overnight, wiping out 100% of farmer capital.",
      issueBn: "বৈশাখ মাসের শেষে পাকে। চৈত্র-বৈশাখের হঠাৎ পাহাড়ি ঢলে বাঁধ ভেঙে পাকা ধান পানির নিচে তলিয়ে কৃষকের শতভাগ লোকসান হয়।",
      inputCostBdtAcre: 32000,
      dieselIrrigationBdtAcre: 13200,
      disasterSurvivalPct: 18,
      netProfitBdtAcre: -4500,
    },
    resilientSolution: {
      cropId: "ultra_early_mustard_boro",
      nameEn: "Short-Duration Mustard + BRRI dhan88",
      nameBn: "স্বল্পমেয়াদী সরিষা + আগাম ব্রি ধান৮৮",
      emoji: "🌱🌾",
      mechanismEn: "Ultra-short 72-day mustard harvested in January followed by early-maturing rice harvested 20 days BEFORE flash flood season.",
      mechanismBn: "মাত্র ৭০-৭৫ দিনে সরিষা তুলে আগাম ব্রি ধান৮৮ রোপণ। চৈত্র মাসের ১৫-২০ দিন আগেই ফসল ঘরে উঠে পাহাড়ি ঢলের ঝুঁকি এড়ায়।",
      inputCostBdtAcre: 14600,
      dieselIrrigationBdtAcre: 5200,
      disasterSurvivalPct: 96,
      netProfitBdtAcre: 48200,
      waterReductionPct: 54,
      maturityDays: 130,
      nitrogenFixing: false,
    },
  },
  heatwave: {
    id: "heatwave",
    nameEn: "Extreme Heatwave & Thermal Spike",
    nameBn: "তীব্র তাপদাহ ও চৈত্র-বৈশাখী হিটশক",
    icon: "🔥",
    vulnerableRegionEn: "Central & Western River Plains",
    vulnerableRegionBn: "মধ্যাঞ্চল ও পশ্চিমাঞ্চলীয় নদী অববাহিকা",
    districtsEn: ["Jessore", "Kushtia", "Pabna", "Bogura"],
    districtsBn: ["যশোর", "কুষ্টিয়া", "পাবনা", "বগুড়া"],
    nasaSignals: [
      {
        telemetry: "Canopy Temperature Anomaly",
        source: "ECOSTRESS Thermal",
        value: "37.4°C (Above critical threshold)",
        alertStatus: "critical",
      },
      {
        telemetry: "Vapor Pressure Deficit (VPD)",
        source: "NASA POWER Agro",
        value: "3.2 kPa (Severe desiccation)",
        alertStatus: "critical",
      },
      {
        telemetry: "Canopy Moisture Status",
        source: "Landsat 9 NDWI",
        value: "-0.18 (Rapid leaf wilt)",
        alertStatus: "warning",
      },
      {
        telemetry: "Surface Solar Insolation",
        source: "NASA POWER SW",
        value: "22.6 MJ/m²/day",
        alertStatus: "warning",
      },
    ],
    baselineCrop: {
      nameEn: "Heat-Sensitive Flowering Rice / Veg",
      nameBn: "তাপ-সংবেদনশীল ধান ও প্রচলিত সবজি",
      emoji: "🥀",
      issueEn: "Ambient temperatures >35°C during anthesis cause 60-80% pollen sterility, leaving empty grain husks.",
      issueBn: "ধানের শিষ আসার সময় তাপমাত্রা ৩৫°C এর বেশি হলে পরাগায়ন ব্যর্থ হয় এবং ধান চিটা হয়ে ব্যাপক উৎপাদন হ্রাস পায়।",
      inputCostBdtAcre: 29000,
      dieselIrrigationBdtAcre: 14500,
      disasterSurvivalPct: 38,
      netProfitBdtAcre: 11200,
    },
    resilientSolution: {
      cropId: "heat_maize_sesame",
      nameEn: "Heat-Tolerant Hybrid Maize & Sesame",
      nameBn: "তাপ-সহনশীল ভুট্টা ও গ্রীষ্মকালীন তিল",
      emoji: "🌽🌿",
      mechanismEn: "C4 photosynthetic machinery maintains stomatal conductance at 40°C. Sesame taproots access deep moisture with zero irrigation.",
      mechanismBn: "C4 সালোকসংশ্লেষণ প্রক্রিয়ার কারণে ৪০°C তাপমাত্রাতেও ভুট্টার দানা পুষ্ট হয়। তিল খরা ও তাপদাহে কোনো সেচ ছাড়াই ফলন দেয়।",
      inputCostBdtAcre: 13800,
      dieselIrrigationBdtAcre: 4100,
      disasterSurvivalPct: 93,
      netProfitBdtAcre: 46800,
      waterReductionPct: 62,
      maturityDays: 95,
      nitrogenFixing: false,
    },
  },
};

/**
 * Calculates financial and natural resource savings based on land acreage.
 */
export function calculateSavings(disaster: DisasterProfile, acres: number) {
  const safeAcres = Math.max(0.5, acres);
  const baseline = disaster.baselineCrop;
  const solution = disaster.resilientSolution;

  const inputCostSavedBdt = Math.round((baseline.inputCostBdtAcre - solution.inputCostBdtAcre) * safeAcres);
  const dieselSavedBdt = Math.round(
    (baseline.dieselIrrigationBdtAcre - solution.dieselIrrigationBdtAcre) * safeAcres,
  );
  const dieselLitersSaved = Math.round(dieselSavedBdt / 108); // BDT ~108/Liter diesel in BD
  const baselineTotalProfitBdt = Math.round(baseline.netProfitBdtAcre * safeAcres);
  const resilientTotalProfitBdt = Math.round(solution.netProfitBdtAcre * safeAcres);
  const profitSurgeBdt = resilientTotalProfitBdt - baselineTotalProfitBdt;
  const profitSurgePct = baselineTotalProfitBdt > 0
    ? Math.round((profitSurgeBdt / baselineTotalProfitBdt) * 100)
    : 300;

  const costReductionPct = Math.round(
    ((baseline.inputCostBdtAcre - solution.inputCostBdtAcre) / baseline.inputCostBdtAcre) * 100,
  );

  return {
    acres: safeAcres,
    inputCostSavedBdt,
    dieselSavedBdt,
    dieselLitersSaved,
    baselineTotalProfitBdt,
    resilientTotalProfitBdt,
    profitSurgeBdt,
    profitSurgePct,
    costReductionPct,
    survivalGainPct: solution.disasterSurvivalPct - baseline.disasterSurvivalPct,
  };
}
