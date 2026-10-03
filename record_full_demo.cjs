const fs = require("fs");
const path = require("path");
const { chromium } = require("/home/sadik/.npm/_npx/9833c18b2d85bc59/node_modules/playwright-core");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-browser 60 FPS RequestAnimationFrame Smooth Scroll by absolute Y
async function smoothScrollRaf(page, targetY, durationMs = 1500) {
  await page.evaluate(async ({ targetY, durationMs }) => {
    return new Promise((resolve) => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const startTime = performance.now();

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + diff * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }, { targetY, durationMs });
  await sleep(150);
}

// In-browser 60 FPS Smooth Scroll to Playwright locator
async function smoothScrollToLocator(page, locatorString, offset = -90, durationMs = 1500) {
  try {
    const loc = page.locator(locatorString).first();
    if (await loc.count() > 0) {
      const box = await loc.boundingBox();
      if (box) {
        await page.evaluate(async ({ boxY, offset, durationMs }) => {
          return new Promise((resolve) => {
            const startY = window.scrollY;
            const targetY = startY + boxY + offset;
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
        }, { boxY: box.y, offset, durationMs });
        await sleep(200);
        return;
      }
    }
  } catch (e) {
    // fallback
  }
  await page.evaluate(() => window.scrollBy({ top: 650, behavior: "smooth" }));
  await sleep(1200);
}

// Native Chrome gesture drag for 3D Scenes
async function smoothDrag(page, startX, startY, endX, endY, steps = 45) {
  await page.mouse.move(startX, startY);
  await sleep(80);
  await page.mouse.down();
  await sleep(80);
  await page.mouse.move(endX, endY, { steps });
  await sleep(100);
  await page.mouse.up();
  await sleep(150);
}

// Smooth Mouse Move
async function smoothMoveTo(page, targetX, targetY, steps = 25) {
  await page.mouse.move(targetX, targetY, { steps });
  await sleep(100);
}

// Inject high-visibility glowing virtual cursor & ripple animations
async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById("virtual-cursor")) return;

    const cursor = document.createElement("div");
    cursor.id = "virtual-cursor";
    cursor.style.cssText = `
      position: fixed;
      top: -100px;
      left: -100px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0,229,255,0.9) 0%, rgba(0,229,255,0.3) 70%, transparent 100%);
      border: 2px solid #00e5ff;
      box-shadow: 0 0 12px #00e5ff, 0 0 24px rgba(0,229,255,0.6);
      pointer-events: none;
      z-index: 99999999;
      transform: translate(-50%, -50%);
      transition: transform 0.08s ease-out, background 0.12s ease;
    `;
    document.body.appendChild(cursor);

    window.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });

    window.addEventListener("mousedown", (e) => {
      cursor.style.transform = "translate(-50%, -50%) scale(0.65)";
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
        transition: transform 0.4s ease-out, opacity 0.4s ease-out;
      `;
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = "translate(-50%, -50%) scale(5)";
        ripple.style.opacity = "0";
      });
      setTimeout(() => ripple.remove(), 450);
    });

    window.addEventListener("mouseup", () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.background = "radial-gradient(circle, rgba(0,229,255,0.9) 0%, rgba(0,229,255,0.3) 70%, transparent 100%)";
    });
  });
}

(async () => {
  const recordDir = path.resolve("./recordings");
  if (!fs.existsSync(recordDir)) {
    fs.mkdirSync(recordDir, { recursive: true });
  }

  console.log("🎬 Starting AgriShift 60-FPS Ultra-Smooth Video Recording...");

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
    // SEGMENT 1: Landing Page Hero & Core Vision (0:00 - 0:15)
    // ==========================================
    console.log("📍 [0:00 - 0:15] Segment 1: Landing Page & Hero");
    await page.goto("https://agri-shift.vercel.app/", { waitUntil: "networkidle" });
    await injectVirtualCursor(page);
    await smoothMoveTo(page, 960, 420, 25);
    await sleep(3500);

    // Smooth continuous 60fps scroll down
    await smoothScrollRaf(page, 650, 1800);
    await sleep(2500);

    // ==========================================
    // SEGMENT 2: Disaster Resilience & Low-Cost Engine (0:15 - 0:32)
    // ==========================================
    console.log("📍 [0:15 - 0:32] Segment 2: Climate Disaster & Cost Engine");
    await smoothScrollRaf(page, 1050, 1200);
    await sleep(1500);

    // Click Flash Flood Tab
    const floodTab = page.locator("button:has-text('Haor Flash Floods'), button:has-text('Flash Flood')").first();
    if (await floodTab.count() > 0) {
      const b = await floodTab.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await floodTab.click();
        await sleep(2200);
      }
    }

    // Switch to Drought Tab
    const droughtTab = page.locator("button:has-text('Drought & Aquifer Depletion'), button:has-text('Drought')").first();
    if (await droughtTab.count() > 0) {
      const b = await droughtTab.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await droughtTab.click();
        await sleep(2000);
      }
    }

    // Adjust land size slider smoothly
    const slider = page.locator("input[type='range']").first();
    if (await slider.count() > 0) {
      const box = await slider.boundingBox();
      if (box) {
        await smoothMoveTo(page, box.x + box.width * 0.25, box.y + box.height / 2, 20);
        await smoothDrag(page, box.x + box.width * 0.25, box.y + box.height / 2, box.x + box.width * 0.75, box.y + box.height / 2, 35);
        await sleep(1500);
        await smoothDrag(page, box.x + box.width * 0.75, box.y + box.height / 2, box.x + box.width * 0.45, box.y + box.height / 2, 30);
        await sleep(1200);
      }
    }

    // Toggle language button (বাংলা <-> EN)
    const langBtn = page.locator("button:has-text('বাংলা'), button:has-text('English')").first();
    if (await langBtn.count() > 0) {
      const b = await langBtn.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await langBtn.click();
        await sleep(2000);
        // Toggle back to English
        await langBtn.click();
        await sleep(1500);
      }
    }

    // ==========================================
    // SEGMENT 3: 3D Mission Control & Telemetry (0:32 - 0:58)
    // ==========================================
    console.log("📍 [0:32 - 0:58] Segment 3: 3D Mission Control & 3D Globe");
    const launchBtn = page.locator("a:has-text('Launch Mission Control'), a:has-text('LAUNCH APP')").first();
    if (await launchBtn.count() > 0) {
      const b = await launchBtn.boundingBox();
      if (b) await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 25);
      await launchBtn.click();
    } else {
      await page.goto("https://agri-shift.vercel.app/dashboard", { waitUntil: "networkidle" });
    }
    await page.waitForLoadState("domcontentloaded");
    await sleep(2800);
    await injectVirtualCursor(page);

    // Smoothly drag and rotate the 3D Earth Globe
    const globeCanvas = page.locator("canvas").first();
    if (await globeCanvas.count() > 0) {
      const b = await globeCanvas.boundingBox();
      if (b) {
        console.log("  🌍 Orbiting 3D Earth Globe...");
        await smoothMoveTo(page, b.x + b.width * 0.55, b.y + b.height * 0.5, 20);
        await smoothDrag(page, b.x + b.width * 0.65, b.y + b.height * 0.5, b.x + b.width * 0.25, b.y + b.height * 0.45, 50);
        await sleep(1500);
      }
    }

    // Scroll smoothly to Module 02 (3D Field Terrain)
    console.log("  🌾 Showing 3D Field Terrain...");
    await smoothScrollToLocator(page, "#terrain, div:has-text('02 · Field 3D Terrain')", -90, 1500);
    await sleep(3000);

    // ==========================================
    // SEGMENT 4: 3-Year Adaptive Rotation & 3D Root Simulation (0:58 - 1:18)
    // ==========================================
    console.log("📍 [0:58 - 1:18] Segment 4: 3-Year Crop Rotation & 3D Root Simulation");
    await smoothScrollToLocator(page, "#rotation, div:has-text('03 · Rotation & Soil 3D')", -80, 1500);
    await sleep(2000);

    // Click Year 2 (Mungbean / Legume)
    const y2Btn = page.locator("button:has-text('Year 2'), button:has-text('Mungbean')").first();
    if (await y2Btn.count() > 0) {
      const b = await y2Btn.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await y2Btn.click();
        await sleep(1500);
      }
    }

    // Click PLAY CYCLE button
    const playBtn = page.locator("button:has-text('PLAY CYCLE')").first();
    if (await playBtn.count() > 0) {
      const b = await playBtn.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await playBtn.click();
        console.log("  🌱 Simulating subsoil root growth through stratigraphy...");
        await sleep(7500); // Watch continuous growth cycle
      }
    }

    // ==========================================
    // SEGMENT 5: Financial Volatility & 3D Profit Surface (1:18 - 1:33)
    // ==========================================
    console.log("📍 [1:18 - 1:33] Segment 5: Risk & 3D Profit Landscape");
    await smoothScrollToLocator(page, "#profit, div:has-text('05 · Risk & Profit 3D')", -80, 1500);
    await sleep(2500);

    // Rotate 3D Profit surface smoothly
    const allCanvases = await page.$$("canvas");
    if (allCanvases.length > 1) {
      const pCanvas = allCanvases[allCanvases.length - 1];
      const box = await pCanvas.boundingBox();
      if (box) {
        console.log("  📈 Rotating 3D Monte Carlo Profit Surface...");
        await smoothMoveTo(page, box.x + box.width * 0.45, box.y + box.height * 0.55, 20);
        await smoothDrag(page, box.x + box.width * 0.45, box.y + box.height * 0.55, box.x + box.width * 0.75, box.y + box.height * 0.35, 45);
        await sleep(1500);
      }
    }

    // Move Fertilizer Global Price Index slider
    const costSliders = await page.$$("input[type='range']");
    if (costSliders.length > 0) {
      const cSlider = costSliders[costSliders.length - 1];
      const box = await cSlider.boundingBox();
      if (box) {
        await smoothMoveTo(page, box.x + box.width * 0.3, box.y + box.height / 2, 20);
        await smoothDrag(page, box.x + box.width * 0.3, box.y + box.height / 2, box.x + box.width * 0.75, box.y + box.height / 2, 35);
        await sleep(1800);
      }
    }

    // ==========================================
    // SEGMENT 6: Offline Embedded NASA Datasets (1:33 - 1:46)
    // ==========================================
    console.log("📍 [1:33 - 1:46] Segment 6: Offline NASA Datasets Archive");
    await page.goto("https://agri-shift.vercel.app/datasets");
    await page.waitForLoadState("domcontentloaded");
    await sleep(2500);
    await injectVirtualCursor(page);

    // Hover over categories
    const categories = await page.$$("button:has-text('Soil Moisture'), button:has-text('Canopy & NDVI')");
    for (const cat of categories) {
      const b = await cat.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await sleep(800);
      }
    }

    // Scroll to SMAP L4 card
    await smoothScrollRaf(page, 400, 1000);
    await sleep(1500);

    // Hover over export buttons
    const exportBtns = await page.$$("button:has-text('GeoJSON'), button:has-text('CSV')");
    for (const btn of exportBtns.slice(0, 2)) {
      const b = await btn.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await sleep(1000);
      }
    }
    await sleep(1500);

    // ==========================================
    // SEGMENT 7: 104-Hex Heatmap & Outro (1:46 - 2:00)
    // ==========================================
    console.log("📍 [1:46 - 2:00] Segment 7: 104-Hex Climate Heatmap & Outro");
    await page.goto("https://agri-shift.vercel.app/heatmap");
    await page.waitForLoadState("domcontentloaded");
    await sleep(2500);
    await injectVirtualCursor(page);

    // Switch between climate variables smoothly
    const varBtns = await page.$$("button:has-text('Vegetation'), button:has-text('Surface temperature'), button:has-text('Air temperature')");
    for (const vBtn of varBtns.slice(0, 3)) {
      const b = await vBtn.boundingBox();
      if (b) {
        await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 20);
        await vBtn.click();
        await sleep(1800);
      }
    }

    // Smooth scroll back to top bar showcasing AGRI SHIFT logo
    await smoothScrollRaf(page, 0, 1000);
    const brand = await page.$(".brand-fs, a[href='/']");
    if (brand) {
      const b = await brand.boundingBox();
      if (b) await smoothMoveTo(page, b.x + b.width / 2, b.y + b.height / 2, 25);
    }
    await sleep(3500);

    console.log("✨ 60-FPS Ultra-Smooth Video Recording Complete!");
  } catch (err) {
    console.error("❌ Recording error:", err);
  } finally {
    const videoObj = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (videoObj) {
      const videoPath = await videoObj.path();
      const finalDest = path.resolve("./recordings/agrishift_all_features_2min_demo.webm");
      fs.copyFileSync(videoPath, finalDest);
      console.log(`🎥 Smooth video saved to: ${finalDest}`);
      console.log(`📦 File size: ${(fs.statSync(finalDest).size / 1024 / 1024).toFixed(2)} MB`);
    }
  }
})();
