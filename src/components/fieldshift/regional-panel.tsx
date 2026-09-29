import { useState } from "react";
import { Panel, Meter } from "./ui";
import { CROPS, GROWERS, REGIONAL_CROPS } from "@/lib/fieldshift/data";
import { cn } from "@/lib/utils";
import type { FieldSite } from "@/lib/fieldshift/types";
import { Users, TrendingUp, MapPin, Building2, CheckCircle2, ArrowUpRight } from "lucide-react";

export function RegionalPanel({ currentField }: { currentField: FieldSite }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");

  const districts = ["All", "Rangpur", "Rajshahi", "Khulna", "Mymensingh"];

  const filteredGrowers = GROWERS.filter((g) => {
    if (selectedDistrict === "All") return true;
    return g.district.toLowerCase() === selectedDistrict.toLowerCase();
  });

  // Calculate collective groundwater relief impact:
  // Shifting 1 acre of Boro (1150mm) to Maize+Mungbean average (435mm) saves ~715mm = ~7,150,000 litres per acre
  const totalBoroAcres = REGIONAL_CROPS.find((c) => c.cropId === "boroRice")?.acres || 41200;
  const targetShiftAcres = Math.round(totalBoroAcres * 0.25);
  const waterSavedBillionLitres = ((targetShiftAcres * 7150000) / 1e9).toFixed(1);

  return (
    <Panel
      eyebrow="Module 06 · Regional Aggregation"
      title="Collective farm adaptation & market demand equilibrium"
      right={
        <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-2.5 py-1">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-[10px] tracking-wider text-foreground">
            7,420 GROWERS COOPERATIVE
          </span>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Collective Aquifer Impact Banner */}
        <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-sm font-semibold text-foreground">
                Regional Aquifer Recovery Potential (25% Transition Target)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              If {targetShiftAcres.toLocaleString()} acres of northwest intensive Boro rice transition to the climate-smart Maize-Mungbean-Sorghum rotation, the regional water table drawdown halts, preserving groundwater for drinking security.
            </p>
          </div>
          <div className="flex items-baseline gap-2 font-mono bg-background/80 px-4 py-2.5 rounded-lg border border-primary/40 shrink-0">
            <span className="text-2xl font-bold text-primary">{waterSavedBillionLitres}</span>
            <span className="text-xs text-muted-foreground">Billion Litres / Year</span>
          </div>
        </div>

        {/* Regional Crop Supply vs Industry Demand Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Market Supply vs Industrial & Food Processor Demand
            </p>
            <span className="font-mono text-[10px] text-muted-foreground">
              Source: Bangladesh Bureau of Statistics & Agri-Trade Board
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {REGIONAL_CROPS.map((rc) => {
              const crop = CROPS[rc.cropId];
              if (!crop) return null;
              const ratio = (rc.acres / rc.demandAcres) * 100;
              const isDeficit = rc.acres < rc.demandAcres;

              return (
                <div
                  key={rc.cropId}
                  className="rounded-lg border border-border/80 bg-secondary/30 p-3 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{crop.emoji}</span>
                      <span
                        className={cn(
                          "font-mono text-[9px] px-1.5 py-0.5 rounded font-medium",
                          isDeficit
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                        )}
                      >
                        {isDeficit ? "HIGH DEMAND" : "SATURATED"}
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-foreground mt-1.5">{crop.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {rc.growers.toLocaleString()} active plots
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-border/50 font-mono text-[10px]">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Planted:</span>
                      <span className="text-foreground">{rc.acres.toLocaleString()} ac</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Demand:</span>
                      <span className="text-cyan-400">{rc.demandAcres.toLocaleString()} ac</span>
                    </div>
                    <Meter
                      label="Supply Met"
                      value={rc.acres}
                      max={rc.demandAcres}
                      suffix="%"
                      tone={isDeficit ? "amber" : "green"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Participating Grower Network Directory */}
        <div className="rounded-xl border border-border/80 bg-secondary/20 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Cluster Farmers Network · Field Shift Pilot
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connecting adjacent plots for synchronized aerial and satellite advisory management.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
                District:
              </span>
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={cn(
                    "px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-wider transition-colors",
                    selectedDistrict === d
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-secondary/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredGrowers.map((grower, i) => {
              const crop = CROPS[grower.plannedCropId];
              const isCurrent = grower.district.toLowerCase() === currentField.district.toLowerCase();

              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-lg border p-3 bg-card/40 space-y-1.5 transition-all",
                    isCurrent
                      ? "border-primary/50 shadow-[0_0_10px_rgba(79,209,255,0.08)]"
                      : "border-border/70",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{grower.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {grower.acres} ac
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
                    <span>{grower.district} District</span>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between font-mono text-[10px]">
                    <span className="text-muted-foreground">Rotation Crop:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <span>{crop?.emoji}</span>
                      <span>{crop?.name}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
