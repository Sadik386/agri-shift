const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { chromium } = require("/home/sadik/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cubic ease-in-out
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Butter-smooth Bézier / eased mouse path with micro-ticks
async function smoothGlide(page, startX, startY, endX, endY, durationMs = 800) {
  const steps = Math.max(Math.round(durationMs / 16), 20);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = easeInOut(t);
    // Subtle natural arc
    const arc = Math.sin(t * Math.PI) * 15;
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased - arc;
    await page.mouse.move(x, y);
    await sleep(durationMs / steps);
  }
}

// Butter-smooth 60fps RequestAnimationFrame Scroll
async function smoothScrollRaf(page, targetY, durationMs = 1500) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    return new Promise((resolve) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(now) {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / durationMs, 1);
        window.scrollTo(0, startY + diff * ease(p));
        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await sleep(100);
}

// Smooth continuous drag for 3D Earth Globe / 3D Surfaces
async function continuousDrag(page, startX, startY, deltaX, deltaY, durationMs = 2000) {
  await page.mouse.move(startX, startY);
  await sleep(60);
  await page.mouse.down();
  await sleep(60);

  const steps = Math.max(Math.round(durationMs / 16), 30);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = startX + deltaX * t;
    const y = startY + deltaY * t;
    await page.mouse.move(x, y);
    await sleep(durationMs / steps);
  }
  await sleep(80);
  await page.mouse.up();
  await sleep(100);
}

