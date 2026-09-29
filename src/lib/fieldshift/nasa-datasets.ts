/**
 * NASA Earth Observation Offline Datasets Catalog
 * Curated for the NASA Space Apps Challenge 2026: Field Shift - Adapting Farms with NASA Data.
 * 
 * Provides local, offline-cached scientific granules from NASA missions (SMAP, Landsat 8/9,
 * ECOSTRESS, OpenET, NISAR, GRACE-FO, and GPM IMERG) calibrated for Bangladesh agricultural zones.
 */

export type DatasetCategory =
  | "Soil Moisture"
  | "Canopy & NDVI"
  | "Thermal & ET"
  | "Evapotranspiration"
  | "Groundwater & Aquifer"
  | "Precipitation"
  | "Radar & SAR";

export interface GranuleRecord {
  siteId: string;
  siteName: string;
  district: string;
  coordinates: [number, number]; // [lat, lon]
  timestamp: string;
  observedValue: number;
  unit: string;
  anomalyPercent: number;
  qualityFlag: "OPTIMAL" | "NOMINAL" | "ESTIMATED";
  rawMetadata: Record<string, string | number>;
}

export interface DatasetParameter {
  name: string;
  description: string;
  unit: string;
  validRange: [number, number];
  typicalAgriValue: string;
}

export interface NasaDataset {
  id: string;
  shortName: string;
  title: string;
  daac: string;
  mission: string;
  instrument: string;
  spatialResolution: string;
  temporalResolution: string;
  orbitCycle: string;
  doi: string;
  status: "OFFLINE_CACHED" | "STANDBY" | "ONLINE_MIRROR";
  category: DatasetCategory;
  description: string;
  agronomicRelevance: string;
  parameters: DatasetParameter[];
  offlineGranules: GranuleRecord[];
  monthlyTrend: number[]; // 12-month standardized time series
  downloadFormats: Array<"GeoJSON" | "CSV" | "NetCDF-4" | "HDF5" | "Cloud-Optimized GeoTIFF">;
}

