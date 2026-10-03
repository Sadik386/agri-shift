import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HERO_SRC } from "@/assets/hero-video";
import { DisasterResilienceHero } from "@/components/fieldshift/disaster-resilience-hero";
import { useLang } from "@/lib/i18n";
import { Languages, Menu, ShieldAlert, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang } = useLang();
  const isBn = lang === "bn";

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] font-sans antialiased">
      {/* Navigation */}
      <header className="nav-fs">
        <Link to="/" className="brand-fs">
          <span className="logo-fs" aria-hidden="true">
            ◈
          </span>
          <span>
            <b>
              {isBn ? "এগ্রি " : "AGRI "}
              <i>{isBn ? "শিফট" : "SHIFT"}</i>
            </b>
            <small>{isBn ? "নাসা উপাত্ত পোর্টাল" : "NASA DATA PORTAL"}</small>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="links-fs" aria-label="Main">
          <Link to="/dashboard">{isBn ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
          <Link to="/heatmap" className="text-cyan-400 font-semibold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{isBn ? "১০৪-গ্রিড হিটম্যাপ" : "104-Hex Heatmap"}</span>
          </Link>
          <Link to="/globe">{isBn ? "গ্লোব" : "Globe View"}</Link>
          <Link to="/field">{isBn ? "ফিল্ড ম্যাপ" : "Field Map"}</Link>
          <Link to="/planner">{isBn ? "ফসল পরিকল্পনা" : "Crop Planner"}</Link>
          <Link to="/analytics">{isBn ? "টেলিমেট্রি বিশ্লেষণ" : "Analytics"}</Link>
          <Link to="/datasets" className="text-emerald-400 font-medium">
            {isBn ? "নাসা উপাত্ত" : "NASA Datasets"}
          </Link>
          <Link
            to="/chat"
            className="text-cyan-300 font-semibold flex items-center gap-1 border border-cyan-400/40 bg-cyan-950/40 px-2.5 py-0.5 rounded-full hover:bg-cyan-500/20 transition-colors text-xs"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isBn ? "এআই সহকারী" : "Ask AI"}</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/15 bg-white/5 font-mono text-[11px] text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label={isBn ? "Switch language to English" : "বাংলা ভাষায় পরিবর্তন করুন"}
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBn ? "English" : "বাংলা"}</span>
          </button>

          <Link
            to="/datasets"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>7 OFFLINE</span>
          </Link>
          <Link to="/dashboard" className="btn-fs nav-cta-fs">
            {isBn ? "কনসোল চালু করুন" : "Launch App"}
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="nav-toggle-fs"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="nav-mobile-menu-fs">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">00</span>
              <span>{isBn ? "মিশন ড্যাশবোর্ড" : "Mission Dashboard"}</span>
            </Link>
            <Link
              to="/heatmap"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs border-cyan-500/40 bg-cyan-950/20"
            >
              <span className="mono text-cyan-400 text-xs">01</span>
              <span className="text-cyan-300 font-semibold">
                {isBn ? "১০৪-গ্রিড নাসা হিটম্যাপ" : "104-Hexagon NASA Heatmap"}
              </span>
            </Link>
            <Link
              to="/globe"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">02</span>
              <span>{isBn ? "৩D গ্লোব ট্র্যাকিং" : "Globe View"}</span>
            </Link>
            <Link
              to="/field"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">03</span>
              <span>{isBn ? "ফিল্ড স্তরীয় আর্দ্রতা মানচিত্র" : "Field Map"}</span>
            </Link>
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">04</span>
              <span>{isBn ? "ফসল রোটেশন ও দুর্যোগ প্রতিরোধ" : "Crop Planner"}</span>
            </Link>
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">05</span>
              <span>{isBn ? "টেলিমেট্রি বিশ্লেষণ ও ঝুঁকি" : "Analytics & Risk"}</span>
            </Link>
            <Link
              to="/datasets"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs border-emerald-500/40 bg-emerald-950/20"
            >
              <span className="mono text-emerald-400 text-xs">06</span>
              <span className="text-emerald-300 font-semibold">
                {isBn ? "নাসা সংরক্ষিত অফলাইন উপাত্ত (৭টি)" : "NASA Offline Datasets (7)"}
              </span>
            </Link>
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs border-cyan-500/40 bg-cyan-950/30"
            >
              <span className="mono text-cyan-400 text-xs">07</span>
              <span className="text-cyan-300 font-semibold">
                {isBn ? "এগ্রিশিফট এআই সহকারী (ল্যাংচেইন)" : "AgriShift AI (LangChain)"}
              </span>
            </Link>

            <div className="pt-3 border-t border-border/70 mt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setLang(lang === "en" ? "bn" : "en")}
                className="btn-fs w-full justify-center text-xs"
              >
                <Languages className="w-4 h-4 mr-2 text-cyan-400" />
                {isBn ? "Switch to English" : "বাংলায় দেখুন"}
              </button>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-fs fill w-full justify-center"
              >
                {isBn ? "অ্যাপ কনসোল খুলুন →" : "Launch App Console →"}
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-fs">
        <video
          className="bgv"
          src={HERO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="ov" />

        <div>
          <span className="pill-fs hero-animate-pill">
            ✦ NASA SPACE APPS CHALLENGE 2026 · CLIMATE DISASTER DEFENSE
          </span>
          <h1 className="lx hero-animate-title">
            {isBn
              ? "প্রাকৃতিক দুর্যোগ বিশ্লেষণ ও সাশ্রয়ী টেকসই ফসল ইঞ্জিন"
              : "Climate Disaster Analysis & Low-Cost Crop Precision"}
          </h1>
        </div>

        <p className="hero-animate-desc">
          {isBn
            ? "খরা, উপকূলীয় লবণাক্ততা ও পাহাড়ি ঢলের মতো প্রাকৃতিক দুর্যোগ বিশ্লেষণ করে নাসা আর্থ অবজারভেশন উপাত্তের সাহায্যে সর্বনিম্ন খরচে সর্বোচ্চ লাভজনক ফসল উৎপাদনের বৈজ্ঞানিক প্ল্যাটফর্ম।"
            : "Turn Natural Climate Shocks (Drought, Salinity, Flash Floods, Heatwaves) into High-Profit, Low-Input Farming Strategies using Real NASA Earth Observations."}
        </p>

        <div className="row-fs hero-animate-buttons">
          <Link to="/dashboard" className="btn-fs fill">
            {isBn ? "মিশন কনসোল খুলুন" : "Launch Mission Console"}
          </Link>
          <Link to="/heatmap" className="btn-fs">
            {isBn ? "১০৪-গ্রিড নাসা হিটম্যাপ" : "104-Hex Grid Heatmap"}
          </Link>
          <Link to="/planner" className="btn-fs">
            {isBn ? "রোটেশন প্ল্যানার" : "Crop Rotation Planner"}
          </Link>
        </div>
      </section>

      {/* Live Telemetry Ticker */}
      <div className="tick-fs">
        <span className="tag-fs">
          <i className="dot-fs" style={{ marginRight: "6px" }} />
          Live Telemetry Stream
        </span>
        <span>
          SMAP L4: Soil Moisture <s>-</s> <em className="a">0.14 m³/m³ (Barind Drought)</em>
        </span>
        <span>
          MODIS LST: Thermal <s>-</s> <em>37.4°C Canopy Spike</em>
        </span>
        <span>
          GPM IMERG: Monsoon <s>-</s> <em>168mm Upstream Inundation</em>
        </span>
        <span>
          OpenET: ETa <s>-</s> <em className="a">5.8 mm/day Crop Deficit</em>
        </span>
        <span>
          Landsat 9: NDVI <s>-</s> <em>30m Resolution Agro Grids</em>
        </span>
      </div>

      {/* Interactive Climate Disaster & Low-Cost Resilient Crop Engine (Below Hero Section) */}
      <section className="relative z-10 px-3 sm:px-6 py-6">
        <DisasterResilienceHero />
      </section>

      {/* Feature Section: Integrated Satellite Intelligence & Disaster Defense */}
      <section className="sec-fs">
        <header>
          <span className="eb-fs">Decision system engine</span>
          <h2 className="lx">
            {isBn ? "প্রাকৃতিক দুর্যোগ প্রতিরোধ ও টেকসই কৃষি প্রযুক্তি" : "Integrated Disaster Defense & Satellite Intelligence"}
          </h2>
        </header>

        <div className="grid3-fs">
          <article className="card-fs feat-fs border-cyan-500/30">
            <div
              className="img"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.45), #06101c 65%)",
              }}
            />
            <div className="b">
              <h3 className="lx text-cyan-300">
                <span className="ic-fs">🛡️</span>
                {isBn ? "প্রাকৃতিক দুর্যোগ বিশ্লেষণ" : "Climate Disaster Analysis"}
              </h3>
              <p>
                {isBn
                  ? "বরেন্দ্র অঞ্চলের খরা, উপকূলের লবণাক্ততা ও হাওরের পাহাড়ি ঢল পূর্বানুমান করে ফসলের শতভাগ ক্ষতি রোধ করার সিদ্ধান্ত সহায়তা।"
                  : "Detect early warning triggers for Barind groundwater depletion, coastal salinity surges, and Haor flash floods before planting."}
              </p>
              <Link to="/planner" className="lnk-fs text-cyan-400 font-semibold">
                {isBn ? "দুর্যোগ সহনশীলতা দেখুন →" : "Explore Disaster Defense →"}
              </Link>
            </div>
          </article>

          <article className="card-fs feat-fs border-emerald-500/30">
            <div
              className="img"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.4), #06101c 65%)",
              }}
            />
            <div className="b">
              <h3 className="lx text-emerald-300">
                <span className="ic-fs">💰</span>
                {isBn ? "স্বল্প খরচ ও সর্বোচ্চ লাভ" : "Low-Cost, High-Profit Crops"}
              </h3>
              <p>
                {isBn
                  ? "অতিরিক্ত সেচ ও সারের ওপর নির্ভরশীল বোরো ধানের বদলে জুয়ার, মুগডাল ও সরিষা চাষে ৭০% সেচ ডিজেল খরচ সাশ্রয় ও একরে +৪০,০০০৳ পর্যন্ত লাভ।"
                  : "Slash diesel pumping and fertilizer costs by up to 72% by shifting to deep-rooted sorghum, legumes, and oilseeds."}
              </p>
              <Link to="/planner" className="lnk-fs text-emerald-400 font-semibold">
                {isBn ? "মুনাফা ক্যালকুলেটর →" : "View Profit Surface →"}
              </Link>
            </div>
          </article>

          <article className="card-fs feat-fs">
            <div
              className="img"
              style={{
                background: "radial-gradient(circle at 50% 50%, #00e5ff55, #06101c 60%)",
              }}
            />
            <div className="b">
              <h3 className="lx">
                <span className="ic-fs">◎</span>
                {isBn ? "৩D গ্লোব ও স্যাটেলাইট ট্র্যাকিং" : "3D Globe Tracking"}
              </h3>
              <p>
                {isBn
                  ? "নাসার SMAP, Landsat 9, NISAR ও ECOSTRESS কৃত্রিম উপগ্রহের প্রদক্ষিণ ও কৃষি জোনে তাদের রিয়েল-টাইম ডাটা কভারেজ ট্র্যাক করুন।"
                  : "Track SMAP, Landsat, NISAR & ECOSTRESS satellites in real-time across an interactive 3D globe showing agricultural focus zones."}
              </p>
              <Link to="/globe" className="lnk-fs">
                {isBn ? "টেলিমেট্রি অ্যাক্সেস →" : "Access Telemetry →"}
              </Link>
            </div>
          </article>

          <article className="card-fs feat-fs">
            <div
              className="img"
              style={{
                background:
                  "repeating-linear-gradient(0deg, #00e5ff33 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, #00e5ff33 0 1px, transparent 1px 28px), #123326",
              }}
            />
            <div className="b">
              <h3 className="lx">
                <span className="ic-fs">▦</span>
                {isBn ? "ফিল্ড স্তরীয় আর্দ্রতা মানচিত্র" : "Field-Level Intelligence"}
              </h3>
              <p>
                {isBn
                  ? "মাটির আর্দ্রতা, বাষ্পীভবন (OpenET), এবং ভূমির পৃষ্ঠ তাপমাত্রার ত্রিমাত্রিক মডেলিং দেখে জমিতে সুনির্দিষ্ট সেচ সিদ্ধান্ত নিন।"
                  : "Fuse soil moisture, evapotranspiration, NDVI & surface temperature metrics at specific parcel resolution for real-time risk modeling."}
              </p>
              <Link to="/field" className="lnk-fs">
                {isBn ? "পার্সেল পর্যবেক্ষণ →" : "Access Parcel 3D →"}
              </Link>
            </div>
          </article>

          <article className="card-fs feat-fs">
            <div
              className="img"
              style={{
                background: "linear-gradient(0deg, #3f6b1f, #0f2412)",
              }}
            />
            <div className="b">
              <h3 className="lx">
                <span className="ic-fs">✕</span>
                {isBn ? "বহু-বার্ষিক ফসল রোটেশন ইঞ্জিন" : "Crop Rotation Engine"}
              </h3>
              <p>
                {isBn
                  ? "লেগিউম ও কভার ক্রপ ব্যবহার করে মাটির জৈব কার্বন (SOC) বৃদ্ধি এবং দীর্ঘমেয়াদে রাসায়নিক সারের ব্যবহার কমানোর বৈজ্ঞানিক পদ্ধতি।"
                  : "Model multi-year crop rotation strategies with precise yield projections powered by deep historic NASA observations."}
              </p>
              <Link to="/planner" className="lnk-fs">
                {isBn ? "রোটেশন সাজান →" : "Design Rotation →"}
              </Link>
            </div>
          </article>

          <article className="card-fs feat-fs">
            <div
              className="img"
              style={{
                background: "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.35), #06101c 70%)",
              }}
            />
            <div className="b">
              <h3 className="lx">
                <span className="ic-fs">◈</span>
                {isBn ? "সংরক্ষিত নাসা অফলাইন উপাত্ত (৭টি)" : "Offline NASA Datasets (7)"}
              </h3>
              <p>
                {isBn
                  ? "ইন্টারনেট সংযোগ ছাড়াও মাঠপর্যায়ে ব্যবহারের জন্য ৭টি পিয়ার-রিভিউড নাসা উপাত্তের অফলাইন ক্যাশ (SMAP, Landsat 9, ECOSTRESS, GRACE-FO, OpenET)।"
                  : "Browse 7 pre-cached, peer-reviewed NASA Earth observation datasets (SMAP, Landsat 9, ECOSTRESS, NISAR, GRACE-FO, GPM, OpenET) for zero-latency offline agronomy."}
              </p>
              <Link to="/datasets" className="lnk-fs text-cyan-400">
                {isBn ? "অফলাইন আর্কাইভ দেখুন →" : "Explore Offline Archive →"}
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Metrics Banner */}
      <div className="metrics-fs">
        {[
          { icon: "🛡️", val: "-72%", label: isBn ? "সেচ ডিজেল সাশ্রয়" : "Diesel Pumping Saved" },
          { icon: "💰", val: "+140%", label: isBn ? "নিট মুনাফা বৃদ্ধি" : "Net Profit Surge" },
          { icon: "✓", val: "94%", label: isBn ? "দুর্যোগ সুরক্ষা হার" : "Disaster Survival Rate" },
          { icon: "🛰️", val: "7", label: isBn ? "নাসা মিশন ইন্টিগ্রেটেড" : "NASA Missions Synced" },
        ].map((m) => (
          <div key={m.label}>
            <span className="ic-fs">{m.icon}</span>
            <span>
              <b>{m.val}</b>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* 3 Steps Adaptation Workflow */}
      <section className="sec-fs" id="how-it-works">
        <header>
          <span className="eb-fs" style={{ color: "var(--am)" }}>
            {isBn ? "দুর্যোগ মোকাবিলার ৩টি ধাপ" : "Adaptation workflow"}
          </span>
          <h2 className="lx">
            {isBn ? "দুর্যোগ ঝুঁকি থেকে টেকসই লাভজনক ফলন" : "Precision Modeling in 3 Steps"}
          </h2>
        </header>

        <div className="steps-fs">
          {[
            {
              icon: "⌖",
              title: isBn ? "১. দুর্যোগ অঞ্চল শনাক্তকরণ" : "1. Disaster Profiling",
              desc: isBn
                ? "স্যাটেলাইট উপাত্তের ভিত্তিতে আপনার জেলায় খরা, লবণাক্ততা বা আগাম বন্যার তীব্রতা যাচাই করুন।"
                : "Identify real-time drought, salinity, heatwave, or flash flood stress across your parcel with NASA SMAP and MODIS.",
            },
            {
              icon: "🧪",
              title: isBn ? "২. কম খরচের ফসল নির্বাচন" : "2. Low-Cost Crop Selection",
              desc: isBn
                ? "অতিরিক্ত সেচের ব্যয়বহুল ফসলের পরিবর্তে প্রাকৃতিক দুর্যোগ-সহনশীল ও নাইট্রোজেন-সমৃদ্ধ বিকল্প নির্বাচন করুন।"
                : "Replace thirsty, diesel-dependent crops with nitrogen-fixing, deep-rooted alternatives like Sorghum, Mungbean, and Sunflower.",
            },
            {
              icon: "✺",
              title: isBn ? "৩. মুনাফা ও ঝুঁকি সুরক্ষা" : "3. Profit & Harvest Security",
              desc: isBn
                ? "সেচ ডিজেল ও সারের খরচ বাঁচিয়ে প্রতি একরে নিট আয় দ্বিগুণ করুন এবং চরম আবহাওয়াতেও ফসল রক্ষা করুন।"
                : "Eliminate fuel debt cycles, build soil organic carbon, and secure harvest yields even during extreme climate anomalies.",
            },
          ].map((s, idx) => (
            <div key={s.title}>
              <div className="n">
                {s.icon}
                <i>{idx + 1}</i>
              </div>
              <h3 className="lx">{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call To Action */}
      <section className="cta-fs">
        <h2 className="lx">
          {isBn ? "প্রাকৃতিক দুর্যোগকে জয়ে রূপান্তর করতে প্রস্তুত?" : "Ready to Shift Beyond Climate Disasters?"}
        </h2>
        <p>
          {isBn
            ? "নাসা আর্থ অবজারভেশন উপাত্ত ব্যবহার করে প্রাকৃতিক দুর্যোগের ঝুঁকি এড়িয়ে লাভজনক চাষাবাদ শুরু করুন।"
            : "Join producers and agronomists using real NASA Earth observation intelligence to secure yields and eliminate diesel debt."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <Link to="/dashboard" className="btn-fs fill">
            {isBn ? "মিশন কন্ট্রোল ড্যাশবোর্ড" : "Launch Mission Control"}
          </Link>
          <Link to="/heatmap" className="btn-fs">
            {isBn ? "১০৪-গ্রিড নাসা হিটম্যাপ" : "104-Hex Grid Heatmap"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-fs">
        <div className="top">
          <div className="brand-fs">
            <span className="logo-fs" aria-hidden="true">
              ◈
            </span>
            <span>
              <b>
                {isBn ? "এগ্রি " : "AGRI "}
                <i>{isBn ? "শিফট" : "SHIFT"}</i>
              </b>
              <small>NASA SPACE APPS 2026</small>
            </span>
          </div>
          <div className="links">
            <Link to="/dashboard">{isBn ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
            <Link to="/heatmap">{isBn ? "হিটম্যাপ" : "Heatmap"}</Link>
            <Link to="/globe">{isBn ? "গ্লোব" : "Globe"}</Link>
            <Link to="/field">{isBn ? "ফিল্ড ম্যাপ" : "Field 3D"}</Link>
            <Link to="/planner">{isBn ? "পরিকল্পনা" : "Crop Planner"}</Link>
            <Link to="/datasets">{isBn ? "নাসা উপাত্ত" : "NASA Datasets"}</Link>
          </div>
        </div>
        <div className="bottom">
          <p>
            NASA Space Apps Challenge 2026 · Challenge: Be An Earth System Trend Detective ·
            Built for Bangladesh farmers and agronomists by AgriShift.
          </p>
          <p style={{ marginTop: "8px", color: "var(--am)" }}>
            Deterministic statistical models (Mann-Kendall, Theil-Sen) + NASA SMAP, GPM,
            Landsat, MODIS, OpenET observations.
          </p>
        </div>
      </footer>
    </div>
  );
}
