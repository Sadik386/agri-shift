import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { AIMessage, HumanMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { DISASTER_PROFILES, type DisasterType } from "@/lib/fieldshift/disaster-resilience";
import { NASA_OFFLINE_DATASETS } from "@/lib/fieldshift/nasa-datasets";
import { CROPS, FIELDS, ROTATION_PLANS } from "@/lib/fieldshift/data";
import districtsData from "@/data/districts.json";

export type LLMProvider = "offline" | "google" | "openai";

export interface ChatConfig {
  provider: LLMProvider;
  apiKey?: string | undefined;
  modelName?: string | undefined;
  temperature?: number | undefined;
  districtId?: string | undefined;
  lang?: "en" | "bn" | undefined;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

/**
 * Knowledge retrieval helper: compiles grounded domain context
 * for Bangladesh districts, NASA missions, and resilient agronomy.
 */
export function buildAgronomyContext(
  districtId?: string | undefined,
  lang: "en" | "bn" = "en",
): string {
  const district = districtsData.find((d) => d.id === districtId);
  const districtName = district
    ? `${district.name} (${district.bn})`
    : "General Bangladesh Agricultural Zones";

  const disasterSummary = Object.values(DISASTER_PROFILES)
    .map((d) => {
      return `• ${d.nameEn} / ${d.nameBn} (Vulnerable: ${d.vulnerableRegionEn} / Districts: ${d.districtsEn.join(", ")}):
  Baseline: ${d.baselineCrop.nameEn} (Issue: ${d.baselineCrop.issueEn}, Survival: ${d.baselineCrop.disasterSurvivalPct}%, Net profit: ${d.baselineCrop.netProfitBdtAcre} BDT/acre)
  Resilient Solution: ${d.resilientSolution.nameEn} (Mechanism: ${d.resilientSolution.mechanismEn}, Water reduction: ${d.resilientSolution.waterReductionPct}%, Survival: ${d.resilientSolution.disasterSurvivalPct}%, Profit: ${d.resilientSolution.netProfitBdtAcre} BDT/acre, N-fixing: ${d.resilientSolution.nitrogenFixing ? "Yes" : "No"})`;
    })
    .join("\n\n");

  const cropCatalog = Object.values(CROPS)
    .map(
      (c) =>
        `• ${c.name} (${c.emoji}): Water Need: ${c.waterNeedMm}mm | Yield: ${c.yieldKgAcre} kg/acre | Price: ${c.priceBdtKg} BDT/kg | Drought Sens: ${c.droughtSensitivity} | N-Fixing: ${c.nitrogenFixing} | SOC delta: ${c.socDeltaPct}%`,
    )
    .join("\n");

  const nasaDatasets = NASA_OFFLINE_DATASETS.map(
    (ds) =>
      `• ${ds.shortName} (${ds.mission}): ${ds.title}. DAAC: ${ds.daac}. Spatial: ${ds.spatialResolution}. Agronomic Relevance: ${ds.agronomicRelevance}`,
  ).join("\n");

  const rotationPlans = ROTATION_PLANS.map(
    (rp) => `• Plan ${rp.label}: Crops [${rp.cropIds.join(" → ")}]. Note: ${rp.note}`,
  ).join("\n");

  return `### TARGET DISTRICT CONTEXT:
${districtName} (Division: ${district?.division ?? "Bangladesh"}, Lat: ${district?.lat ?? "23.7"}, Lon: ${district?.lon ?? "90.3"})

### NASA EARTH OBSERVATION DATASETS IN AGRISHIFT:
${nasaDatasets}

### CLIMATE DISASTER PROFILES & RESILIENT CROP RECOMMENDATIONS:
${disasterSummary}

### AVAILABLE CROPS & ECONOMICS:
${cropCatalog}

### RECOMMENDED 3-YEAR ADAPTIVE ROTATIONS:
${rotationPlans}
`;
}

/**
 * Build the system prompt using LangChain ChatPromptTemplate
 */
export function createChatPromptTemplate(context: string, lang: "en" | "bn" = "en") {
  const languageInstruction =
    lang === "bn"
      ? "Always answer primarily in fluent, helpful Bengali (বাংলা), keeping scientific satellite mission names (SMAP, Landsat 8/9, OpenET, ECOSTRESS, GRACE-FO, GPM IMERG, NISAR) in English where helpful. Be respectful, encouraging, and clear for Bangladeshi farmers and agricultural officers."
      : "Answer in clear, engaging English. Provide concrete agronomic insights, quantitative numbers (costs, water savings in %, profit in BDT/acre), and reference specific NASA satellites where appropriate.";

  const systemTemplate = `You are "AgriShift AI" (এগ্রিশিফট সহকারী), an elite AI Agronomist and NASA Earth Observation Specialist built for the NASA Space Apps Challenge 2026 project "AgriShift".

Your mission:
1. Help farmers, agronomists, and researchers in Bangladesh make climate-resilient farming decisions using NASA Earth observation satellite data (SMAP, Landsat, OpenET, ECOSTRESS, GRACE-FO, GPM IMERG, NISAR).
2. Recommend low-cost, high-profit crop alternatives against climate disasters (Drought in Barind Tract, Salinity in Coastal belts, Flash Floods in Haor basin, and Heatwaves).
3. Explain crop rotations, water conservation, nitrogen-fixing legume credits, soil moisture, and financial risk mitigation.
4. ${languageInstruction}

Ground your answers in the following verified domain knowledge:
${context}

Rules:
- Never fabricate satellite data or numbers. If asked about an unsupported region outside Bangladesh, gently pivot back to Bangladesh districts.
- Format responses cleanly with markdown bullet points, bold key metrics, and actionable advice.
- When recommending crop changes, highlight: Water Saved (%), Cost/Diesel Savings, and Net Profit impact.`;

  return ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    new MessagesPlaceholder("history"),
    ["human", "{input}"],
  ]);
}

