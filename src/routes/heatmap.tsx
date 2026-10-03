import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlobeStage } from "@/components/GlobeStage";
import { ProvenanceButton } from "@/components/ProvenanceDrawer";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import { nearestDistrict, type Provenance, type VariableKey } from "@/lib/climate";
import { spectralGradient } from "@/lib/colors";
import { analyzeSeries } from "@/lib/stats";
import { fmt, useLang } from "@/lib/i18n";
import tempGrid from "@/data/grid/temperature.json";
import precipGrid from "@/data/grid/precipitation.json";
import solarGrid from "@/data/grid/solar.json";
import ndviGrid from "@/data/grid/ndvi.json";
import lstGrid from "@/data/grid/lst.json";
import deltaOrbit from "@/assets/delta-orbit.jpg";
import monsoonFields from "@/assets/monsoon-fields.jpg";
import climateLab from "@/assets/climate-lab.jpg";

export const Route = createFileRoute("/heatmap")({
  head: () => ({
    meta: [
      { title: "বাংলাদেশের গ্রিড হিটম্যাপ — AgriShift" },
      {
        name: "description",
        content:
          "প্রতিটি ষড়ভুজ আসল নাসা POWER গ্রিড কোষ (০.৫° × ০.৬২৫°) থেকে তৈরি। 104টি কোষ দেশকে ঢেকে রাখে। রং ও উচ্চতা কেবল সংরক্ষিত মান থেকে।",
      },
      { property: "og:title", content: "বাংলাদেশের গ্রিড হিটম্যাপ — AgriShift" },
      {
        property: "og:description",
        content: "Data-driven hex-bin heatmap of Bangladesh built from cached NASA POWER observations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HeatmapPage,
});

interface Grid {
  variable: string;
  unit: string;
  cells: { lat: number; lng: number; annual: Record<string, number> }[];
  provenance: Provenance;
}

const GRIDS: Record<"ndvi" | "lst" | "temperature" | "precipitation" | "solar", Grid> = {
  ndvi: ndviGrid as Grid,
  lst: lstGrid as Grid,
  temperature: tempGrid as Grid,
  precipitation: precipGrid as Grid,
  solar: solarGrid as Grid,
};

const ORDER: (keyof typeof GRIDS)[] = ["ndvi", "lst", "temperature", "precipitation", "solar"];

const LABELS = {
  ndvi: { en: "Vegetation (NDVI)", bn: "উদ্ভিদ সূচক (NDVI)" },
  lst: { en: "Surface temperature", bn: "ভূপৃষ্ঠের তাপমাত্রা" },
  temperature: { en: "Air temperature", bn: "বায়ুর তাপমাত্রা" },
  precipitation: { en: "Rainfall", bn: "বৃষ্টিপাত" },
  solar: { en: "Solar radiation", bn: "সৌর বিকিরণ" },
};

function HeatmapPage() {
  const { lang } = useLang();
  const L = (en: string, bn: string) => (lang === "bn" ? bn : en);
  const [variable, setVariable] = useState<keyof typeof GRIDS>("temperature");
  const [mode, setMode] = useState<"year" | "trend">("year");
  const grid = GRIDS[variable];
  const isSat = variable === "ndvi" || variable === "lst";
  const years = useMemo(
    () => [...new Set(grid.cells.flatMap((c) => Object.keys(c.annual)))].map(Number).sort((a, b) => a - b),
    [grid],
  );
  const [year, setYear] = useState(2024);
  const activeYear = years.includes(year) ? year : years[years.length - 1]!;

  const points = useMemo(() => {
    if (mode === "year") {
      return grid.cells
        .filter((c) => c.annual[String(activeYear)] !== undefined)
        .map((c) => ({ lat: c.lat, lng: c.lng, value: c.annual[String(activeYear)]! }));
    }
    return grid.cells.flatMap((c) => {
      const r = analyzeSeries(
        Object.entries(c.annual).map(([y, v]) => ({ year: Number(y), value: v })),
      );
      return r ? [{ lat: c.lat, lng: c.lng, value: r.slope.slope_per_decade, sig: r.trend.significant_at_0_05 }] : [];
    });
  }, [grid, mode, activeYear]);

  const placeName = (lat: number, lng: number) => {
    const d = nearestDistrict(lat, lng);
    return d ? (lang === "bn" ? d.bn : d.name) : "—";
  };
  const sorted = [...points].sort((a, b) => b.value - a.value);
  const unit = mode === "trend" ? `${grid.unit} / ${L("decade", "দশক")}` : grid.unit;
  const sigCount = mode === "trend" ? points.filter((p) => (p as { sig?: boolean }).sig).length : 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Multi-frame atmospheric background */}
      <div className="site-atmosphere" aria-hidden="true">
        <img
          src={deltaOrbit}
          alt=""
          width={1600}
          height={900}
          className="atmosphere-frame atmosphere-frame-one"
        />
        <img
          src={monsoonFields}
          alt=""
          width={1600}
          height={900}
          className="atmosphere-frame atmosphere-frame-two"
        />
        <img
          src={climateLab}
          alt=""
          width={1600}
          height={900}
          className="atmosphere-frame atmosphere-frame-three"
        />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        {lang === "bn" ? "মূল অংশে যান" : "Skip to main content"}
      </a>

      <SiteHeader />

      <main id="main" className="relative z-10 flex-1">
        <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            {L("Gridded heatmap of Bangladesh", "বাংলাদেশের গ্রিড হিটম্যাপ")}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {L(
              isSat
                ? `Each hexagon aggregates real NASA MODIS satellite samples (${grid.cells.length} sites, one per district). No values are interpolated — colour and height come only from cached measurements.`
                : `প্রতিটি ষড়ভুজ আসল নাসা POWER গ্রিড কোষ (০.৫° × ০.৬২৫°) থেকে তৈরি। ${grid.cells.length}টি কোষ দেশকে ঢেকে রাখে। রং ও উচ্চতা কেবল সংরক্ষিত মান থেকে।`,
              isSat
                ? `প্রতিটি ষড়ভুজ আসল নাসা MODIS উপগ্রহ নমুনা থেকে তৈরি (${grid.cells.length}টি স্থান, প্রতি জেলায় একটি)। কোনো মান অনুমান করা হয়নি।`
                : `প্রতিটি ষড়ভুজ আসল নাসা POWER গ্রিড কোষ (০.৫° × ০.৬২৫°) থেকে তৈরি। ${grid.cells.length}টি কোষ দেশকে ঢেকে রাখে। রং ও উচ্চতা কেবল সংরক্ষিত মান থেকে।`,
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">{L("Variable", "সূচক")}</legend>
              {ORDER.map((k) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={variable === k}
                  onClick={() => setVariable(k)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    variable === k
                      ? "border-primary bg-primary text-primary-foreground font-medium"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {L(LABELS[k].en, LABELS[k].bn)}
                </button>
              ))}
            </fieldset>

            <label className="text-sm text-muted-foreground">
              {L("View", "দেখুন")}{" "}
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "year" | "trend")}
                className="ml-1 rounded-md border border-border bg-card px-2 py-1 text-foreground"
              >
                <option value="year">{L("Annual mean for a year", "একটি বছরের বার্ষিক গড়")}</option>
                <option value="trend">{L("Theil-Sen trend per decade", "প্রতি দশকে থাইল-সেন প্রবণতা")}</option>
              </select>
            </label>

            {mode === "year" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                {L("Year", "বছর")}{" "}
                <span className="font-mono text-foreground">
                  {fmt(activeYear, lang, 0).replace(/,/g, "")}
                </span>
                <input
                  type="range"
                  min={years[0]}
                  max={years[years.length - 1]}
                  value={activeYear}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-40 accent-[var(--color-primary)]"
                />
              </label>
            )}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="panel h-[420px] overflow-hidden sm:h-[560px]">
              <GlobeStage
                variable={variable as VariableKey}
                phase="bangladesh"
                onPhaseChange={() => {}}
                onSelectDistrict={() => {}}
                hexMode
                gridPoints={points}
              />
            </div>

            <aside className="panel p-4">
              <h2 className="font-display text-lg text-foreground">
                {L(LABELS[variable].en, LABELS[variable].bn)} ·{" "}
                <span className="text-sm text-muted-foreground">{unit}</span>
              </h2>

              <div className="mt-3">
                <div
                  className="h-2.5 w-full rounded-full"
                  style={{ background: spectralGradient(variable as VariableKey) }}
                />
                <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
                  <span>{fmt(sorted[sorted.length - 1]?.value ?? 0, lang, 2)}</span>
                  <span>{fmt(sorted[0]?.value ?? 0, lang, 2)}</span>
                </div>
              </div>

              {mode === "trend" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {L(
                    `${sigCount} of ${points.length} cells show a statistically significant Mann-Kendall trend (p < 0.05).`,
                    `${points.length}টির মধ্যে ${sigCount}টি কোষে পরিসংখ্যানগতভাবে উল্লেখযোগ্য ম্যান-কেন্ডাল প্রবণতা (p < ০.০৫)।`,
                  )}
                </p>
              )}

              <h3 className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                {L("Highest cells", "সর্বোচ্চ কোষ")}
              </h3>
              <ol className="mt-1 space-y-1 text-sm">
                {sorted.slice(0, 5).map((p) => (
                  <li key={`${p.lat},${p.lng}`} className="flex justify-between font-mono text-foreground">
                    <span className="font-sans">
                      {placeName(p.lat, p.lng)}{" "}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.lat.toFixed(1)}°,{p.lng.toFixed(1)}°
                      </span>
                    </span>
                    <span className="text-[var(--rising)]">{fmt(p.value, lang, 2)}</span>
                  </li>
                ))}
              </ol>

              <h3 className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                {L("Lowest cells", "সর্বনিম্ন কোষ")}
              </h3>
              <ol className="mt-1 space-y-1 text-sm">
                {sorted.slice(-5).reverse().map((p) => (
                  <li key={`${p.lat},${p.lng}`} className="flex justify-between font-mono text-foreground">
                    <span className="font-sans">
                      {placeName(p.lat, p.lng)}{" "}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.lat.toFixed(1)}°,{p.lng.toFixed(1)}°
                      </span>
                    </span>
                    <span className="text-[var(--declining)]">{fmt(p.value, lang, 2)}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-4">
                <ProvenanceButton
                  provenance={grid.provenance}
                  title={L(LABELS[variable].en, LABELS[variable].bn)}
                  payload={{
                    variable,
                    unit,
                    mode,
                    year: mode === "year" ? activeYear : null,
                    n_cells: points.length,
                    provenance: grid.provenance,
                    points: points.slice(0, 20),
                  }}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
