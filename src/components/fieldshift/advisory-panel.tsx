import { useState } from "react";
import { Panel, StatusBadge, OriginDot } from "./ui";
import { buildAdvisories } from "@/lib/fieldshift/agronomy";
import { cn } from "@/lib/utils";
import type { Advisory, FieldSite, RotationPlan } from "@/lib/fieldshift/types";
import type { LiveWeather } from "@/lib/fieldshift/external.functions";
import { useLang } from "@/lib/i18n";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  Droplets,
  CloudRain,
  Sun,
  Thermometer,
  Compass,
  ArrowRight,
  CheckCircle2,
  BellRing,
} from "lucide-react";

export function AdvisoryPanel({
  field,
  plan,
  liveWeather,
  isLoadingWeather = false,
}: {
  field: FieldSite;
  plan: RotationPlan;
  liveWeather?: LiveWeather | null;
  isLoadingWeather?: boolean;
}) {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const advisories = buildAdvisories(field, plan);

  const filteredAdvisories = advisories.filter((adv) => {
    if (filter === "all") return true;
    return adv.severity === filter;
  });

  const criticalCount = advisories.filter((a) => a.severity === "critical").length;
  const warningCount = advisories.filter((a) => a.severity === "warning").length;
  const infoCount = advisories.filter((a) => a.severity === "info").length;

  const toggleAck = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSeverityBadge = (severity: Advisory["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-rose-500/15 border border-rose-500/40 text-rose-400 animate-pulse">
            <AlertOctagon className="w-3 h-3" /> {isBn ? "জরুরি" : "CRITICAL"}
          </span>
        );
      case "warning":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-amber-500/15 border border-amber-500/40 text-amber-400">
            <AlertTriangle className="w-3 h-3" /> {isBn ? "সতর্কতা" : "ATTENTION"}
          </span>
        );
      case "info":
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/40 text-cyan-400">
            <Info className="w-3 h-3" /> {isBn ? "পরামর্শ" : "GUIDANCE"}
          </span>
        );
    }
  };

  return (
    <Panel
      eyebrow={isBn ? "মডিউল ০৪" : "Module 04"}
      title={isBn ? "স্মার্ট কৃষি পরামর্শ ও সেন্সর অসঙ্গতি সতর্কতা" : "Smart agronomic advisory & sensor anomaly alerts"}
      right={
        <div className="flex items-center gap-2">
          {criticalCount > 0 ? (
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
              {isBn 
                ? `${criticalCount}টি জরুরি পদক্ষেপ প্রয়োজন` 
                : `${criticalCount} CRITICAL ACTION${criticalCount > 1 ? "S" : ""} REQUIRED`}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> {isBn ? "সেন্সর স্বাভাবিক" : "SENSORS NOMINAL"}
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {/* Weather Forecast Bar (Open-Meteo Data Fusion) */}
        <div className="rounded-xl border border-border/80 bg-secondary/30 p-3.5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wider">
                {isBn ? "মাইক্রো-ক্লাইমেট ও বায়ুমণ্ডলীয় আর্দ্রতা উইন্ডো" : "Micro-climate & Atmospheric Moisture Window"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Feed: {liveWeather?.ok ? (isBn ? "Open-Meteo ECMWF API (লাইভ)" : "Open-Meteo ECMWF API") : (isBn ? "নাসা GPM পূর্বাভাস" : "Simulated GPM Forecast")}
              </span>
              <OriginDot origin={liveWeather?.ok ? "live" : "modeled"} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {isBn ? "পর্যবেক্ষিত বৃষ্টি (বিগত ৭ দিন)" : "Observed Rain (Past 7d)"}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-cyan-400">
                {liveWeather?.rainfall7dMm !== undefined
                  ? `${liveWeather.rainfall7dMm} mm`
                  : `${field.telemetry.rainfall7dMm} mm`}
              </p>
              <p className="text-[10px] text-muted-foreground">{isBn ? "নাসা GPM IMERG ক্যালিব্রেটেড" : "GPM IMERG calibrated"}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {isBn ? "বৃষ্টিপাতের পূর্বাভাস (পরবর্তী ৭ দিন)" : "Forecast Rain (Next 7d)"}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-foreground">
                {liveWeather?.forecastRain7dMm !== undefined
                  ? `${liveWeather.forecastRain7dMm} mm`
                  : `${(field.telemetry.rainfall7dMm * 0.85).toFixed(0)} mm`}
              </p>
              <p className="text-[10px] text-muted-foreground">{isBn ? "উচ্চ নির্ভুলতার পূর্বাভাস" : "High confidence window"}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {isBn ? "প্রত্যাশিত সর্বোচ্চ তাপমাত্রা" : "Max Projected Temp"}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-amber-400">
                {liveWeather?.maxTempC !== undefined && liveWeather.maxTempC > -90
                  ? `${liveWeather.maxTempC.toFixed(1)} °C`
                  : `${(field.telemetry.lstC * 0.95).toFixed(1)} °C`}
              </p>
              <p className="text-[10px] text-muted-foreground">{isBn ? "২মি ক্যানোপি স্তর" : "2m ambient canopy level"}</p>
            </div>

            <div className="rounded-lg border border-border/60 bg-card/40 p-2.5">
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {isBn ? "রেফারেন্স বাষ্পীভবন ET₀ (৭ দিন)" : "Reference ET₀ (Next 7d)"}
              </p>
              <p className="mt-1 font-mono text-lg font-semibold text-cyan-400">
                {liveWeather?.et0Next7dMm !== undefined
                  ? `${liveWeather.et0Next7dMm} mm`
                  : `${(field.telemetry.etaMmDay * 7.2).toFixed(1)} mm`}
              </p>
              <p className="text-[10px] text-muted-foreground">FAO-56 Penman-Monteith</p>
            </div>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
              {isBn ? "ফিল্টার:" : "Filter:"}
            </span>
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                filter === "all"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {isBn ? "সকল" : "All"} ({advisories.length})
            </button>
            <button
              onClick={() => setFilter("critical")}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                filter === "critical"
                  ? "bg-rose-500 text-white font-semibold"
                  : "bg-secondary/60 text-rose-400/80 hover:text-rose-300",
              )}
            >
              {isBn ? "জরুরি" : "Critical"} ({criticalCount})
            </button>
            <button
              onClick={() => setFilter("warning")}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                filter === "warning"
                  ? "bg-amber-500 text-black font-semibold"
                  : "bg-secondary/60 text-amber-400/80 hover:text-amber-300",
              )}
            >
              {isBn ? "সতর্কতা" : "Warnings"} ({warningCount})
            </button>
            <button
              onClick={() => setFilter("info")}
              className={cn(
                "px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                filter === "info"
                  ? "bg-cyan-500 text-black font-semibold"
                  : "bg-secondary/60 text-cyan-400/80 hover:text-cyan-300",
              )}
            >
              {isBn ? "পরামর্শ" : "Info"} ({infoCount})
            </button>
          </div>

          <div className="font-mono text-[10px] text-muted-foreground">
            {isBn ? "উদ্দিষ্ট ফসল: " : "Target Crop: "}<span className="text-foreground font-semibold">{plan.label.split(" → ")[0]}</span>
          </div>
        </div>

        {/* Advisory Cards List */}
        <div className="space-y-3">
          {filteredAdvisories.map((advisory) => {
            const isAck = acknowledged[advisory.id];
            return (
              <div
                key={advisory.id}
                className={cn(
                  "rounded-xl border p-4 transition-all relative overflow-hidden",
                  advisory.severity === "critical"
                    ? "border-rose-500/40 bg-rose-500/[0.04] shadow-[0_0_20px_rgba(244,63,94,0.06)]"
                    : advisory.severity === "warning"
                      ? "border-amber-500/35 bg-amber-500/[0.03]"
                      : "border-border/70 bg-card/40",
                  isAck && "opacity-60 bg-secondary/20",
                )}
              >
                {/* Left severity accent bar */}
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    advisory.severity === "critical"
                      ? "bg-rose-500"
                      : advisory.severity === "warning"
                        ? "bg-amber-500"
                        : "bg-cyan-500",
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(advisory.severity)}
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {isBn ? "উৎস: " : "Source: "}{advisory.source}
                      </span>
                      {isAck && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">
                          {isBn ? "স্বীকৃত" : "ACKNOWLEDGED"}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground tracking-tight pt-0.5">
                      {advisory.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => toggleAck(advisory.id)}
                    className="self-start font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded border border-border/80 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isAck 
                      ? (isBn ? "বাতিল" : "Undo Ack") 
                      : (isBn ? "স্বীকার করুন" : "Acknowledge")}
                  </button>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pl-1 mb-3">
                  {advisory.detail}
                </p>

                {/* Prescribed Action Callout Box */}
                <div className="rounded-lg border border-border/80 bg-secondary/40 p-2.5 flex items-start gap-2.5">
                  <ArrowRight className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-primary mr-1.5">
                      {isBn ? "প্রস্তাবিত পদক্ষেপ:" : "Recommended Intervention:"}
                    </span>
                    <span className="text-foreground/95">{advisory.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