/**
 * Intelligent Offline Agent: Fallback rule-and-semantic engine
 * that runs seamlessly without external API keys or when offline.
 */
export function generateOfflineResponse(
  query: string,
  history: ChatMessage[],
  config: ChatConfig,
): string {
  const q = query.toLowerCase();
  const isBn = config.lang === "bn";
  const district = districtsData.find((d) => d.id === config.districtId);
  const districtName = district
    ? isBn
      ? district.bn
      : district.name
    : isBn
      ? "বাংলাদেশ"
      : "Bangladesh";

  // 1. Drought / Water Scarcity / Rajshahi / Barind
  if (
    q.includes("drought") ||
    q.includes("খরা") ||
    q.includes("পানি") ||
    q.includes("water") ||
    q.includes("rajshahi") ||
    q.includes("বরেন্দ্র") ||
    q.includes("smap")
  ) {
    if (isBn) {
      return `### ☀️ খরা ও পানির ঘাটতি মোকাবেলা: এগ্রিশিফট বিশ্লেষণ (${districtName})

নাসার **SMAP (Soil Moisture Active Passive)** এবং **GRACE-FO** উপগ্রহের তথ্যানুযায়ী, বরেন্দ্র ও উত্তর-পশ্চিমাঞ্চলে ভূগর্ভস্থ পানির স্তর দ্রুত হ্রাস পাচ্ছে।

#### 🌾 প্রস্তাবিত টেকসই ফসল:
- **বিকল্প ফসল:** **জোয়ার (Sorghum)** অথবা **বাজরা (Pearl Millet)** এবং **মুগডাল (Mungbean)**।
- **বোরো ধানের বিপরীতে সাশ্রয়:**
  - **পানি সাশ্রয়:** প্রায় **৬৮% - ৭৩%** কম সেচ প্রয়োজন।
  - **ডিজেল/সেচ খরচ সাশ্রয়:** একরে প্রায় **৮,৫০০ - ১১,২০০ টাকা**।
  - **ফসলের বেঁচে থাকার হার:** ৯০% এর বেশি (যেখানে সাধারণ ধানের খরায় ক্ষতি ৫০-৬০%)।

#### 🛰️ নাসার উপাত্তের ব্যবহার:
1. **SMAP L4 (০-৫ সেমি আর্দ্রতা):** মাটির প্রাথমিক শুষ্কতা শনাক্ত করে সেচের সময় নির্ধারণ।
2. **OpenET:** ফসল কর্তৃক প্রকৃত বাষ্পীভবন (Evapotranspiration) ট্র্যাক করে অপ্রয়োজনীয় অতিরিক্ত সেচ বন্ধ করে।`;
    }
    return `### ☀️ Drought & Aquifer Depletion Analysis (${districtName})

According to NASA **SMAP (Soil Moisture Active Passive)** and **GRACE-FO** satellite observations, groundwater in high Barind and northern plains is under severe depletion.

#### 🌾 Resilient Crop Recommendation:
- **Switch from:** Traditional flood-irrigated Boro Rice
- **Switch to:** **Sorghum (জোয়ার)**, **Pearl Millet (বাজরা)**, or **Mungbean (মুগডাল)**
- **Water Saved:** **68% to 74% reduction** in seasonal water volume.
- **Cost Savings:** Save **8,500 – 11,200 BDT/acre** in diesel pump irrigation.
- **Disaster Survival Rate:** **90%** survival vs only 42% for Boro rice under severe deficit.

#### 🛰️ Key NASA Data Streams:
1. **SMAP Soil Moisture (0–5 cm):** Calibrated root-zone volumetric water content.
2. **OpenET:** Direct mm/day actual evapotranspiration tracking to prevent over-watering.`;
  }

  // 2. Salinity / Coastal / Khulna / Satkhira
  if (
    q.includes("salin") ||
    q.includes("লবণ") ||
    q.includes("khulna") ||
    q.includes("satkhira") ||
    q.includes("খুলনা") ||
    q.includes("উপকূল")
  ) {
    if (isBn) {
      return `### 🌊 উপকূলীয় লবণাক্ততা ও জলবায়ু সহনশীলতা (${districtName})

উপকূলীয় অঞ্চলে শুষ্ক মৌসুমে সমুদ্রের লোনা পানি প্রবেশের ফলে মাটির ইসি (EC) মাত্রা বেড়ে যায়।

#### 🌾 সমাধান ও ফসল পর্যায়ক্রম:
- **প্রস্তাবিত ফসল:** **লবণ-সহনশীল বার্লি (Barley)** এবং **সয়াবিন (Soybean)** বা **সূর্যমুখী (Sunflower)**।
- **সাশ্রয় ও মুনাফা:**
  - মাটির লবণাক্ততায় সাধারণ ধানের উৎপাদন ৭০% কমে যায়, কিন্তু বার্লিতে **৮২% পর্যন্ত ফলন অক্ষুণ্ণ থাকে**।
  - একরে সম্ভাব্য নিট মুনাফা: প্রায় **৩৪,৫০০ টাকা**।
- **নাসার উপগ্রহ পর্যবেক্ষণ:** **Landsat 9 NDVI** এবং **ECOSTRESS** ব্যবহার করে মাটির উপরিভাগের লবণ সঞ্চয়ন ও আর্দ্রতার চাপ আগে থেকেই নিরূপণ করা যায়।`;
    }
    return `### 🌊 Coastal Salinity & Climate Resilience (${districtName})

In coastal zones, soil electrical conductivity (EC) surges during the dry Rabi season due to tidal saltwater intrusion.

#### 🌾 Recommended Solution:
- **Recommended Crops:** **Salt-tolerant Barley** and **Sunflower / Soybean**
- **Agronomic Advantage:** Traditional rice drops yield by over 65% in saline conditions, while resilient barley retains **82% harvest survival**.
- **Financial Return:** Generates an estimated **34,500 BDT/acre** net profit under saline stress.
- **NASA Telemetry:** **Landsat 9 Surface Reflectance** and **ECOSTRESS Thermal Infrared** alert farmers to root-zone osmotic stress before foliage turns chlorotic.`;
  }

  // 3. Flash Flood / Haor / Sylhet
  if (
    q.includes("flood") ||
    q.includes("বন্যা") ||
    q.includes("হাওর") ||
    q.includes("haor") ||
    q.includes("sylhet") ||
    q.includes("বৃষ্টি") ||
    q.includes("rain") ||
    q.includes("gpm")
  ) {
    if (isBn) {
      return `### ⛈️ আকস্মিক বন্যা ও হাওর অঞ্চল পর্যবেক্ষণ (${districtName})

সিলেট ও মেঘালয় পাদদেশীয় হাওর অঞ্চলে বৈশাখ মাসে পাহাড়ি ঢলে বোরো ধান তলিয়ে ব্যাপক ক্ষতি হয়।

#### 🌾 টেকসই কৌশল:
- **দ্রুত পরিপক্ক ফসল:** স্বল্পমেয়াদী (১১০ দিনের) আগাম জাতের ধান অথবা গভীর পানির **ভাসমান ধান (Deepwater Floating Rice)**।
- **নাসা উপাত্তের অবদান:**
  - **GPM IMERG:** বৃষ্টিপাত রাডার উপাত্ত উজানের মেঘালয় ও আসামের অতিবৃষ্টি ৩০ মিনিট পর পর আপডেট দেয়।
  - কৃষকরা বন্যা আসার ৩ থেকে ৫ দিন পূর্বেই ফসল কাটার পূর্বপ্রস্তুতি নিতে পারেন।`;
    }
    return `### ⛈️ Flash Flood & Haor Wetland Resilience (${districtName})

Pre-monsoon flash floods in the northeastern Haor basin frequently inundate mature Boro paddy within 48 hours.

#### 🌾 Mitigation Strategy:
- **Recommended Strategy:** Early-maturing short-duration crops (105–115 days) or **Deepwater Floating Rice** along low ridges.
- **NASA Satellite Early Warning:**
  - **GPM IMERG (Global Precipitation Measurement):** Provides calibrated 30-minute precipitation estimates over upstream catchment areas in Meghalaya/Assam.
  - Gives farmers a **72-to-120 hour advance window** to accelerate harvest before river surges break embankment dykes.`;
  }

  // 4. Crop Rotation / Soil health / Nitrogen
  if (
    q.includes("rotat") ||
    q.includes("পর্যায়ক্রম") ||
    q.includes("নাইট্রোজেন") ||
    q.includes("nitrogen") ||
    q.includes("fertilizer") ||
    q.includes("সার") ||
    q.includes("soil") ||
    q.includes("মাটি")
  ) {
    if (isBn) {
      return `### 🌱 ৩-বছরের অভিযোজিত ফসল পর্যায়ক্রম ও মাটির স্বাস্থ্য

একটানা বোরো ধান চাষের ফলে মাটির জৈব কার্বন (SOC) দ্রুত ক্ষয়প্রাপ্ত হয়।

#### 🔄 ৩-বছরের আদর্শ ফসল চক্র:
1. **১ম বছর:** **ভুট্টা (Maize)** — গভীর মূলীয় ফসল যা মাটির নিচের পুষ্টি উপাদান সংগ্রহ করে।
2. **২য় বছর:** **মুগডাল / ডালজাতীয় ফসল (Mungbean)** — রাইজোবিয়াম ব্যাকটেরিয়ার মাধ্যমে বাতাস থেকে নাইট্রোজেন মাটিতে ধরে রাখে (**Nitrogen Credit**), যা পরবর্তী ফসলে ইউরিয়া সারের খরচ **৩৫% কমিয়ে দেয়**।
3. **৩য় বছর:** **জোয়ার / গম (Sorghum / Wheat)** — কম পানির চাহিদা ও উচ্চ খরা সহনশীলতা।

#### 💰 মোট অর্থনৈতিক সুবিধা:
- ৩ বছরে গড়ে **৭.১৫ বিলিয়ন লিটার** আঞ্চলিক পানি সাশ্রয়।
- মাটির জৈব কার্বন লাভ: **+০.২৮%**।
- সারের খরচ সাশ্রয়: একরে প্রায় **৪,৫০০ - ৬,০০০ টাকা**।`;
    }
    return `### 🌱 3-Year Adaptive Crop Rotation & Soil Health

Monoculture rice cultivation severely exhausts soil organic carbon (SOC) and creates hard subsoil plow-pans.

#### 🔄 Recommended 3-Year Sequence:
1. **Year 1 (Maize):** Deep-rooting taproot opens soil channels and utilizes subsoil nutrients.
2. **Year 2 (Mungbean - Legume):** Symbiotic *Rhizobia* root nodules fix atmospheric nitrogen directly into the soil profile (**Natural Nitrogen Credit**), reducing urea fertilizer needs for the subsequent crop by **35%**.
3. **Year 3 (Sorghum / Millet):** Low water requirement with high carbon residue incorporation back into the topsoil.

#### 💰 Quantified Outcomes:
- **Water Saved:** Up to **38% seasonal water savings**.
- **Soil Organic Carbon (SOC) Gain:** **+0.28 to +0.45 percentage points**.
- **Fertilizer Budget Savings:** Saves **4,500 – 6,000 BDT/acre** in chemical synthetic fertilizers.`;
  }

  // 5. Default General Welcome & Capabilities
  if (isBn) {
    return `### ◈ এগ্রিশিফট এআই সহকারী — আপনার স্বাগতম! (${districtName})

আমি নাসার উপগ্রহ উপাত্ত ও বাংলাদেশ কৃষি গবেষণা তথ্যের সমন্বয়ে প্রস্তুতকৃত এআই পরামর্শক।

আমি আপনাকে যেভাবে সাহায্য করতে পারি:
1. **নাসা উপাত্ত বিশ্লেষণ:** SMAP (মাটির আর্দ্রতা), Landsat 8/9 (NDVI/গাছের স্বাস্থ্য), ECOSTRESS (তাপমাত্রা ও বাষ্পীভবন), এবং GPM (বৃষ্টিপাত)।
2. **দুর্যোগ সহনশীল ফসল নির্বাচন:** খরা, লবণাক্ততা, আকস্মিক বন্যা ও তীব্র তাপদাহ মোকাবেলা।
3. **খরচ ও লাভ হিসাব:** ডিজেল সেচ সাশ্রয়, ইউরিয়া সারের খরচ হ্রাস এবং একর প্রতি নিশ্চিত নিট মুনাফা।
4. **ফসল চক্র ও মাটি সমৃদ্ধকরণ:** ৩ বছরের পর্যায়ক্রমিক ফসল নির্বাচন ও নাইট্রোজেন ক্রেডিট।

👉 *যেকোনো প্রশ্ন লিখুন, অথবা উপরের বাটনগুলো থেকে আপনার জেলা নির্বাচন করুন!*`;
  }

  return `### ◈ AgriShift AI Specialist — Ready to Assist (${districtName})

I am an AI agronomist connected directly to AgriShift's NASA Earth Observation datasets and Bangladesh climate adaptation engine.

Here is what you can ask me:
1. **NASA Satellite Insights:** How to interpret SMAP (soil moisture), Landsat 9 (NDVI/vegetation health), ECOSTRESS (evapotranspiration), and GPM IMERG (rainfall).
2. **Climate Disaster Strategies:** Low-cost, drought-proof, or salinity-resistant crop alternatives for Barind, coastal, or Haor regions.
3. **Financial & Cost Optimization:** Estimating diesel irrigation savings, fertilizer reduction via legume nitrogen credits, and net profit per acre.
4. **3-Year Rotation Planning:** Planning sustainable Maize → Mungbean → Sorghum rotations to rebuild soil organic carbon.

👉 *Feel free to ask a specific agricultural question or select a district to get tailored recommendations!*`;
}

