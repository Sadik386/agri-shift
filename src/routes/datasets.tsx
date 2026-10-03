import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppTopbar } from "@/components/fieldshift/app-topbar";
import { Sparkline } from "@/components/fieldshift/sparkline";
import { useLang } from "@/lib/i18n";
import {
  NASA_OFFLINE_DATASETS,
  type NasaDataset,
  type DatasetCategory,
  exportDatasetAsGeoJSON,
  exportDatasetAsCSV,
  exportAllOfflineDatasetsJSON,
} from "@/lib/fieldshift/nasa-datasets";
import {
  Database,
  Download,
  Filter,
  CheckCircle2,
  HardDrive,
  Satellite,
  Layers,
  ChevronDown,
  ChevronUp,
  FileJson,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  Search,
} from "lucide-react";

export const Route = createFileRoute("/datasets")({
  component: DatasetsPage,
});

const CATEGORIES: Array<{ key: "ALL" | DatasetCategory; en: string; bn: string }> = [
  { key: "ALL", en: "ALL", bn: "সকল উপাত্ত" },
  { key: "Soil Moisture", en: "Soil Moisture", bn: "মাটির আর্দ্রতা" },
  { key: "Canopy & NDVI", en: "Canopy & NDVI", bn: "গাছের আচ্ছাদন ও NDVI" },
  { key: "Thermal & ET", en: "Thermal & ET", bn: "তাপীয় ও বাষ্পীভবন" },
  { key: "Evapotranspiration", en: "Evapotranspiration", bn: "বাষ্পীভবন (ET)" },
  { key: "Groundwater & Aquifer", en: "Groundwater & Aquifer", bn: "ভূগর্ভস্থ পানি ও একুইফার" },
  { key: "Precipitation", en: "Precipitation", bn: "বৃষ্টিপাত (GPM)" },
  { key: "Radar & SAR", en: "Radar & SAR", bn: "রাডার ও সার (SAR)" },
];

