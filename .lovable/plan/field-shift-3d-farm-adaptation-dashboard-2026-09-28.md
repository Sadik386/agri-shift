# Field Shift — 3D Farm Adaptation Dashboard

A dark, mission-control style web dashboard for the "Field Shift: Adapting Farms with NASA Data" challenge, focused on a Bangladesh farm field. All five modules from your specification, with real 3D visuals in the browser instead of Streamlit.

## What you get

A single-page dashboard with a fixed left rail (field selector, season, crop) and five stacked sections:

1. **Data Fusion & Satellite Telemetry** — live-style status badges (NDVI, evapotranspiration, soil moisture, land surface temperature, soil texture/pH), plus a spinning 3D Earth globe with satellite tracks (SMAP, Landsat 8/9, NISAR) arcing over the Bangladesh field marker.
2. **Field & Terrain View** — the field boundary extruded in 3D over terrain, with colored columns showing root-zone moisture and canopy height across the plot.
3. **Crop Rotation Planner** — pick a 3-year sequence (e.g. Maize → Legume cover → Sorghum) and see water savings and soil carbon gain, next to an animated 3D soil profile (clay/sand/loam layers) with root depth growing and the crop advancing through its growth stages.
4. **Smart Advisory & Alerts** — irrigation schedule, nitrogen deficit warnings, and heat/disease anomaly alerts derived from the current readings.
5. **Profit & Risk Calculator** — cost sliders (seed, fertilizer, fuel, irrigation) with legume nitrogen credit, and an interactive 3D profit surface (profit in BDT vs rainfall deficit % vs fertilizer price) plus 10th–90th percentile bands.

## Data approach

Both, as you asked:
- Ships with realistic built-in Bangladesh sample data so every screen works instantly, with no keys and no waiting.
- Where a free, key-free source exists (SoilGrids soil texture/pH, open rainfall/weather forecast), the app fetches the real values for the selected field and falls back to the sample values if the service is slow or unavailable. Each panel shows whether it is showing live or sample data.
- NASA products that need accounts/tokens (SMAP, Landsat, OpenET, ECOSTRESS) stay on realistic modeled values in this build; we can wire real credentials later.

## Look

Dark mission-control console: near-black background, glass panels with soft blur, thin data-grid lines, cyan/amber telemetry accents, mono numerals for readings, restrained motion (values ticking, sweep lines, arcs tracing).

## Technical notes

- 3D globe, field extrusion, soil profile: React Three Fiber + drei (`three`), each on a client-only surface so nothing renders on the server. Satellite arcs are procedural orbits; the globe uses a generated Earth texture and lightformer-based lighting (no CDN HDR presets).
- 3D profit surface: a React Three Fiber mesh built from the Monte-Carlo-style profit grid, with orbit controls and hover readout — no Plotly dependency.
- Agronomy/finance math (water budget, soil carbon, profit grid, percentile bounds) lives in pure TypeScript modules under `src/lib/fieldshift/`, separate from presentation, so numbers are testable.
- Free external reads (SoilGrids, weather) go through TanStack server functions with caching and a typed fallback to sample data; no secrets required.
- Everything renders on `/`, with each module as its own component under `src/components/fieldshift/`.
- Per-route head metadata (title, description, og/twitter) set for the dashboard page.
- Performance kept to a mobile-web budget: capped pixel ratio, low-poly geometry, one post pass at most.

## Out of scope for this build

Accounts, saved farms, or a database (no backend data storage), and real NASA credentialed feeds. Both can be added later.
