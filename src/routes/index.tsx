import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HERO_SRC } from "@/assets/hero-video";
import { Menu, X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              FIELD <i>SHIFT</i>
            </b>
            <small>NASA DATA PORTAL</small>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="links-fs" aria-label="Main">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/globe">Globe View</Link>
          <Link to="/field">Field Map</Link>
          <Link to="/planner">Crop Planner</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/datasets" className="text-cyan-400 font-semibold">
            NASA Datasets
          </Link>
          <a href="#how-it-works">Docs</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/datasets" className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>7 OFFLINE</span>
          </Link>
          <Link to="/dashboard" className="btn-fs nav-cta-fs">
            Launch App
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
              <span>Mission Dashboard</span>
            </Link>
            <Link
              to="/globe"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">01</span>
              <span>Globe View</span>
            </Link>
            <Link
              to="/field"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">02</span>
              <span>Field Map</span>
            </Link>
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">03</span>
              <span>Crop Planner</span>
            </Link>
            <Link
              to="/analytics"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">04</span>
              <span>Analytics &amp; Risk</span>
            </Link>
            <Link
              to="/datasets"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs border-cyan-500/40 bg-cyan-950/20"
            >
              <span className="mono text-cyan-400 text-xs">05</span>
              <span className="text-cyan-300 font-semibold">NASA Offline Datasets (7)</span>
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="mob-link-fs"
            >
              <span className="mono text-primary text-xs">ℹ</span>
              <span>Documentation</span>
            </a>

            <div className="pt-3 border-t border-border/70 mt-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-fs fill w-full justify-center"
              >
                Launch App Console →
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
          <span className="pill-fs hero-animate-pill">✦ SPACE APPS CHALLENGE 2026</span>
          <h1 className="lx hero-animate-title">Shift Your Fields Forward</h1>
        </div>

        <p className="hero-animate-desc">
          NASA Earth Observations Meet Precision Agriculture. Unlock deep-space telemetry to
          guide soil resilience, crop hydration, and adaptive rotation schemes.
        </p>

        <div className="row-fs hero-animate-buttons">
          <Link to="/globe" className="btn-fs fill">
            Explore the Globe
          </Link>
          <Link to="/analytics" className="btn-fs">
            View Demo
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
          SMAP: Active <s>-</s> <em>Orbit 47,231</em>
        </span>
        <span>
          Landsat 9: Capturing <s>-</s> <em>Scene LC08_2024</em>
        </span>
        <span>
          OpenET: 2.1M Fields <s>-</s> <em className="a">Processed Daily</em>
        </span>
        <span>
          ECOSTRESS <s>-</s> <em>Temp 34.2°C</em>
        </span>
      </div>

      {/* Feature Section: Integrated Satellite Intelligence */}
      <section className="sec-fs">
        <header>
          <span className="eb-fs">Decision system engine</span>
          <h2 className="lx">Integrated Satellite Intelligence</h2>
        </header>

        <div className="grid3-fs">
          <article className="card-fs feat-fs">
            <div
              className="img"
              style={{
                background: "radial-gradient(circle at 50% 50%, #00e5ff55, #06101c 60%)",
              }}
            />
            <div className="b">
              <h3 className="lx">
                <span className="ic-fs">◎</span>3D Globe Tracking
              </h3>
              <p>
                Track SMAP, Landsat, NISAR &amp; ECOSTRESS satellites in real-time across an
                interactive 3D globe showing agricultural focus zones.
              </p>
              <Link to="/globe" className="lnk-fs">
                Access Telemetry →
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
                <span className="ic-fs">▦</span>Field-Level Intelligence
              </h3>
              <p>
                Fuse soil moisture, evapotranspiration, NDVI &amp; surface temperature metrics at
                specific parcel resolution for real-time risk modeling.
              </p>
              <Link to="/field" className="lnk-fs">
                Access Telemetry →
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
                <span className="ic-fs">✕</span>Crop Rotation Engine
              </h3>
              <p>
                Model multi-year crop rotation strategies with precise yield projections powered by
                deep historic NASA observations.
              </p>
              <Link to="/planner" className="lnk-fs">
                Access Telemetry →
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
                <span className="ic-fs">◈</span>Offline NASA Datasets
              </h3>
              <p>
                Browse 7 pre-cached, peer-reviewed NASA Earth observation datasets (SMAP, Landsat 9, ECOSTRESS, NISAR, GRACE-FO, GPM, OpenET) for zero-latency offline agronomy.
              </p>
              <Link to="/datasets" className="lnk-fs text-cyan-400">
                Explore Offline Archive →
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* Metrics Banner */}
      <div className="metrics-fs">
        {[
          { icon: "⌁", val: "12", label: "Missions Integrated" },
          { icon: "▣", val: "47M+", label: "Hectares Analyzed" },
          { icon: "↗", val: "3-Year", label: "Yield Forecasts" },
          { icon: "✓", val: "98.7%", label: "Model Accuracy" },
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
            Adaptation workflow
          </span>
          <h2 className="lx">Precision Modeling in 3 Steps</h2>
        </header>

        <div className="steps-fs">
          {[
            {
              icon: "⌖",
              title: "Select Your Field",
              desc: "Draw or search for your agricultural parcel on the interactive 3D satellite model.",
            },
            {
              icon: "☁",
              title: "Fuse NASA Data",
              desc: "Our cloud pipeline pulls SMAP, Landsat, OpenET & ECOSTRESS records automatically.",
            },
            {
              icon: "✺",
              title: "Plan & Adapt",
              desc: "Simulate crop rotations and receive real-time, climate-adaptive recommendations.",
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
        <h2 className="lx">Ready to Shift?</h2>
        <p>
          Join thousands of modern producers using actual NASA Earth observation intelligence to
          secure their yield against weather volatility.
        </p>
        <Link to="/globe" className="btn-fs fill">
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer-fs">
        <div className="fg-fs">
          <div>
            <b className="lx" style={{ fontSize: "20px" }}>
              FIELD <i style={{ color: "var(--cy)", fontStyle: "normal" }}>SHIFT</i>
            </b>
            <p style={{ margin: "16px 0" }}>
              Leveraging global remote sensing records to secure regional food stability and model
              climate adaptive agriculture systems.
            </p>
            <span className="tag-fs mono" style={{ color: "var(--cy)" }}>
              BUILT FOR NASA SPACE APPS 2026
            </span>
          </div>

          {[
            {
              head: "Product",
              links: [
                { label: "Globe Viewer", href: "/globe" },
                { label: "Field Map", href: "/field" },
                { label: "Rotations", href: "/planner" },
                { label: "Analytics", href: "/analytics" },
              ],
            },
            {
              head: "Data Sources",
              links: [
                { label: "NASA Offline Repository (7)", href: "/datasets" },
                { label: "SMAP Soil Moisture", href: "/globe" },
                { label: "Landsat Imagery", href: "/globe" },
                { label: "OpenET Database", href: "/field" },
                { label: "ECOSTRESS Logs", href: "/field" },
              ],
            },
            {
              head: "Resources",
              links: [
                { label: "Developer API", href: "#" },
                { label: "Whitepaper", href: "#" },
                { label: "Docs", href: "#" },
                { label: "Community", href: "#" },
              ],
            },
            {
              head: "Company",
              links: [
                { label: "About Us", href: "#" },
                { label: "Contributors", href: "#" },
                { label: "Space Apps", href: "https://www.spaceappschallenge.org/" },
                { label: "Contact", href: "#" },
              ],
            },
          ].map((col) => (
            <div key={col.head}>
              <h4 className="lx">{col.head}</h4>
              {col.links.map((link) => (
                <Link key={link.label} to={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="fb-fs">
          <span>© 2026 Field Shift. NASA Space Apps Challenge Project.</span>
          <span>Privacy &nbsp; Terms &nbsp; Telemetry License</span>
        </div>
      </footer>
    </div>
  );
}
