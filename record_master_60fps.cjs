const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { chromium } = require("/home/sadik/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cubic ease-in-out curve
function easeInOut(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Butter-smooth mouse glide with subtle arc
async function smoothGlide(page, startX, startY, endX, endY, durationMs = 800) {
  const steps = Math.max(Math.round(durationMs / 16), 25);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const eased = easeInOut(t);
    const arc = Math.sin(t * Math.PI) * 12;
    const x = startX + (endX - startX) * eased;
    const y = startY + (endY - startY) * eased - arc;
    await page.mouse.move(x, y);
    await sleep(durationMs / steps);
  }
}

// Smooth continuous drag for 3D Earth Globe / 3D Surfaces
async function continuousDrag(page, startX, startY, deltaX, deltaY, durationMs = 1800) {
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
  await sleep(60);
  await page.mouse.up();
  await sleep(80);
}

// Smooth scroll for window
async function smoothScrollWindow(page, targetY, durationMs = 1200) {
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

// Smooth scroll for dashboard <main> container
async function smoothScrollMain(page, targetY, durationMs = 1200) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    const main = document.querySelector("main");
    if (!main) return;
    return new Promise((resolve) => {
      const startY = main.scrollTop;
      const diff = targetY - startY;
      const startTime = performance.now();

      function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(now) {
        const elapsed = now - startTime;
        const p = Math.min(elapsed / durationMs, 1);
        main.scrollTop = startY + diff * ease(p);
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
      background: radial-gradient(circle, rgba(0, 229, 255, 0.95) 0%, rgba(0, 229, 255, 0.35) 65%, transparent 100%);
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
      cursor.style.background = "radial-gradient(circle, rgba(0, 229, 255, 0.95) 0%, rgba(0, 229, 255, 0.35) 65%, transparent 100%)";
    });
  });
}

