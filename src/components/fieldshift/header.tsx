import { useEffect, useState } from "react";
import { OriginDot } from "./ui";
import type { FieldSite } from "@/lib/fieldshift/types";
import { Radio, RefreshCw, Download, Globe2, ShieldAlert } from "lucide-react";

export function Header({
  field,
  isLiveWeather,
  isLiveSoil,
  isRefreshing,
  onRefresh,
}: {
  field: FieldSite;
  isLiveWeather: boolean;
  isLiveSoil: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Dhaka",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-foreground">
            {field.name}
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/60 hidden sm:inline">
            {field.district} District · {field.lat.toFixed(3)}°N {field.lon.toFixed(3)}°E
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Feeds Status indicators */}
        <div className="hidden md:flex items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">SOILGRIDS:</span>
            <OriginDot origin={isLiveSoil ? "live" : "sample"} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">METEO:</span>
            <OriginDot origin={isLiveWeather ? "live" : "sample"} />
          </div>
        </div>

        {/* Dhaka Time Clock */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-secondary/50 border border-border/70 font-mono text-xs">
          <span className="text-[10px] text-muted-foreground">DHAKA</span>
          <span className="text-primary font-semibold tabular-nums">{time || "16:51:00"}</span>
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/60 hover:bg-secondary text-foreground text-xs font-mono transition-colors disabled:opacity-50"
          title="Refresh satellite telemetry and Open-Meteo forecasts"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">{isRefreshing ? "SYNCING…" : "SYNC FEEDS"}</span>
        </button>
      </div>
    </header>
  );
}