export const NASA_OFFLINE_DATASETS: NasaDataset[] = [
  {
    id: "smap-l4-smgp",
    shortName: "SMAP SPL4SMGP",
    title: "NASA SMAP L4 Global 9 km Surface and Root-Zone Soil Moisture Analysis",
    daac: "NSIDC DAAC (National Snow and Ice Data Center)",
    mission: "Soil Moisture Active Passive (SMAP)",
    instrument: "L-Band Radiometer (1.41 GHz)",
    spatialResolution: "9 km EASE-Grid 2.0 (downscaled 30m demo)",
    temporalResolution: "3-hourly model assimilation (Daily composite)",
    orbitCycle: "685 km altitude · 3-day global coverage",
    doi: "10.5067/KGLV7FPS6Y8G",
    status: "OFFLINE_CACHED",
    category: "Soil Moisture",
    description:
      "Global assimilated product merging SMAP radiometer observations with the NASA Catchment Land Surface Model to output continuous soil moisture across topsoil (0-5 cm) and root zones (0-100 cm).",
    agronomicRelevance:
      "Crucial for detecting irrigation thresholds in the Barind clay pan and managing moisture drawdown before Kharif sowing without exhausting diesel-powered deep tube-wells.",
    parameters: [
      {
        name: "sm_rootzone",
        description: "Root-zone volumetric soil moisture content",
        unit: "m³/m³ (% VWC)",
        validRange: [0.02, 0.55],
        typicalAgriValue: "0.22 - 0.36 m³/m³",
      },
      {
        name: "sm_surface",
        description: "Surface layer volumetric soil moisture (0-5 cm)",
        unit: "m³/m³",
        validRange: [0.02, 0.52],
        typicalAgriValue: "0.18 - 0.32 m³/m³",
      },
      {
        name: "soil_temp_layer1",
        description: "Top layer soil temperature",
        unit: "Kelvin / °C",
        validRange: [250, 335],
        typicalAgriValue: "28.5 - 34.2 °C",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-29T06:00:00Z",
        observedValue: 0.21,
        unit: "m³/m³",
        anomalyPercent: -8.4,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitNumber: 47231,
          surfaceFlag: "vegetated_soil",
          soilTextureClass: "sandy_loam",
          retrievalConfidence: 0.94,
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-29T06:00:00Z",
        observedValue: 0.14,
        unit: "m³/m³",
        anomalyPercent: -28.2,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitNumber: 47231,
          surfaceFlag: "hardpan_deficit",
          soilTextureClass: "heavy_clay",
          retrievalConfidence: 0.91,
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-29T06:00:00Z",
        observedValue: 0.29,
        unit: "m³/m³",
        anomalyPercent: 12.1,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          orbitNumber: 47231,
          surfaceFlag: "brackish_capillary",
          soilTextureClass: "silt_loam",
          retrievalConfidence: 0.88,
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-29T06:00:00Z",
        observedValue: 0.26,
        unit: "m³/m³",
        anomalyPercent: 3.5,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitNumber: 47231,
          surfaceFlag: "alluvial_floodplain",
          soilTextureClass: "loam",
          retrievalConfidence: 0.96,
        },
      },
    ],
    monthlyTrend: [0.18, 0.16, 0.14, 0.17, 0.24, 0.38, 0.44, 0.42, 0.36, 0.28, 0.22, 0.19],
    downloadFormats: ["GeoJSON", "CSV", "HDF5", "Cloud-Optimized GeoTIFF"],
  },
  {
    id: "landsat-c2l2",
    shortName: "Landsat 8/9 C2L2",
    title: "USGS/NASA Landsat 8 & 9 Collection 2 Level-2 Surface Reflectance and NDVI",
    daac: "USGS EROS / NASA LP DAAC",
    mission: "Landsat 8 (TIRS/OLI) & Landsat 9 (OLI-2/TIRS-2)",
    instrument: "Operational Land Imager 2 (OLI-2)",
    spatialResolution: "30 meters optical multispectral",
    temporalResolution: "8-day constellation revisit",
    orbitCycle: "705 km sun-synchronous circular orbit",
    doi: "10.5066/P9OGBGM6",
    status: "OFFLINE_CACHED",
    category: "Canopy & NDVI",
    description:
      "Atmospherically corrected surface reflectance bands from visible to shortwave infrared (SWIR), providing high-resolution vegetation vigor and water stress indexes at parcel scales.",
    agronomicRelevance:
      "Differentiates early boro rice tillering from maize canopy growth and enables field-level detection of nitrogen chlorosis and crop canopy degradation.",
    parameters: [
      {
        name: "SR_B5_B4_NDVI",
        description: "Normalized Difference Vegetation Index ((NIR - Red) / (NIR + Red))",
        unit: "Index (-1.0 to 1.0)",
        validRange: [-0.2, 1.0],
        typicalAgriValue: "0.45 - 0.85 (Peak canopy)",
      },
      {
        name: "SR_B5_B6_NDWI",
        description: "Normalized Difference Water Index for canopy water content",
        unit: "Index (-1.0 to 1.0)",
        validRange: [-1.0, 1.0],
        typicalAgriValue: "0.15 - 0.45",
      },
      {
        name: "ST_B10",
        description: "Surface Thermal Radiance derived Land Surface Temperature",
        unit: "Kelvin / °C",
        validRange: [260, 340],
        typicalAgriValue: "24.0 - 38.0 °C",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-28T04:18:22Z",
        observedValue: 0.62,
        unit: "NDVI Index",
        anomalyPercent: 6.2,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          sceneId: "LC09_L2SP_138042_20260928_02_T1",
          cloudCoverPct: 2.1,
          sunElevationDeg: 54.8,
          sensor: "OLI-2",
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-28T04:18:46Z",
        observedValue: 0.48,
        unit: "NDVI Index",
        anomalyPercent: -14.5,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          sceneId: "LC09_L2SP_138043_20260928_02_T1",
          cloudCoverPct: 0.8,
          sunElevationDeg: 55.4,
          sensor: "OLI-2",
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-28T04:19:10Z",
        observedValue: 0.54,
        unit: "NDVI Index",
        anomalyPercent: -2.1,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          sceneId: "LC08_L2SP_137044_20260927_02_T1",
          cloudCoverPct: 5.4,
          sunElevationDeg: 56.1,
          sensor: "OLI",
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-28T04:18:34Z",
        observedValue: 0.71,
        unit: "NDVI Index",
        anomalyPercent: 11.8,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          sceneId: "LC09_L2SP_137043_20260928_02_T1",
          cloudCoverPct: 1.4,
          sunElevationDeg: 55.1,
          sensor: "OLI-2",
        },
      },
    ],
    monthlyTrend: [0.38, 0.42, 0.55, 0.68, 0.48, 0.62, 0.75, 0.82, 0.74, 0.66, 0.52, 0.41],
    downloadFormats: ["GeoJSON", "CSV", "Cloud-Optimized GeoTIFF"],
  },
  {
    id: "ecostress-l2",
    shortName: "ECOSTRESS ECO2LSTE / ECO4ESIPTJPL",
    title: "NASA ECOSTRESS Land Surface Temperature & Evaporative Stress Index",
    daac: "NASA Land Processes DAAC (LP DAAC)",
    mission: "ECOSTRESS on International Space Station (ISS)",
    instrument: "Prototype Multispectral Thermal Infrared Radiometer",
    spatialResolution: "70 meters pixel footprint",
    temporalResolution: "Variable diurnal ISS passes (approx. 4 days)",
    orbitCycle: "400 km ISS orbit inclination 51.6°",
    doi: "10.5067/ECOSTRESS/ECO2LSTE.001",
    status: "OFFLINE_CACHED",
    category: "Thermal & ET",
    description:
      "Captures high-resolution diurnal thermal dynamics of vegetation canopies. Measures subtle canopy warming hours before visual wilting occurs, revealing hidden plant transpiration stress.",
    agronomicRelevance:
      "Detects pre-visual agricultural drought in Bangladesh paddy fields, enabling farmers to apply rescue irrigation before yield capacity is permanently compromised.",
    parameters: [
      {
        name: "LST",
        description: "Land Surface Temperature from thermal infrared channels",
        unit: "Celsius (°C)",
        validRange: [10, 55],
        typicalAgriValue: "24.0 - 36.5 °C",
      },
      {
        name: "ESI",
        description: "Evaporative Stress Index (ratio of actual to potential ET)",
        unit: "Dimensionless (0.0 to 1.0)",
        validRange: [0.0, 1.0],
        typicalAgriValue: "0.65 - 0.95 (Unstressed)",
      },
      {
        name: "WUE",
        description: "Water Use Efficiency (biomass produced per unit ET)",
        unit: "g C / kg H₂O",
        validRange: [0.5, 4.5],
        typicalAgriValue: "1.8 - 3.2",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-29T08:14:00Z",
        observedValue: 33.4,
        unit: "°C",
        anomalyPercent: 1.8,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitPass: "ISS_REV_34190",
          evaporativeStressIndex: 0.81,
          localSolarTime: "14:14",
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-29T08:14:30Z",
        observedValue: 36.8,
        unit: "°C",
        anomalyPercent: 8.9,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitPass: "ISS_REV_34190",
          evaporativeStressIndex: 0.54,
          localSolarTime: "14:14",
          thermalStressAlert: "HIGH_VAPOR_PRESSURE_DEFICIT",
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-29T08:15:10Z",
        observedValue: 31.2,
        unit: "°C",
        anomalyPercent: -1.2,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          orbitPass: "ISS_REV_34190",
          evaporativeStressIndex: 0.76,
          localSolarTime: "14:15",
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-29T08:14:15Z",
        observedValue: 30.6,
        unit: "°C",
        anomalyPercent: -2.8,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          orbitPass: "ISS_REV_34190",
          evaporativeStressIndex: 0.88,
          localSolarTime: "14:14",
        },
      },
    ],
    monthlyTrend: [22.4, 25.1, 30.8, 35.6, 36.2, 33.1, 31.8, 31.5, 31.2, 29.8, 26.4, 23.1],
    downloadFormats: ["GeoJSON", "CSV", "HDF5"],
  },
  {
    id: "openet-ensemble",
    shortName: "NASA Harvest OpenET",
    title: "NASA Harvest & OpenET Operational Field-Scale Evapotranspiration",
    daac: "NASA Harvest Agriculture Consortium / OpenET",
    mission: "Multi-satellite ensemble (Landsat, Sentinel-2, GOES)",
    instrument: "Ensemble of 6 energy balance algorithms (SSEBop, METRIC, SIMS, PT-JPL, eeMETRIC, DisALEXI)",
    spatialResolution: "30 meters field parcel resolution",
    temporalResolution: "Monthly and 8-day cumulative estimates",
    orbitCycle: "Continuous multi-constellation fusion",
    doi: "10.1038/s44221-023-00088-w",
    status: "OFFLINE_CACHED",
    category: "Evapotranspiration",
    description:
      "Operational evapotranspiration dataset fusing satellite thermal, shortwave reflectance, and gridded agro-meteorological data to quantify actual water consumption by crops.",
    agronomicRelevance:
      "Quantifies true agricultural water consumption in mm/month, exposing where boro rice depletes 1,150 mm vs. legumes/maize consuming under 500 mm.",
    parameters: [
      {
        name: "ETa_monthly",
        description: "Actual evapotranspiration consumed by crop canopy",
        unit: "mm/month",
        validRange: [10, 260],
        typicalAgriValue: "90 - 180 mm/month",
      },
      {
        name: "ET_ensemble_spread",
        description: "Standard deviation across the 6 model algorithms",
        unit: "mm",
        validRange: [2, 35],
        typicalAgriValue: "6 - 14 mm",
      },
      {
        name: "Kc_fraction",
        description: "Crop coefficient fraction (ETa / ETo)",
        unit: "Ratio (0.1 to 1.3)",
        validRange: [0.1, 1.4],
        typicalAgriValue: "0.75 - 1.15",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-01T00:00:00Z",
        observedValue: 144,
        unit: "mm/month",
        anomalyPercent: 2.1,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          ensembleModels: "6/6 Converged",
          evaporationFraction: 0.72,
          dominantCanopy: "Maize_V8",
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-01T00:00:00Z",
        observedValue: 177,
        unit: "mm/month",
        anomalyPercent: 18.2,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          ensembleModels: "6/6 Converged",
          evaporationFraction: 0.89,
          dominantCanopy: "Puddled_Boro_Rice",
          waterDeficitWarning: "AQUIFER_PUMPING_REQUIRED",
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-01T00:00:00Z",
        observedValue: 123,
        unit: "mm/month",
        anomalyPercent: -5.4,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          ensembleModels: "5/6 Converged",
          evaporationFraction: 0.65,
          dominantCanopy: "Mustard_Vegetative",
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-01T00:00:00Z",
        observedValue: 132,
        unit: "mm/month",
        anomalyPercent: -1.5,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          ensembleModels: "6/6 Converged",
          evaporationFraction: 0.70,
          dominantCanopy: "Jute_Late_Season",
        },
      },
    ],
    monthlyTrend: [72, 85, 118, 162, 175, 150, 142, 138, 134, 110, 88, 76],
    downloadFormats: ["GeoJSON", "CSV", "NetCDF-4"],
  },
  {
    id: "nisar-lsar",
    shortName: "NASA-ISRO NISAR L-SAR",
    title: "NASA-ISRO Synthetic Aperture Radar (NISAR) L-band Dual-Polarization SAR",
    daac: "Alaska Satellite Facility (ASF DAAC)",
    mission: "NISAR Earth Observing Mission",
    instrument: "SweepSAR L-Band (24 cm wavelength) & S-Band Radar",
    spatialResolution: "6 - 12 meters radar ground resolution",
    temporalResolution: "12-day exact repeat pass",
    orbitCycle: "747 km sun-synchronous dawn-dusk orbit",
    doi: "10.5067/NISAR/L_SAR_L2_GCOV.001",
    status: "OFFLINE_CACHED",
    category: "Radar & SAR",
    description:
      "All-weather, cloud-penetrating synthetic aperture radar observations. Long L-band microwaves penetrate dense monsoonal cloud layers and vegetative canopies to map sub-canopy standing water and soil roughness.",
    agronomicRelevance:
      "Overcomes the chronic monsoonal cloud-blindness of optical satellites across Bangladesh, providing uninterrupted flood inundation and crop biomass tracking.",
    parameters: [
      {
        name: "gamma0_HH",
        description: "Copolarized backscatter coefficient (surface roughness & volume)",
        unit: "Decibels (dB)",
        validRange: [-28, 2],
        typicalAgriValue: "-16.0 to -8.5 dB",
      },
      {
        name: "gamma0_HV",
        description: "Crosspolarized backscatter coefficient (canopy volume scattering)",
        unit: "Decibels (dB)",
        validRange: [-35, -5],
        typicalAgriValue: "-24.0 to -14.0 dB",
      },
      {
        name: "RVI",
        description: "Radar Vegetation Index for canopy biomass estimation",
        unit: "Index (0.0 to 1.0)",
        validRange: [0.0, 1.0],
        typicalAgriValue: "0.35 - 0.78",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-26T12:30:00Z",
        observedValue: 0.58,
        unit: "RVI Index",
        anomalyPercent: 4.8,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          lookDirection: "Right",
          polarization: "Dual_HH_HV",
          incidentAngleDeg: 38.2,
          radarInundation: "Dry_Canopy",
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-26T12:30:25Z",
        observedValue: 0.41,
        unit: "RVI Index",
        anomalyPercent: -12.4,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          lookDirection: "Right",
          polarization: "Dual_HH_HV",
          incidentAngleDeg: 37.9,
          radarInundation: "Low_Roughness_Bare_Crust",
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-26T12:31:00Z",
        observedValue: 0.50,
        unit: "RVI Index",
        anomalyPercent: 1.5,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          lookDirection: "Right",
          polarization: "Dual_HH_HV",
          incidentAngleDeg: 38.6,
          radarInundation: "Tidal_Saturated_Margin",
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-26T12:30:40Z",
        observedValue: 0.67,
        unit: "RVI Index",
        anomalyPercent: 8.9,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          lookDirection: "Right",
          polarization: "Dual_HH_HV",
          incidentAngleDeg: 38.1,
          radarInundation: "Dense_Biomass_Canopy",
        },
      },
    ],
    monthlyTrend: [0.32, 0.36, 0.44, 0.52, 0.42, 0.56, 0.68, 0.74, 0.68, 0.60, 0.48, 0.35],
    downloadFormats: ["GeoJSON", "CSV", "Cloud-Optimized GeoTIFF"],
  },
  {
    id: "grace-fo-tws",
    shortName: "NASA GRACE-FO Tellus",
    title: "NASA GRACE-FO Monthly Terrestrial Water Storage Anomalies (Bengal Basin)",
    daac: "NASA PO.DAAC / JPL Tellus",
    mission: "Gravity Recovery and Climate Experiment Follow-On (GRACE-FO)",
    instrument: "K-Band Ranging System & Laser Ranging Interferometer (LRI)",
    spatialResolution: "300 km (processed with CLM hydrological downscaling)",
    temporalResolution: "Monthly gravimetric solution",
    orbitCycle: "Twin satellites trailing 220 km apart at 490 km orbit",
    doi: "10.5067/TELND-NC600",
    status: "OFFLINE_CACHED",
    category: "Groundwater & Aquifer",
    description:
      "Tracks micro-gravitational shifts caused by deep regional water mass migrations, mapping cumulative groundwater depletion and recharge rates across the Ganges-Brahmaputra-Meghna delta.",
    agronomicRelevance:
      "Quantifies the irreversible -1.8 cm/year groundwater deficit in the Northwest Barind Tract, providing the macro-policy justification for shifting away from boro rice monoculture.",
    parameters: [
      {
        name: "lwe_thickness",
        description: "Liquid Water Equivalent thickness anomaly relative to 2004-2010 baseline",
        unit: "centimeters (cm)",
        validRange: [-65, 45],
        typicalAgriValue: "-22.4 to +14.2 cm",
      },
      {
        name: "depletion_rate_annual",
        description: "Decadal groundwater depletion trend in deep aquifers",
        unit: "cm/year",
        validRange: [-4.0, 1.5],
        typicalAgriValue: "-1.8 cm/year (Barind)",
      },
    ],
    offlineGranules: [
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-08-01T00:00:00Z",
        observedValue: -24.8,
        unit: "cm LWE",
        anomalyPercent: -34.2,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          masconSolution: "JPL_RL06_v02",
          aquiferCategory: "Unconfined_Deep_Alluvium",
          depletionTrendCmYr: -2.14,
          severityStatus: "CRITICAL_GROUNDWATER_EMERGENCY",
        },
      },
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-08-01T00:00:00Z",
        observedValue: -11.2,
        unit: "cm LWE",
        anomalyPercent: -12.0,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          masconSolution: "JPL_RL06_v02",
          aquiferCategory: "Teesta_Floodplain_Aquifer",
          depletionTrendCmYr: -0.92,
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-08-01T00:00:00Z",
        observedValue: -4.5,
        unit: "cm LWE",
        anomalyPercent: -4.1,
        qualityFlag: "NOMINAL",
        rawMetadata: {
          masconSolution: "JPL_RL06_v02",
          aquiferCategory: "Coastal_Saline_Aquifer",
          depletionTrendCmYr: -0.45,
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-08-01T00:00:00Z",
        observedValue: -6.8,
        unit: "cm LWE",
        anomalyPercent: -6.8,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          masconSolution: "JPL_RL06_v02",
          aquiferCategory: "Old_Brahmaputra_Alluvium",
          depletionTrendCmYr: -0.68,
        },
      },
    ],
    monthlyTrend: [-18.4, -22.1, -26.5, -29.2, -22.8, -12.4, 2.8, 14.5, 11.2, -2.4, -10.8, -15.2],
    downloadFormats: ["GeoJSON", "CSV", "NetCDF-4"],
  },
  {
    id: "gpm-imerg-final",
    shortName: "NASA GPM IMERG Final Run",
    title: "NASA Global Precipitation Measurement (GPM) Integrated Multi-satellitE Retrievals",
    daac: "NASA GES DISC (Goddard Earth Sciences Data and Information Services Center)",
    mission: "Global Precipitation Measurement (GPM) Core Observatory",
    instrument: "Dual-frequency Precipitation Radar (DPR) & GPM Microwave Imager (GMI)",
    spatialResolution: "0.1° x 0.1° (approx. 10 km)",
    temporalResolution: "Half-hourly & Daily accumulated estimates",
    orbitCycle: "407 km non-sun-synchronous 65° inclination",
    doi: "10.5067/GPM/IMERG/DAY/06",
    status: "OFFLINE_CACHED",
    category: "Precipitation",
    description:
      "NASA's flagship multi-satellite precipitation estimate combining microwave, infrared, and ground gauge calibration. Tracks monsoonal rain events, Kalbaishakhi pre-monsoon convective storms, and dry spell durations.",
    agronomicRelevance:
      "Calculates real-time 7-day rainfall accumulation and forecast dry spells to determine whether mungbean emergence can survive without supplementary sprinkler irrigation.",
    parameters: [
      {
        name: "precipitationCal",
        description: "Multi-satellite precipitation estimate with gauge calibration",
        unit: "mm/day",
        validRange: [0, 450],
        typicalAgriValue: "0.0 - 65.0 mm/day",
      },
      {
        name: "rainfall7d_acc",
        description: "7-day cumulative rainfall accumulation",
        unit: "mm",
        validRange: [0, 850],
        typicalAgriValue: "10 - 120 mm",
      },
      {
        name: "probabilityLiquidPrecip",
        description: "Probability of liquid precipitation",
        unit: "Percentage (%)",
        validRange: [0, 100],
        typicalAgriValue: "0 - 100 %",
      },
    ],
    offlineGranules: [
      {
        siteId: "rangpur-01",
        siteName: "Sadar Char Block A",
        district: "Rangpur",
        coordinates: [25.7439, 89.2752],
        timestamp: "2026-09-29T00:00:00Z",
        observedValue: 12.0,
        unit: "mm (7-day)",
        anomalyPercent: -35.0,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          precipitationType: "Convective_Scattered",
          gaugeCalibrationWeight: 0.88,
          drySpellDays: 4,
        },
      },
      {
        siteId: "barind-02",
        siteName: "Barind Tract Plot 7",
        district: "Rajshahi",
        coordinates: [24.6111, 88.4526],
        timestamp: "2026-09-29T00:00:00Z",
        observedValue: 4.0,
        unit: "mm (7-day)",
        anomalyPercent: -72.0,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          precipitationType: "Trace_Showers",
          gaugeCalibrationWeight: 0.92,
          drySpellDays: 11,
          droughtWarning: "SEVERE_RAIN_DEFICIT",
        },
      },
      {
        siteId: "khulna-03",
        siteName: "Dacope Saline Belt",
        district: "Khulna",
        coordinates: [22.5847, 89.5122],
        timestamp: "2026-09-29T00:00:00Z",
        observedValue: 38.0,
        unit: "mm (7-day)",
        anomalyPercent: 14.5,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          precipitationType: "Coastal_Monsoon_Band",
          gaugeCalibrationWeight: 0.84,
          drySpellDays: 1,
        },
      },
      {
        siteId: "mymensingh-04",
        siteName: "Trishal Homestead Fields",
        district: "Mymensingh",
        coordinates: [24.5872, 90.3958],
        timestamp: "2026-09-29T00:00:00Z",
        observedValue: 56.0,
        unit: "mm (7-day)",
        anomalyPercent: 22.0,
        qualityFlag: "OPTIMAL",
        rawMetadata: {
          precipitationType: "Orographically_Enhanced_Piedmont",
          gaugeCalibrationWeight: 0.90,
          drySpellDays: 0,
        },
      },
    ],
    monthlyTrend: [8, 14, 38, 115, 260, 440, 520, 390, 280, 145, 22, 6],
    downloadFormats: ["GeoJSON", "CSV", "NetCDF-4", "HDF5"],
  },
];

