import { useState } from "react";
import { FIELDS, CROPS, SATELLITES } from "@/lib/fieldshift/data";
import { OriginDot } from "./ui";
import { cn } from "@/lib/utils";
import type { FieldSite, Crop } from "@/lib/fieldshift/types";
import {
  Satellite,
  Layers,
  Calendar,
  Compass,
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Radio,
  MapPin,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export function Sidebar({
  selectedField,
  onSelectField,
  selectedSeason,
  onSelectSeason,
  activeSection,
  onNavigateSection,
}: {
  selectedField: FieldSite;
  onSelectField: (field: FieldSite) => void;
  selectedSeason: string;
  onSelectSeason: (season: string) => void;
  activeSection: string;
  onNavigateSection: (sectionId: string) => void;
}) {
  const [fieldOpen, setFieldOpen] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  const seasons = [
    { id: "rabi", label: "Rabi (Winter)", desc: "High irrigation pressure · Groundwater critical" },
    { id: "kharif-1", label: "Kharif-1 (Pre-Monsoon)", desc: "Ideal legume / green manure window" },
    { id: "kharif-2", label: "Kharif-2 (Monsoon)", desc: "Rainfed paddy / flood inundation" },
  ];

  const navItems = [
    { id: "telemetry", label: "01 · Satellite Telemetry", icon: Satellite },
    { id: "terrain", label: "02 · Field 3D Terrain", icon: Layers },
    { id: "rotation", label: "03 · Rotation & Soil 3D", icon: Activity },
    { id: "advisory", label: "04 · Smart Advisory", icon: AlertTriangle },
    { id: "profit", label: "05 · Risk & Profit 3D", icon: TrendingUp },
    { id: "regional", label: "06 · Regional Network", icon: Users },
  ];

  const currentCrop: Crop = CROPS[selectedField.currentCropId] ?? CROPS["maize"]!;

  return (
    <aside className="w-full lg:w-72 shrink-0 border-r border-border/80 bg-card/60 backdrop-blur-xl flex flex-col justify-between p-4 space-y-4 lg:space-y-6 lg:min-h-screen">
      <div className="space-y-4 lg:space-y-6">
        {/* Brand & Mission Control Header */}
        <div className="flex items-center justify-between pb-3 lg:pb-4 border-b border-border/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary/20 border border-primary flex items-center justify-center text-primary shadow-[0_0_10px_rgba(79,209,255,0.3)]">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <h1 className="font-mono text-base font-bold tracking-wider text-foreground">
                FIELD SHIFT
              </h1>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              NASA Space Apps · Bangladesh Pilot
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[9px] text-emerald-400 font-medium tracking-wider">
                TELEMETRY SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* Mobile Collapsible Toggle */}
          <button
            onClick={() => setMobileRailOpen(!mobileRailOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-secondary/60 text-xs font-mono text-foreground hover:bg-secondary transition-all"
            aria-label="Toggle Mission Controls"
          >
            <span className="text-[10px] text-primary font-bold">
              {mobileRailOpen ? "CLOSE" : "CONTROLS"}
            </span>
            <ChevronDown
              className={cn("w-3.5 h-3.5 transition-transform text-muted-foreground", mobileRailOpen && "rotate-180")}
            />
          </button>
        </div>

        {/* Collapsible content wrapper on mobile (< lg), always block on desktop (lg:) */}
        <div className={cn("space-y-4 lg:space-y-6", !mobileRailOpen && "hidden lg:block")}>

        {/* Field Site Selector */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between">
            <span>Target Pilot Plot</span>
            <OriginDot origin={selectedField.soil.origin} />
          </label>

          <div className="relative">
            <button
              onClick={() => setFieldOpen(!fieldOpen)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border/80 bg-secondary/40 hover:bg-secondary/60 text-left transition-all"
            >
              <div className="min-w-0 pr-2">
                <p className="font-semibold text-xs text-foreground truncate">
                  {selectedField.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" /> {selectedField.district}
                  </span>
                  <span>·</span>
                  <span>{selectedField.areaAcres} ac</span>
                  <span>·</span>
                  <span>{selectedField.elevationM}m DEM</span>
                </div>
              </div>
              <ChevronDown
                className={cn("w-4 h-4 text-muted-foreground transition-transform", fieldOpen && "rotate-180")}
              />
            </button>

            {fieldOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border border-border bg-card/95 shadow-2xl backdrop-blur-xl p-1.5 space-y-1">
                {FIELDS.map((f) => {
                  const isCur = f.id === selectedField.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSelectField(f);
                        setFieldOpen(false);
                      }}
                      className={cn(
                        "w-full text-left p-2 rounded transition-all flex flex-col",
                        isCur
                          ? "bg-primary/20 text-primary font-medium"
                          : "hover:bg-secondary/60 text-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{f.name}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {f.district}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {f.areaAcres} ac · {f.soil.texture} · {f.elevationM}m
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Season Selector */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-primary" />
            <span>Cropping Season</span>
          </label>
          <div className="space-y-1.5">
            {seasons.map((s) => {
              const isSel = selectedSeason === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSeason(s.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg border transition-all",
                    isSel
                      ? "border-primary bg-primary/10 text-foreground shadow-[0_0_10px_rgba(79,209,255,0.1)]"
                      : "border-border/60 bg-secondary/20 hover:bg-secondary/40 text-muted-foreground",
                  )}
                >
                  <p className={cn("text-xs font-semibold", isSel && "text-primary")}>
                    {s.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
                    {s.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Navigation Quick Links */}
        <div className="space-y-1 pt-2 border-t border-border/70">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
            Mission Control Modules
          </label>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isAct = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigateSection(item.id);
                  setMobileRailOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-mono text-xs transition-colors",
                  isAct
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40",
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit & Satellite Constellation Status Footer */}
        <div className="space-y-3 pt-4 border-t border-border/70 font-mono text-[10px]">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Active Orbits:</span>
            <span className="text-foreground">{SATELLITES.length} SATELLITES</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SATELLITES.map((sat) => (
              <div
                key={sat.id}
                className="flex items-center gap-1.5 p-1 rounded bg-secondary/30 border border-border/40"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sat.color }} />
                <span className="text-foreground text-[9px]">{sat.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground/80 leading-relaxed pt-1">
            Geo: {selectedField.lat.toFixed(4)}°N, {selectedField.lon.toFixed(4)}°E
          </p>
        </div>
      </div>
    </div>
  </aside>
);
}