// Inject high-visibility glowing virtual cursor
async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("virtual-cursor")) return;

    const cursor = document.createElement("div");
    cursor.id = "virtual-cursor";
    cursor.style.cssText = `
      position: fixed;
      top: -100px;
      left: -100px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 229, 255, 0.95) 0%, rgba(0, 229, 255, 0.4) 65%, transparent 100%);
      border: 2px solid #00e5ff;
      box-shadow: 0 0 14px #00e5ff, 0 0 28px rgba(0, 229, 255, 0.6);
      pointer-events: none;
      z-index: 99999999;
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease-out;
    `;
    document.body.appendChild(cursor);

    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    window.addEventListener("mousedown", (e) => {
      cursor.style.transform = "translate(-50%, -50%) scale(0.7)";
      cursor.style.background = "#ffb300";

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid #00e5ff;
        transform: translate(-50%, -50%) scale(1);
        pointer-events: none;
        z-index: 99999998;
        opacity: 1;
        transition: transform 0.45s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.45s ease-out;
      `;
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(5.5)";
        ripple.style.opacity = "0";
      });
      setTimeout(() => ripple.remove(), 480);
    });

    window.addEventListener("mouseup", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.background = "radial-gradient(circle, rgba(0, 229, 255, 0.95) 0%, rgba(0, 229, 255, 0.4) 65%, transparent 100%)";
    });
  });
}

(async () => {
  const recordDir = path.resolve("./recordings");
  if (!fs.existsSync(recordDir)) {
    fs.mkdirSync(recordDir, { recursive: true });
  }

  console.log("🎬 Starting AgriShift 60-FPS Ultra-Smooth Broadcast Recording (2:00)...");
  const startTime = Date.now();

  const browser = await chromium.launch({
    executablePath: "/snap/bin/chromium",
    args: [
      "--no-sandbox",
      "--ignore-gpu-blocklist",
      "--enable-gpu-rasterization",
      "--enable-zero-copy",
      "--enable-features=VaapiVideoDecoder,OverlayScrollbar",
      "--enable-smooth-scrolling",
      "--window-size=1920,1080",
      "--start-maximized"
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: recordDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  try {
    // ==========================================
    // SEGMENT 1: Landing Page Hero & Core Vision (0:00 - 0:15 = 15s)
    // ==========================================
    console.log("📍 [0:00 - 0:15] Segment 1: Landing Page & Hero");
    await page.goto("https://agri-shift.vercel.app/", { waitUntil: "domcontentloaded" });
    await injectVirtualCursor(page);

    // Initial position on AGRI SHIFT brand
    await page.mouse.move(140, 45);
    await sleep(800);

    // Glide smoothly over the headline & stats
    await smoothGlide(page, 140, 45, 960, 380, 1500);
    await sleep(1200);

    // Sweep across the telemetry stat badges
    await smoothGlide(page, 960, 380, 450, 520, 1200);
    await sleep(1000);
    await smoothGlide(page, 450, 520, 1150, 520, 1500);
    await sleep(1200);

    // Smooth continuous glide down the hero
    await smoothScrollRaf(page, 620, 1800);
    await sleep(1500);

    // ==========================================
    // SEGMENT 2: Disaster Resilience & Cost Engine (0:15 - 0:32 = 17s)
    // ==========================================
    console.log("📍 [0:15 - 0:32] Segment 2: Climate Disaster & Cost Engine");
    await smoothScrollRaf(page, 1020, 1400);
    await sleep(800);

    // Glide to Flash Flood Tab & Click
    const floodTab = page.locator("button:has-text('Haor Flash Floods'), button:has-text('Flash Flood')").first();
    if (await floodTab.count() > 0) {
      const b = await floodTab.boundingBox();
      if (b) {
        await smoothGlide(page, 1150, 520, b.x + b.width / 2, b.y + b.height / 2, 900);
        await floodTab.click();
        await sleep(1800);
      }
    }

    // Glide to Drought Tab & Click
    const droughtTab = page.locator("button:has-text('Drought & Aquifer Depletion'), button:has-text('Drought')").first();
    if (await droughtTab.count() > 0) {
      const b = await droughtTab.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 800);
        await droughtTab.click();
        await sleep(1800);
      }
    }

    // Move to Land Size Slider & Drag smoothly
    const slider = page.locator("input[type='range']").first();
    if (await slider.count() > 0) {
      const box = await slider.boundingBox();
      if (box) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, box.x + box.width * 0.25, box.y + box.height / 2, 700);
        await continuousDrag(page, box.x + box.width * 0.25, box.y + box.height / 2, box.width * 0.5, 0, 1200);
        await sleep(1000);
        await continuousDrag(page, box.x + box.width * 0.75, box.y + box.height / 2, -box.width * 0.35, 0, 1000);
        await sleep(1000);
      }
    }

    // Language toggle test
    const langBtn = page.locator("button:has-text('বাংলা'), button:has-text('English')").first();
    if (await langBtn.count() > 0) {
      const b = await langBtn.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 700);
        await langBtn.click();
        await sleep(1400);
        await langBtn.click();
        await sleep(1000);
      }
    }

    // ==========================================
    // SEGMENT 3: 3D Mission Control & Telemetry (0:32 - 0:58 = 26s)
    // ==========================================
    console.log("📍 [0:32 - 0:58] Segment 3: 3D Mission Control & 3D Globe");
    const launchBtn = page.locator("a:has-text('Launch Mission Control'), a:has-text('LAUNCH APP')").first();
    if (await launchBtn.count() > 0) {
      const b = await launchBtn.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 800);
        await launchBtn.click();
      }
    } else {
      await page.goto("https://agri-shift.vercel.app/dashboard", { waitUntil: "domcontentloaded" });
    }
    await page.waitForLoadState("domcontentloaded");
    await sleep(2200);
    await injectVirtualCursor(page);

    // Orbit 3D Earth Globe continuously & smoothly
    const globeCanvas = page.locator("canvas").first();
    if (await globeCanvas.count() > 0) {
      const b = await globeCanvas.boundingBox();
      if (b) {
        console.log("  🌍 Orbiting 3D Earth Globe smoothly...");
        await smoothGlide(page, 960, 450, b.x + b.width * 0.65, b.y + b.height * 0.5, 800);
        // Continuous slow orbit drag 1
        await continuousDrag(page, b.x + b.width * 0.65, b.y + b.height * 0.5, -b.width * 0.35, -b.height * 0.05, 2200);
        await sleep(600);
        // Continuous slow orbit drag 2
        await continuousDrag(page, b.x + b.width * 0.35, b.y + b.height * 0.45, b.width * 0.25, b.height * 0.08, 1800);
        await sleep(1000);
      }
    }

    // Scroll smoothly to Module 02 (3D Field Terrain)
    console.log("  🌾 Showing 3D Field Terrain...");
    const terrainLoc = page.locator("#terrain, div:has-text('02 · Field 3D Terrain')").first();
    if (await terrainLoc.count() > 0) {
      const b = await terrainLoc.boundingBox();
      if (b) {
        const curY = await page.evaluate(() => window.scrollY);
        await smoothScrollRaf(page, curY + b.y - 85, 1400);
      }
    } else {
      await smoothScrollRaf(page, 950, 1400);
    }
    await sleep(2400);

    // ==========================================
    // SEGMENT 4: 3-Year Adaptive Rotation & 3D Root Simulation (0:58 - 1:18 = 20s)
    // ==========================================
    console.log("📍 [0:58 - 1:18] Segment 4: 3-Year Crop Rotation & 3D Root Simulation");
    const rotationLoc = page.locator("#rotation, div:has-text('03 · Rotation & Soil 3D')").first();
    if (await rotationLoc.count() > 0) {
      const b = await rotationLoc.boundingBox();
      if (b) {
        const curY = await page.evaluate(() => window.scrollY);
        await smoothScrollRaf(page, curY + b.y - 80, 1400);
      }
    } else {
      await smoothScrollRaf(page, 1750, 1400);
    }
    await sleep(1400);

    // Click Year 2 (Mungbean)
    const y2Btn = page.locator("button:has-text('Year 2'), button:has-text('Mungbean')").first();
    if (await y2Btn.count() > 0) {
      const b = await y2Btn.boundingBox();
      if (b) {
        await smoothGlide(page, 960, 450, b.x + b.width / 2, b.y + b.height / 2, 700);
        await y2Btn.click();
        await sleep(1200);
      }
    }

    // Click PLAY CYCLE button
    const playBtn = page.locator("button:has-text('PLAY CYCLE')").first();
    if (await playBtn.count() > 0) {
      const b = await playBtn.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 700);
        await playBtn.click();
        console.log("  🌱 Simulating subsoil root growth through stratigraphy...");
        // Glide mouse slowly across soil horizons while root animates
        await smoothGlide(page, b.x + b.width / 2, b.y + 120, b.x + b.width / 2, b.y + 350, 4500);
        await sleep(1500);
      }
    }

    // ==========================================
    // SEGMENT 5: Financial Volatility & 3D Profit Surface (1:18 - 1:33 = 15s)
    // ==========================================
    console.log("📍 [1:18 - 1:33] Segment 5: Risk & 3D Profit Landscape");
    const profitLoc = page.locator("#profit, div:has-text('05 · Risk & Profit 3D')").first();
    if (await profitLoc.count() > 0) {
      const b = await profitLoc.boundingBox();
      if (b) {
        const curY = await page.evaluate(() => window.scrollY);
        await smoothScrollRaf(page, curY + b.y - 80, 1400);
      }
    } else {
      await smoothScrollRaf(page, 2600, 1400);
    }
    await sleep(1200);

    // Rotate 3D Profit surface smoothly
    const allCanvases = await page.$$("canvas");
    if (allCanvases.length > 1) {
      const pCanvas = allCanvases[allCanvases.length - 1];
      const box = await pCanvas.boundingBox();
      if (box) {
        console.log("  📈 Rotating 3D Monte Carlo Profit Surface...");
        await smoothGlide(page, 960, 500, box.x + box.width * 0.45, box.y + box.height * 0.55, 700);
        await continuousDrag(page, box.x + box.width * 0.45, box.y + box.height * 0.55, box.width * 0.28, -box.height * 0.18, 2000);
        await sleep(800);
      }
    }

    // Adjust price index slider
    const costSliders = await page.$$("input[type='range']");
    if (costSliders.length > 0) {
      const cSlider = costSliders[costSliders.length - 1];
      const box = await cSlider.boundingBox();
      if (box) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, box.x + box.width * 0.3, box.y + box.height / 2, 600);
        await continuousDrag(page, box.x + box.width * 0.3, box.y + box.height / 2, box.width * 0.4, 0, 1200);
        await sleep(1000);
      }
    }

    // ==========================================
    // SEGMENT 6: Offline Embedded NASA Datasets (1:33 - 1:46 = 13s)
    // ==========================================
    console.log("📍 [1:33 - 1:46] Segment 6: Offline NASA Datasets Archive");
    await page.goto("https://agri-shift.vercel.app/datasets", { waitUntil: "domcontentloaded" });
    await injectVirtualCursor(page);
    await sleep(1200);

    // Hover categories smoothly
    const categories = await page.$$("button:has-text('Soil Moisture'), button:has-text('Canopy & NDVI')");
    for (const cat of categories) {
      const b = await cat.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 700);
        await sleep(600);
      }
    }

    // Scroll to SMAP L4 card
    await smoothScrollRaf(page, 420, 1100);
    await sleep(800);

    // Hover export buttons
    const exportBtns = await page.$$("button:has-text('GeoJSON'), button:has-text('CSV')");
    for (const btn of exportBtns.slice(0, 2)) {
      const b = await btn.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 600);
        await sleep(700);
      }
    }

    // ==========================================
    // SEGMENT 7: 104-Hex Heatmap & Outro (1:46 - 2:00 = 14s)
    // ==========================================
    console.log("📍 [1:46 - 2:00] Segment 7: 104-Hex Climate Heatmap & Outro");
    await page.goto("https://agri-shift.vercel.app/heatmap", { waitUntil: "domcontentloaded" });
    await injectVirtualCursor(page);
    await sleep(1200);

    // Switch between climate variables
    const varBtns = await page.$$("button:has-text('Vegetation'), button:has-text('Surface temperature'), button:has-text('Air temperature')");
    for (const vBtn of varBtns.slice(0, 2)) {
      const b = await vBtn.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 600);
        await vBtn.click();
        await sleep(1200);
      }
    }

    // Outro: Glide back to AGRI SHIFT brand logo in top bar
    await smoothScrollRaf(page, 0, 900);
    const brand = await page.$(".brand-fs, a[href='/']");
    if (brand) {
      const b = await brand.boundingBox();
      if (b) {
        await smoothGlide(page, page.mouse._x || 500, page.mouse._y || 400, b.x + b.width / 2, b.y + b.height / 2, 700);
      }
    }
    await sleep(2200);

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✨ Recording finished in ${elapsedTotal}s (~2 minutes)!`);
  } catch (err) {
    console.error("❌ Recording error:", err);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (videoObj) {
      const rawVideoPath = await videoObj.path();
      console.log("Processing captured video into silky-smooth 60 FPS CFR formats...");

      const mp4Output = path.resolve("./recordings/agrishift_all_features_2min_demo.mp4");
      const webmOutput = path.resolve("./recordings/agrishift_all_features_2min_demo.webm");
      const artifactDir = "/home/sadik/.gemini/antigravity-ide/brain/97ae6219-8722-41d1-afd2-23f2de2d0ff2";

      const ffmpegBin = "/home/sadik/.local/bin/ffmpeg";

      // 1. High Profile 60 FPS CFR MP4 with faststart (Universal, Butter-Smooth)
      console.log("🎞️ Generating 60 FPS Constant Frame Rate MP4...");
      execSync(`${ffmpegBin} -y -i "${rawVideoPath}" -filter:v "fps=60" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart "${mp4Output}"`, { stdio: "inherit" });

      // 2. High Quality 60 FPS WebM with proper cues & duration
      console.log("🎞️ Generating indexed 60 FPS WebM...");
      execSync(`${ffmpegBin} -y -i "${rawVideoPath}" -filter:v "fps=60" -c:v libvpx -b:v 3.5M -crf 10 -quality realtime -speed 4 "${webmOutput}"`, { stdio: "inherit" });

      // Copy to artifact directory for instant viewing
      fs.copyFileSync(mp4Output, path.join(artifactDir, "agrishift_all_features_2min_demo.mp4"));
      fs.copyFileSync(webmOutput, path.join(artifactDir, "agrishift_all_features_2min_demo.webm"));

      console.log(`✅ Ultra-smooth 60 FPS MP4 saved to: ${mp4Output} (${(fs.statSync(mp4Output).size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`✅ Ultra-smooth 60 FPS WebM saved to: ${webmOutput} (${(fs.statSync(webmOutput).size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }
})();