/**
 * Main LangChain Agent execution pipeline
 */
export async function executeAgrishiftChat(
  messages: ChatMessage[],
  config: ChatConfig,
): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) return "No message provided.";

  const lang = config.lang ?? "en";
  const context = buildAgronomyContext(config.districtId, lang);

  // If provider is offline or no valid API key is present, use our intelligent offline fallback engine
  if (config.provider === "offline" || !config.apiKey || config.apiKey.trim() === "") {
    return generateOfflineResponse(lastMessage.content, messages, config);
  }

  try {
    const promptTemplate = createChatPromptTemplate(context, lang);
    const outputParser = new StringOutputParser();

    // Map message history to LangChain BaseMessage instances (excluding the last user query)
    const historyMessages: BaseMessage[] = messages.slice(0, -1).map((m) => {
      if (m.role === "assistant") {
        return new AIMessage(m.content);
      }
      return new HumanMessage(m.content);
    });

    let model: ChatGoogleGenerativeAI | ChatOpenAI;

    if (config.provider === "google") {
      model = new ChatGoogleGenerativeAI({
        apiKey: config.apiKey,
        model: config.modelName || "gemini-3.8-flash",
        temperature: config.temperature ?? 0.4,
        maxOutputTokens: 1024,
      });
    } else {
      model = new ChatOpenAI({
        apiKey: config.apiKey,
        modelName: config.modelName || "gpt-4o-mini",
        temperature: config.temperature ?? 0.4,
        maxTokens: 1024,
      });
    }

    // LCEL chain: prompt -> model -> outputParser
    const chain = promptTemplate.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      history: historyMessages,
      input: lastMessage.content,
    });

    return response;
  } catch (error) {
    console.error("LangChain online execution failed, falling back to offline engine:", error);
    // Graceful fallback to offline engine so the user never gets an unhelpful crash
    const offlineFallback = generateOfflineResponse(lastMessage.content, messages, config);
    const errorPrefix =
      lang === "bn"
        ? `*(অনলাইন মডেল এরর: অফলাইন এআই ইঞ্জিন থেকে উত্তর দেওয়া হয়েছে)*\n\n`
        : `*(API model warning: served from AgriShift local intelligence engine)*\n\n`;
    return errorPrefix + offlineFallback;
  }
}
