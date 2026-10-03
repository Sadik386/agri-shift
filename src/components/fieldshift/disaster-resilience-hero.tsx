import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Droplets,
  Fuel,
  Info,
  Layers,
  MapPin,
  Satellite,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  DISASTER_PROFILES,
  DisasterType,
  calculateSavings,
} from "@/lib/fieldshift/disaster-resilience";
import { useLang } from "@/lib/i18n";

export function DisasterResilienceHero() {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>("drought");
  const [acres, setAcres] = useState<number>(5);

  const profile = DISASTER_PROFILES[selectedDisaster];
  const savings = calculateSavings(profile, acres);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isBn ? "bn-BD" : "en-US").format(num);
  };

  return (
    <div className="relative mx-auto mt-8 w-full max-w-6xl rounded-2xl border border-cyan-500/30 bg-[#0d1424]/90 p-4 sm:p-6 lg:p-8 backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(6,182,212,0.25)]">
      {/* Glow highlight header line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-emerald-400" />

      {/* Top Banner & Eyebrow */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Satellite className="h-4 w-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                {isBn ? "প্রাকৃতিক দুর্যোগ বিশ্লেষণ ও সাশ্রয়ী ফসল ইঞ্জিন" : "CLIMATE DISASTER & LOW-COST CROP RESILIENCE ENGINE"}
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                NASA SMAP · MODIS · GPM
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isBn
                ? "প্রাকৃতিক দুর্যোগকে কেন্দ্র করে সর্বনিম্ন খরচে সর্বোচ্চ লাভজনক ফসল নির্বাচনের বৈজ্ঞানিক মডেল"
                : "Predict Natural Disasters. Maximize Net Farm Profit by Slashing Diesel & Fertilizer Input Costs."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/heatmap"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            <span>{isBn ? "১০৪-গ্রিড নাসা হিটম্যাপ" : "104-Hex Heatmap"}</span>
          </Link>
          <Link
            to="/planner"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isBn ? "পরিকল্পনা সিমুলেটর" : "Full Simulator"} →</span>
          </Link>
        </div>
      </div>

      {/* Disaster Selector Pills */}
      <div className="mt-5">
        <label className="block text-[11px] font-mono uppercase text-slate-400 mb-2">
          {isBn ? "১. দুর্যোগ পরিস্থিতি নির্বাচন করুন (Select Climate Hazard):" : "1. SELECT CLIMATE DISASTER PROFILE:"}
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(DISASTER_PROFILES) as DisasterType[]).map((type) => {
            const p = DISASTER_PROFILES[type];
            const isSelected = selectedDisaster === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedDisaster(type)}
                className={`relative flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400"
                    : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {isBn ? p.nameBn : p.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {isBn ? p.vulnerableRegionBn : p.vulnerableRegionEn}
                  </div>
                </div>
                {isSelected && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time NASA Telemetry Grid */}
      <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
        <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            {isBn ? "নাসা লাইভ ক্লাইমেট টেলিমেট্রি সিগন্যাল" : "LIVE NASA SATELLITE DISASTER METRICS"}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <MapPin className="h-3 w-3 text-amber-400" />
            {isBn ? "ঝুঁকিপূর্ণ জেলা:" : "Target Hotspots:"}{" "}
            <b className="text-slate-200">
              {(isBn ? profile.districtsBn : profile.districtsEn).slice(0, 3).join(", ")}
            </b>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {profile.nasaSignals.map((signal, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-xs"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{signal.source}</span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    signal.alertStatus === "critical" ? "bg-red-400" : "bg-amber-400"
                  }`}
                />
              </div>
              <div className="mt-1 font-semibold text-slate-200 text-[11px] truncate" title={signal.telemetry}>
                {signal.telemetry}
              </div>
              <div
                className={`mt-0.5 font-mono text-xs font-bold ${
                  signal.alertStatus === "critical" ? "text-red-400" : "text-amber-300"
                }`}
              >
                {signal.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side: Traditional High-Risk vs. AgriShift Resilient Low-Cost Alternative */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Left Card: Conventional High-Cost Vulnerable Crop */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/15 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono text-rose-300 border border-rose-500/30">
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              {isBn ? "প্রচলিত ঝুঁকিপূর্ণ চাষ (ঋণের ফাঁদ)" : "TRADITIONAL HIGH-COST TRAP"}
            </span>
            <span className="text-xl">{profile.baselineCrop.emoji}</span>
          </div>

          <h3 className="mt-2 text-base font-bold text-white">
            {isBn ? profile.baselineCrop.nameBn : profile.baselineCrop.nameEn}
          </h3>
          <p className="mt-1 text-xs text-rose-200/80 leading-relaxed">
            {isBn ? profile.baselineCrop.issueBn : profile.baselineCrop.issueEn}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rose-500/20 pt-3 text-center">
            <div className="rounded bg-black/30 p-2">
              <div className="text-[10px] text-slate-400 font-mono">
                {isBn ? "মোট ইনপুট খরচ" : "Total Input Cost"}
              </div>
              <div className="text-sm font-bold font-mono text-rose-300">
                ৳{formatNumber(profile.baselineCrop.inputCostBdtAcre)}
                <span className="text-[9px] text-slate-400 font-normal">/{isBn ? "একর" : "ac"}</span>
              </div>
            </div>
            <div className="rounded bg-black/30 p-2">
              <div className="text-[10px] text-slate-400 font-mono">
                {isBn ? "সেচ ডিজেল খরচ" : "Diesel Irrigation"}
              </div>
              <div className="text-sm font-bold font-mono text-rose-400">
                ৳{formatNumber(profile.baselineCrop.dieselIrrigationBdtAcre)}
              </div>
            </div>
            <div className="rounded bg-black/30 p-2">
              <div className="text-[10px] text-slate-400 font-mono">
                {isBn ? "টিকে থাকার হার" : "Disaster Survival"}
              </div>
              <div className="text-sm font-bold font-mono text-rose-400">
                {profile.baselineCrop.disasterSurvivalPct}%
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Recommended Low-Cost High-Yield Resilient Crop */}
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 relative overflow-hidden shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {isBn ? "টেকসই সাশ্রয়ী বিকল্প (AgriShift Vision)" : "RECOMMENDED LOW-COST RESILIENT"}
            </span>
            <span className="text-xl">{profile.resilientSolution.emoji}</span>
          </div>

          <h3 className="mt-2 text-base font-bold text-emerald-300 flex items-center gap-2">
            <span>{isBn ? profile.resilientSolution.nameBn : profile.resilientSolution.nameEn}</span>
            {profile.resilientSolution.nitrogenFixing && (
              <span className="rounded bg-emerald-500/30 px-1.5 py-0.5 text-[9px] font-mono text-emerald-200">
                +N2 Fix
              </span>
            )}
          </h3>
          <p className="mt-1 text-xs text-emerald-100/90 leading-relaxed">
            {isBn ? profile.resilientSolution.mechanismBn : profile.resilientSolution.mechanismEn}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-emerald-500/30 pt-3 text-center">
            <div className="rounded bg-black/40 p-2">
              <div className="text-[10px] text-slate-300 font-mono">
                {isBn ? "মোট ইনপুট খরচ" : "Total Input Cost"}
              </div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                ৳{formatNumber(profile.resilientSolution.inputCostBdtAcre)}
                <span className="text-[9px] text-slate-400 font-normal">/{isBn ? "একর" : "ac"}</span>
              </div>
            </div>
            <div className="rounded bg-black/40 p-2">
              <div className="text-[10px] text-slate-300 font-mono">
                {isBn ? "পানি সাশ্রয়" : "Water Saved"}
              </div>
              <div className="text-sm font-bold font-mono text-cyan-300">
                -{profile.resilientSolution.waterReductionPct}%
              </div>
            </div>
            <div className="rounded bg-black/40 p-2">
              <div className="text-[10px] text-slate-300 font-mono">
                {isBn ? "টিকে থাকার হার" : "Disaster Survival"}
              </div>
              <div className="text-sm font-bold font-mono text-emerald-300">
                {profile.resilientSolution.disasterSurvivalPct}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Acreage & Economic Surge Calculator */}
      <div className="mt-5 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 to-cyan-950/30 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-cyan-300 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              {isBn ? "২. জমির পরিমাণ ও নিট সাশ্রয় ক্যালকুলেটর:" : "2. ACREAGE & ROI FINANCIAL CALCULATOR:"}
            </span>
            <p className="text-[11px] text-slate-400">
              {isBn
                ? "আপনার জমির আয়তন নির্ধারণ করে মোট ডিজেল ও উৎপাদন খরচ সাশ্রয় দেখুন"
                : "Slide to estimate total diesel savings and profit expansion on your parcel."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 font-mono">
              {isBn ? "জমির পরিমাণ:" : "Land Size:"}{" "}
              <b className="text-base text-cyan-400 font-bold">{acres} {isBn ? "একর" : "Acres"}</b>
            </span>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              className="w-36 sm:w-48 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Dynamic ROI Metrics Row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-300">
              <Fuel className="h-3.5 w-3.5" />
              <span>{isBn ? "ডিজেল খরচ সাশ্রয়" : "Diesel Fuel Saved"}</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-cyan-200">
              ৳{formatNumber(savings.dieselSavedBdt)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ~{formatNumber(savings.dieselLitersSaved)} {isBn ? "লিটার ডিজেল" : "Liters saved"}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-300">
              <Droplets className="h-3.5 w-3.5" />
              <span>{isBn ? "মোট ইনপুট খরচ হ্রাস" : "Total Cost Cut"}</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-emerald-200">
              ৳{formatNumber(savings.inputCostSavedBdt)}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              -{savings.costReductionPct}% {isBn ? "কম উৎপাদন খরচ" : "Lower expenditure"}
            </div>
          </div>

          <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-300">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{isBn ? "নিট মুনাফা বৃদ্ধি" : "Net Profit Surge"}</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-amber-200">
              +৳{formatNumber(savings.profitSurgeBdt)}
            </div>
            <div className="text-[10px] text-amber-300 font-mono">
              +{savings.profitSurgePct}% {isBn ? "অতিরিক্ত আয়" : "Net revenue growth"}
            </div>
          </div>

          <div className="rounded-lg border border-indigo-500/30 bg-indigo-950/30 p-3">
            <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isBn ? "দুর্যোগ সুরক্ষা বৃদ্ধি" : "Survival Boost"}</span>
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-indigo-200">
              +{savings.survivalGainPct}%
            </div>
            <div className="text-[10px] text-indigo-300 font-mono">
              {profile.resilientSolution.disasterSurvivalPct}% {isBn ? "ফসল রক্ষা নিশ্চয়তা" : "Harvest security"}
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
          <p className="text-xs text-slate-300 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span>
              {isBn
                ? "নাসা আর্থ অবজারভেশন উপাত্তের সাহায্যে প্রতি বছর বাংলাদেশের কৃষকদের হাজার কোটি টাকার সেচ ডিজেল সাশ্রয় সম্ভব।"
                : "NASA Earth observations enable smallholder farmers to cut millions of liters in diesel pumping while securing harvests."}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Link
              to="/planner"
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <span>{isBn ? "এই ফসলের রোটেশন সাজান" : "Configure This Rotation"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