function DatasetsPage() {
  const { lang } = useLang();
  const isBn = lang === "bn";
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | DatasetCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("smap-l4-smgp");

  const filteredDatasets = useMemo(() => {
    return NASA_OFFLINE_DATASETS.filter((ds) => {
      const matchesCategory = selectedCategory === "ALL" || ds.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ds.title.toLowerCase().includes(q) ||
        ds.shortName.toLowerCase().includes(q) ||
        ds.mission.toLowerCase().includes(q) ||
        ds.description.toLowerCase().includes(q) ||
        ds.daac.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased flex flex-col">
      <AppTopbar currentTab="datasets" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#0c1a2e]/90 via-[#0a1220]/90 to-[#070b14]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 font-mono text-[11px] text-cyan-400 uppercase tracking-wider">
                <HardDrive className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                <span>
                  {isBn ? "অফলাইন স্থানীয় ভান্ডার · নাসা আর্থডাটা সংযুক্ত" : "OFFLINE LOCAL REPOSITORY · NASA EARTHDATA EMBEDDED"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {isBn ? "নাসা অফলাইন আর্থ অবজারভেশন উপাত্ত সংগ্রহশালা" : "Offline NASA Datasets Archive"}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {isBn
                  ? "বাংলাদেশের কৃষি-জলবায়ু অঞ্চলের জন্য ক্যালিব্রেট করা সম্পূর্ণ অফলাইন সক্ষম ভূ-পর্যবেক্ষণ টেলিমেট্রি। বিদ্যুৎ বা ইন্টারনেট সংযোগহীন চরাঞ্চল ও উপকূলীয় কৃষকদের জন্য বিশেষভাবে সংরক্ষিত।"
                  : "Full-featured, offline-ready Earth Observation telemetry calibrated for Bangladesh agro-climatic zones. Designed for field agronomists, remote farming communities, and researchers operating in zero-connectivity environments."}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> {isBn ? "৭টি নাসা স্যাটেলাইট মিশন সিঙ্ক ও ক্যাশড" : "7 Missions Synchronized & Cached"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Satellite className="w-4 h-4" /> SMAP, Landsat 9, ECOSTRESS, OpenET, NISAR, GRACE-FO, GPM
                </span>
              </div>
            </div>

            {/* Quick Export Button */}
            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                onClick={exportAllOfflineDatasetsJSON}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono tracking-wider transition-all shadow-[0_0_20px_rgba(0,229,255,0.25)]"
                title="Download all 7 NASA datasets as a complete JSON package"
              >
                <Download className="w-4 h-4" />
                <span>{isBn ? "সম্পূর্ণ আর্কাইভ ডাউনলোড (.JSON)" : "DOWNLOAD ARCHIVE (.JSON)"}</span>
              </button>
              <span className="text-[10px] font-mono text-slate-400 text-center">
                {isBn ? "১০০% ক্লায়েন্ট-সাইড · কোনো ইন্টারনেটের প্রয়োজন নেই" : "100% Client-Side · No Internet Needed"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-y border-slate-800 py-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBn ? "ডেটাসেট, মিশন, সেন্সর বা DAAC খুঁজুন..." : "Search datasets, mission, instrument, DAAC..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-white font-mono text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors border ${
                  selectedCategory === cat.key
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {isBn ? cat.bn : cat.en}
              </button>
            ))}
          </div>
        </div>

        {/* Datasets List */}
        <div className="space-y-6">
          {filteredDatasets.map((ds) => {
            const isExpanded = expandedId === ds.id;
            return (
              <div
                key={ds.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? "border-cyan-500/50 bg-[#0e1626]/90 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
                    : "border-slate-800 bg-[#0b111e]/70 hover:border-slate-700"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : ds.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-semibold">
                        {ds.shortName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        ✓ {ds.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {ds.category}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">
                      {ds.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {ds.description}
                    </p>
                  </div>

                  {/* Sparkline & Actions */}
                  <div className="flex items-center gap-6 self-end lg:self-center shrink-0">
                    {/* 12-month Trend Preview */}
                    <div className="hidden sm:flex flex-col items-end gap-1">
                      <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                        {isBn ? "১২ মাসের বাংলাদেশ ট্রেন্ড" : "12-Mo Bangladesh Trend"}
                      </span>
                      <div className="w-28 h-7">
                        <Sparkline data={ds.monthlyTrend} color="#00e5ff" height={28} />
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                      aria-label="Toggle dataset details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-5 sm:p-6 space-y-6 bg-black/20">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {isBn ? "মিশন / সেন্সর" : "Mission / Sensor"}
                        </span>
                        <b className="text-white text-xs mt-1 block truncate">{ds.mission}</b>
                        <span className="text-[10px] text-cyan-400 block">{ds.instrument}</span>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {isBn ? "স্থানিক রেজোলিউশন" : "Spatial Resolution"}
                        </span>
                        <b className="text-white text-xs mt-1 block truncate">{ds.spatialResolution}</b>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {isBn ? "পুনরাবৃত্তি সময়কাল" : "Temporal Revisit"}
                        </span>
                        <b className="text-white text-xs mt-1 block truncate">{ds.temporalResolution}</b>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">
                          {isBn ? "সংরক্ষণাগার DAAC" : "Archive DAAC"}
                        </span>
                        <b className="text-white text-xs mt-1 block truncate">{ds.daac}</b>
                        <span className="text-[10px] text-slate-400 block">DOI: {ds.doi}</span>
                      </div>
                    </div>

                    {/* Agronomic Application Note */}
                    <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-100 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <b className="font-mono text-cyan-300 block uppercase mb-1">
                          {isBn ? "বাংলাদেশের জলবায়ু অভিযোজনে কৃষিপ্রাসঙ্গিকতা:" : "Agronomic Relevance for Bangladesh Climate Adaptation:"}
                        </b>
                        <p className="leading-relaxed">{ds.agronomicRelevance}</p>
                      </div>
                    </div>

                    {/* Offline Granules Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span>
                            {isBn ? `স্থানীয়ভাবে সংরক্ষিত গ্র্যানিউল (${ds.offlineGranules.length}টি কৃষি অঞ্চল)` : `Locally Cached Granules (${ds.offlineGranules.length} Agricultural Zones)`}
                          </span>
                        </h3>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <button
                            onClick={() => exportDatasetAsGeoJSON(ds)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                            title="Export as GeoJSON feature collection"
                          >
                            <FileJson className="w-3.5 h-3.5" />
                            <span>Export GeoJSON</span>
                          </button>
                          <button
                            onClick={() => exportDatasetAsCSV(ds)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
                            title="Export as comma-separated values"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export CSV</span>
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left font-mono text-xs">
                          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                            <tr>
                              <th className="py-2.5 px-3">{isBn ? "ক্ষেতের অবস্থান" : "Field Site"}</th>
                              <th className="py-2.5 px-3">{isBn ? "জেলা" : "District"}</th>
                              <th className="py-2.5 px-3">{isBn ? "স্থানাঙ্ক" : "Coordinates"}</th>
                              <th className="py-2.5 px-3">{isBn ? "পর্যবেক্ষিত মান" : "Observed Value"}</th>
                              <th className="py-2.5 px-3">{isBn ? "বিচ্যুতি" : "Anomaly"}</th>
                              <th className="py-2.5 px-3">{isBn ? "মান সূচক" : "Quality"}</th>
                              <th className="py-2.5 px-3">{isBn ? "মেটাডাটা ফ্ল্যাগ" : "Metadata Flag"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                            {ds.offlineGranules.map((g) => (
                              <tr key={g.siteId} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-3 font-semibold text-white">{g.siteName}</td>
                                <td className="py-2.5 px-3 text-cyan-400">{g.district}</td>
                                <td className="py-2.5 px-3 text-slate-400">
                                  {g.coordinates[0].toFixed(3)}°N, {g.coordinates[1].toFixed(3)}°E
                                </td>
                                <td className="py-2.5 px-3 font-bold text-white">
                                  {g.observedValue} {g.unit}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                                      g.anomalyPercent < -15
                                        ? "bg-red-500/20 text-red-300 font-bold"
                                        : g.anomalyPercent < 0
                                        ? "bg-amber-500/20 text-amber-300"
                                        : "bg-emerald-500/20 text-emerald-300"
                                    }`}
                                  >
                                    {g.anomalyPercent > 0 ? `+${g.anomalyPercent}%` : `${g.anomalyPercent}%`}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    {g.qualityFlag}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-[10px] text-slate-400 truncate max-w-[200px]">
                                  {Object.entries(g.rawMetadata)
                                    .slice(0, 2)
                                    .map(([k, v]) => `${k}:${v}`)
                                    .join(" · ")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Scientific Parameters Breakdown */}
                    <div className="space-y-3 pt-2">
                      <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {isBn ? "পরিমাপকৃত ভৌত চলক ও ক্যালিব্রেশন পরিসীমা" : "Measured Physical Variables & Calibration Thresholds"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {ds.parameters.map((param) => (
                          <div
                            key={param.name}
                            className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 space-y-1 font-mono text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-400">{param.name}</span>
                              <span className="text-[10px] text-slate-400">{param.unit}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-snug">{param.description}</p>
                            <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                              <span>Range: [{param.validRange[0]}, {param.validRange[1]}]</span>
                              <span className="text-emerald-400">Typical: {param.typicalAgriValue}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation CTA */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d1524]/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div>
            <b className="text-white block text-sm">
              {isBn ? "এই ডেটাসেটগুলি দিয়ে ফসলের পর্যায়ক্রম মডেল করতে চান?" : "Need to model rotations with these datasets?"}
            </b>
            <span className="text-slate-400">
              {isBn ? "SMAP, Landsat, এবং OpenET কীভাবে ৩-বছরের অভিযোজিত ক্রপ ক্যালেন্ডারে কাজ করে দেখুন।" : "Explore how SMAP, Landsat, and OpenET feed into the 3-Year Adaptive Cropping Gantt."}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/planner"
              className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-bold"
            >
              {isBn ? "ক্রপ প্ল্যানার চালু করুন ›" : "LAUNCH CROP PLANNER ›"}
            </Link>
            <Link
              to="/field"
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              {isBn ? "৩D ভূপ্রকৃতি ভিউয়ার" : "3D TERRAIN VIEWER"}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