/**
 * Trigger client-side file download of offline NASA dataset granules in GeoJSON format
 */
export function exportDatasetAsGeoJSON(dataset: NasaDataset) {
  const geojson = {
    type: "FeatureCollection",
    metadata: {
      datasetId: dataset.id,
      title: dataset.title,
      daac: dataset.daac,
      doi: dataset.doi,
      spatialResolution: dataset.spatialResolution,
      temporalResolution: dataset.temporalResolution,
      exportedAt: new Date().toISOString(),
      offlineEngine: "Field Shift - NASA Space Apps 2026",
    },
    features: dataset.offlineGranules.map((g) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [g.coordinates[1], g.coordinates[0]], // [lon, lat]
      },
      properties: {
        siteId: g.siteId,
        siteName: g.siteName,
        district: g.district,
        timestamp: g.timestamp,
        observedValue: g.observedValue,
        unit: g.unit,
        anomalyPercent: g.anomalyPercent,
        qualityFlag: g.qualityFlag,
        ...g.rawMetadata,
      },
    })),
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], {
    type: "application/geo+json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nasa_offline_${dataset.id}_${new Date().toISOString().slice(0, 10)}.geojson`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger client-side file download of offline NASA dataset granules in CSV format
 */
export function exportDatasetAsCSV(dataset: NasaDataset) {
  const headers = [
    "dataset_id",
    "mission",
    "site_id",
    "site_name",
    "district",
    "latitude",
    "longitude",
    "timestamp",
    "observed_value",
    "unit",
    "anomaly_percent",
    "quality_flag",
  ];

  const rows = dataset.offlineGranules.map((g) => [
    dataset.id,
    `"${dataset.mission}"`,
    g.siteId,
    `"${g.siteName}"`,
    g.district,
    g.coordinates[0],
    g.coordinates[1],
    g.timestamp,
    g.observedValue,
    `"${g.unit}"`,
    g.anomalyPercent,
    g.qualityFlag,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nasa_offline_${dataset.id}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export the complete offline NASA datasets package as a single structured JSON bundle
 */
export function exportAllOfflineDatasetsJSON() {
  const bundle = {
    title: "Field Shift - Complete Offline NASA Earth Observations Archive",
    version: "2026.1-RELEASE",
    challenge: "NASA Space Apps Challenge 2026: Field Shift",
    exportedAt: new Date().toISOString(),
    datasetsCount: NASA_OFFLINE_DATASETS.length,
    datasets: NASA_OFFLINE_DATASETS,
  };

  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fieldshift_nasa_offline_complete_archive_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