(async () => {
  const recordDir = path.resolve("./recordings");
  if (!fs.existsSync(recordDir)) {
    fs.mkdirSync(recordDir, { recursive: true });
  }

  console.log("🎬 Starting AgriShift 60-FPS Ultra-Smooth Broadcast Recording (All Features)...");
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

  let curX = 960;
  let curY = 540;

  async function moveTo(x, y, ms = 700) {
    await smoothGlide(page, curX, curY, x, y, ms);
    curX = x;
    curY = y;
  }

  async function clickElement(loc, ms = 700) {
    if (await loc.count() > 0) {
      const b = await loc.boundingBox();
      if (b) {
        await moveTo(b.x + b.width / 2, b.y + b.height / 2, ms);
        await loc.click();
        await sleep(400);
      }
    }
  }

  try {
    // ==========================================
    // SEGMENT 1: Landing Page Hero & Core Vision (0:00 - 0:18)
    // ==========================================
    console.log("📍 [Segment 1] Landing Page Hero & Core Problem Statement");
    await page.goto("https://agri-shift.vercel.app/", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await injectVirtualCursor(page);

    // Initial position on AGRI SHIFT brand logo
    await moveTo(150, 48, 800);
    await sleep(1000);

    // Glide smoothly over the headline & stats
    await moveTo(960, 360, 1400);
    await sleep(1200);

    // Sweep across the telemetry stat ticker
    await moveTo(480, 510, 1100);
    await sleep(900);
    await moveTo(1250, 510, 1300);
    await sleep(1000);

    // Smooth continuous glide down the hero
    await smoothScrollWindow(page, 580, 1600);
    await sleep(1200);

    // ==========================================
    // SEGMENT 2: Climate Disaster & Cost Resilience Engine (0:18 - 0:40)
    // ==========================================
    console.log("📍 [Segment 2] Climate Disaster & Low-Cost Crop Engine");
    await smoothScrollWindow(page, 980, 1300);
    await sleep(1000);

    // Click Flash Flood Tab
    const floodTab = page.locator("button:has-text('Haor Flash Floods'), button:has-text('Flash Flood')").first();
    await clickElement(floodTab, 800);
    await sleep(1800);

    // Switch to Drought Tab
    const droughtTab = page.locator("button:has-text('Drought & Aquifer Depletion'), button:has-text('Drought')").first();
    await clickElement(droughtTab, 800);
    await sleep(1800);

    // Adjust land size slider smoothly to show live cost savings
    const slider = page.locator("input[type='range']").first();
    if (await slider.count() > 0) {
      const box = await slider.boundingBox();
      if (box) {
        await moveTo(box.x + box.width * 0.25, box.y + box.height / 2, 700);
        await continuousDrag(page, box.x + box.width * 0.25, box.y + box.height / 2, box.width * 0.52, 0, 1300);
        await sleep(1000);
        await continuousDrag(page, curX, curY, -box.width * 0.3, 0, 1100);
        await sleep(1000);
      }
    }

    // Toggle language button (বাংলা <-> EN)
    const langBtn = page.locator("button:has-text('বাংলা'), button:has-text('English')").first();
    if (await langBtn.count() > 0) {
      await clickElement(langBtn, 700);
      await sleep(1500);
      await clickElement(langBtn, 700);
      await sleep(1000);
    }

    // ==========================================
    // SEGMENT 3: 3D Mission Control & Orbital Telemetry (0:40 - 1:08)
    // ==========================================
    console.log("📍 [Segment 3] 3D Mission Control & 3D Earth Globe");
    const launchBtn = page.locator("a:has-text('Launch Mission Console'), a:has-text('LAUNCH APP'), a[href='/dashboard']").first();
    if (await launchBtn.count() > 0) {
      await clickElement(launchBtn, 800);
    } else {
      await page.goto("https://agri-shift.vercel.app/dashboard", { waitUntil: "domcontentloaded" });
    }
    await page.waitForLoadState("domcontentloaded");
    await sleep(2500);
    await injectVirtualCursor(page);

    // Orbit 3D Earth Globe smoothly
    const globeCanvas = page.locator("canvas").first();
    if (await globeCanvas.count() > 0) {
      const b = await globeCanvas.boundingBox();
      if (b) {
        console.log("  🌍 Orbiting 3D Earth Globe with NASA orbits...");
        await moveTo(b.x + b.width * 0.65, b.y + b.height * 0.5, 800);
        // Slow continuous drag left
        await continuousDrag(page, b.x + b.width * 0.65, b.y + b.height * 0.5, -b.width * 0.38, -b.height * 0.05, 2400);
        await sleep(700);
        // Slow drag back
        await continuousDrag(page, curX, curY, b.width * 0.22, b.height * 0.08, 1800);
        await sleep(1000);
      }
    }

    // Module 02: Field 3D Terrain
    console.log("  🌾 Navigating to Module 02: Field 3D Terrain...");
    // Click sidebar item 02
    const navMod2 = page.locator("button:has-text('02 · Field 3D Terrain'), button:has-text('০২ · ফিল্ড')").first();
    if (await navMod2.count() > 0) {
      await clickElement(navMod2, 600);
    } else {
      await smoothScrollMain(page, 750, 1200);
    }
    await sleep(2000);

    // Toggle between Root moisture and Canopy height
    const canopyBtn = page.locator("button:has-text('Canopy height'), button:has-text('ক্যানোপির উচ্চতা')").first();
    if (await canopyBtn.count() > 0) {
      await clickElement(canopyBtn, 700);
      await sleep(1800);
    }
    const moistureBtn = page.locator("button:has-text('Root moisture'), button:has-text('মূল আর্দ্রতা')").first();
    if (await moistureBtn.count() > 0) {
      await clickElement(moistureBtn, 700);
      await sleep(1800);
    }

    // ==========================================
    // SEGMENT 4: 3-Year Adaptive Rotation & 3D Root Simulation (1:08 - 1:35)
    // ==========================================
    console.log("📍 [Segment 4] Module 03: 3-Year Crop Rotation & 3D Root Stratigraphy");
    const navMod3 = page.locator("button:has-text('03 · Rotation'), button:has-text('০৩ · রোটেশন')").first();
    if (await navMod3.count() > 0) {
      await clickElement(navMod3, 600);
    } else {
      await smoothScrollMain(page, 1450, 1200);
    }
    await sleep(1800);

    // Click Year 2 (Mungbean / N-Fixing)
    const y2Btn = page.locator("div:has-text('Year 2'), div:has-text('২য় বছর')").first();
    if (await y2Btn.count() > 0) {
      await clickElement(y2Btn, 700);
      await sleep(1400);
    }

    // Click PLAY CYCLE button on 3D Soil Profile
    const playBtn = page.locator("button:has-text('PLAY CYCLE'), button:has-text('বৃদ্ধি অ্যানিমেশন')").first();
    if (await playBtn.count() > 0) {
      await clickElement(playBtn, 700);
      console.log("  🌱 Simulating subsoil root growth across stratigraphy layers...");
      // Watch root growth animation dynamically
      await sleep(7500);
    }

    // Highlight +38% Water Saved badge
    const badgeLoc = page.locator("span:has-text('WATER SAVED'), span:has-text('পানি সাশ্রয়')").first();
    if (await badgeLoc.count() > 0) {
      const b = await badgeLoc.boundingBox();
      if (b) {
        await moveTo(b.x + b.width / 2, b.y + b.height / 2, 700);
        await sleep(1000);
      }
    }

    // ==========================================
    // SEGMENT 5: Financial Volatility & 3D Profit Surface (1:35 - 1:56)
    // ==========================================
    console.log("📍 [Segment 5] Module 05: Risk & 3D Profit Landscape");
    const navMod5 = page.locator("button:has-text('05 · Risk & Profit'), button:has-text('০৫ · ঝুঁকি')").first();
    if (await navMod5.count() > 0) {
      await clickElement(navMod5, 600);
    } else {
      await smoothScrollMain(page, 2800, 1200);
    }
    await sleep(2000);

    // Rotate 3D Profit surface smoothly
    const allCanvases = await page.$$("canvas");
    if (allCanvases.length > 0) {
      const pCanvas = allCanvases[allCanvases.length - 1];
      const box = await pCanvas.boundingBox();
      if (box) {
        console.log("  📈 Rotating 3D Monte Carlo Profit Surface...");
        await moveTo(box.x + box.width * 0.45, box.y + box.height * 0.55, 700);
        await continuousDrag(page, box.x + box.width * 0.45, box.y + box.height * 0.55, box.width * 0.28, -box.height * 0.18, 2200);
        await sleep(1000);
      }
    }

    // Move Fertilizer Global Price Index slider
    const costSliders = await page.$$("input[type='range']");
    if (costSliders.length > 0) {
      const cSlider = costSliders[costSliders.length - 1];
      const box = await cSlider.boundingBox();
      if (box) {
        await moveTo(box.x + box.width * 0.3, box.y + box.height / 2, 600);
        await continuousDrag(page, box.x + box.width * 0.3, box.y + box.height / 2, box.width * 0.45, 0, 1400);
        await sleep(1200);
      }
    }

    // Quick peek at Module 06 (Regional Network)
    const navMod6 = page.locator("button:has-text('06 · Regional'), button:has-text('০৬ · আঞ্চলিক')").first();
    if (await navMod6.count() > 0) {
      await clickElement(navMod6, 600);
      await sleep(1600);
    }

    // ==========================================
    // SEGMENT 6: Offline Embedded NASA Datasets (1:56 - 2:16)
    // ==========================================
    console.log("📍 [Segment 6] Offline NASA Datasets Archive (/datasets)");
    await page.goto("https://agri-shift.vercel.app/datasets", { waitUntil: "domcontentloaded" });
    await sleep(2200);
    await injectVirtualCursor(page);

    // Hover categories smoothly
    const catSoil = page.locator("button:has-text('Soil Moisture'), button:has-text('মাটির আর্দ্রতা')").first();
    if (await catSoil.count() > 0) {
      await clickElement(catSoil, 700);
      await sleep(1200);
    }

    const catCanopy = page.locator("button:has-text('Canopy & NDVI'), button:has-text('গাছের আচ্ছাদন')").first();
    if (await catCanopy.count() > 0) {
      await clickElement(catCanopy, 700);
      await sleep(1200);
    }

    const catAll = page.locator("button:has-text('ALL'), button:has-text('সকল উপাত্ত')").first();
    if (await catAll.count() > 0) {
      await clickElement(catAll, 600);
      await sleep(1000);
    }

    // Scroll to SMAP L4 card & hover export buttons
    await smoothScrollWindow(page, 450, 1100);
    await sleep(1000);

    const geoJsonBtn = page.locator("button:has-text('GeoJSON')").first();
    if (await geoJsonBtn.count() > 0) {
      const b = await geoJsonBtn.boundingBox();
      if (b) {
        await moveTo(b.x + b.width / 2, b.y + b.height / 2, 700);
        await sleep(800);
      }
    }

    const csvBtn = page.locator("button:has-text('CSV')").first();
    if (await csvBtn.count() > 0) {
      const b = await csvBtn.boundingBox();
      if (b) {
        await moveTo(b.x + b.width / 2, b.y + b.height / 2, 700);
        await sleep(800);
      }
    }

    // ==========================================
    // SEGMENT 7: 104-Hex Heatmap & Outro (2:16 - 2:38)
    // ==========================================
    console.log("📍 [Segment 7] 104-Hex Climate Heatmap & Outro (/heatmap)");
    await page.goto("https://agri-shift.vercel.app/heatmap", { waitUntil: "domcontentloaded" });
    await sleep(2200);
    await injectVirtualCursor(page);

    // Switch between climate variables smoothly
    const vegBtn = page.locator("button:has-text('Vegetation (NDVI)'), button:has-text('উদ্ভিদ সূচক')").first();
    if (await vegBtn.count() > 0) {
      await clickElement(vegBtn, 700);
      await sleep(1400);
    }

    const lstBtn = page.locator("button:has-text('Surface temperature'), button:has-text('ভূপৃষ্ঠের তাপমাত্রা')").first();
    if (await lstBtn.count() > 0) {
      await clickElement(lstBtn, 700);
      await sleep(1400);
    }

    const airBtn = page.locator("button:has-text('Air temperature'), button:has-text('বায়ুর তাপমাত্রা')").first();
    if (await airBtn.count() > 0) {
      await clickElement(airBtn, 700);
      await sleep(1400);
    }

    // Smooth hover across the Bangladesh hex grid map
    await moveTo(960, 520, 1000);
    await sleep(1200);

    // Outro: Glide back to AGRI SHIFT brand logo in top bar
    await smoothScrollWindow(page, 0, 900);
    const brand = page.locator("a:has-text('AGRI SHIFT'), a:has-text('এগ্রি শিফট')").first();
    if (await brand.count() > 0) {
      const b = await brand.boundingBox();
      if (b) {
        await moveTo(b.x + b.width / 2, b.y + b.height / 2, 800);
      }
    }
    await sleep(2500);

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✨ Recording captured successfully in ${elapsedTotal}s (~2.3 minutes)!`);
  } catch (err) {
    console.error("❌ Recording error:", err);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (videoObj) {
      const rawVideoPath = await videoObj.path();
      console.log(`Processing captured video (${rawVideoPath}) into silky-smooth 60 FPS CFR formats...`);

      const mp4Output = path.resolve("./recordings/agrishift_all_features_60fps.mp4");
      const webmOutput = path.resolve("./recordings/agrishift_all_features_60fps.webm");
      const artifactDir = "/home/sadik/.gemini/antigravity-ide/brain/d8df095f-e050-4b80-8e8e-a875b72e8144";
      const ffmpegBin = "/home/sadik/.local/bin/ffmpeg";

      // 1. High Profile 60 FPS CFR MP4 with faststart (Universal, Butter-Smooth)
      console.log("🎞️ Generating 60 FPS Constant Frame Rate MP4...");
      execSync(`${ffmpegBin} -y -i "${rawVideoPath}" -filter:v "fps=60" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart "${mp4Output}"`, { stdio: "inherit" });

      // 2. High Quality 60 FPS WebM with proper cues & duration
      console.log("🎞️ Generating indexed 60 FPS WebM...");
      execSync(`${ffmpegBin} -y -i "${rawVideoPath}" -filter:v "fps=60" -c:v libvpx -b:v 4M -crf 10 -quality realtime -speed 4 "${webmOutput}"`, { stdio: "inherit" });

      // Copy to artifact directory for instant viewing
      if (fs.existsSync(artifactDir)) {
        fs.copyFileSync(mp4Output, path.join(artifactDir, "agrishift_all_features_60fps.mp4"));
        fs.copyFileSync(webmOutput, path.join(artifactDir, "agrishift_all_features_60fps.webm"));
      }

      console.log(`✅ Ultra-smooth 60 FPS MP4 saved to: ${mp4Output} (${(fs.statSync(mp4Output).size / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`✅ Ultra-smooth 60 FPS WebM saved to: ${webmOutput} (${(fs.statSync(webmOutput).size / 1024 / 1024).toFixed(2)} MB)`);
    }
  }
})();
