# 🛰️ AgriShift: How NASA Satellites Help Save Farming in Bangladesh
### *(Explained for a 9th–10th Grade Student)*

Imagine you are looking down at Earth from 400 miles up in space inside a NASA satellite. 

Down below is **Bangladesh** — one of the greenest, most fertile places on Earth, where millions of families farm rice to feed the nation. But look closer, and there's a silent crisis unfolding:
- **Groundwater is disappearing:** To grow dry-season rice (*Boro* rice), farmers pump so much underground water that the water table drops by almost **a meter every single year**.
- **Climate disasters are hitting harder:** Sudden droughts in the northwest, salt water invading the southern coast, flash floods in the northeast, and intense heatwaves.
- **Farming costs are exploding:** Farmers spend huge amounts of money on diesel fuel to run irrigation water pumps, and if the weather turns bad, they lose everything.

This is where **AgriShift** comes in.

---

## 💡 What is AgriShift?

Think of **AgriShift** like a **"Mission Control Video Game" for real-world farming**.

Instead of guessing what to plant or when to water, AgriShift takes **live and historical scientific data from 7 NASA satellites** orbiting Earth, mixes it with soil maps, and turns it into interactive **3D maps, simulations, and financial calculators** right inside a web browser.

It tells farmers and researchers:
> *"Don’t plant thirsty rice here this season — the satellite radar shows the soil will dry up. Plant pearl millet or mungbean instead. You’ll save 70% of your water, spend way less money on diesel, and make more profit!"*

---

## 🛰️ The "Space Spies": Which Satellites Does It Use?

NASA doesn't just look at stars; it looks back down at Earth with super-specialized sensors:

| Satellite / Mission | Superpower | What AgriShift Uses It For |
|---|---|---|
| **SMAP** | Radar & Radiometer | Measures moisture hidden inside the top 5 cm of soil — like an X-ray for mud! |
| **Landsat 8 & 9** | Optical & Infrared cameras | Calculates **NDVI** (how green and healthy plants are). Healthy leaves reflect near-infrared light like mirrors! |
| **ECOSTRESS** | Thermal infrared (on the ISS) | Measures land temperature and **evapotranspiration** (how much plants are "sweating" water into the air). |
| **GPM IMERG** | Rain radar fleet | Tracks exact rainfall amounts hour-by-hour across every district. |
| **GRACE-FO** | Gravity twin satellites | Detects tiny changes in Earth’s gravity caused by massive loss of deep underground water aquifers! |
| **NISAR** | Dual-frequency radar | Pierces through clouds and monsoon skies to scan plant stems and canopy heights. |

---

## 🎮 The Main Parts of the Project (Tour of the App)

### 1. 🌍 The 3D Interactive Globe
When you open AgriShift, you see a full 3D digital Earth. You can spin it around, zoom in on Bangladesh, and watch glowing arcs showing the exact orbits of NASA satellites flying overhead. Every one of the 64 districts in Bangladesh is highlighted with color-coded climate stats.

### 2. 🛡️ The Climate Disaster Resilience Engine
Different regions face different climate monsters. AgriShift analyzes 4 major disasters:
* **Droughts** (in the Barind Tract / Rajshahi)
* **Saltwater intrusion** (coastal Sundarbans / Khulna)
* **Flash floods** (Haor wetlands / Sylhet)
* **Heatwaves** (dry western plains)

For each disaster, the app pits the **old crop** (fragile, water-hungry rice) against a **climate-smart superhero crop** (like sorghum, salt-tolerant barley, or pearl millet). You can move a slider to choose your land size (e.g., 5 acres) and watch the app instantly calculate how many thousands of Taka you save on diesel fuel and fertilizer!

### 3. 🌱 3D Field Map & Soil Profile Simulator
Ever wondered what happens under the dirt?
* You can view a 3D block of a farmer's field showing soil layers (clay, silt, sand).
* Press **"PLAY CYCLE"**, and you watch virtual plant roots grow down into the soil layers in 3D animation, hunting for moisture.
* It shows **crop rotation** (Year 1: Maize 🌽 → Year 2: Legume Mungbean 🫘 → Year 3: Sorghum 🌾). Mungbean has special bacteria on its roots (*Rhizobia*) that pull nitrogen right out of the air and put it into the soil for free, so the farmer doesn’t have to buy expensive chemical urea fertilizer!

### 4. 📈 The 3D "Profit Landscape"
Farmers aren't just scientists — they're small business owners. 
AgriShift features a **3D wavy colorful graph** (like a miniature mountain range). 
* One axis is **rainfall deficit** (how bad the drought is).
* The second axis is **fertilizer price spikes**.
* The height/color is **how much profit the farmer keeps**.
It runs **2,500 computer simulations** in milliseconds so farmers know their break-even point even if a bad weather shock hits.

### 5. 🐝 104-Hexagon Heatmap
The whole country of Bangladesh is sliced into 104 hexagonal puzzle pieces. AgriShift uses **40 years of climate history** to show whether rainfall and temperatures are trending up or down over decades using statistical formulas (*Mann-Kendall tests*).

### 6. 📴 100% Offline-Ready
Here’s the smartest engineering feature: many farmers in rural villages don't have fast 5G internet or WiFi. AgriShift stores the satellite dataset packages directly inside the browser cache, so the entire portal can run **completely offline without internet**!

---

## 💻 How Was It Built? (The Tech Stack)

If you're learning to code in school (HTML, CSS, JavaScript, or Python), here's what powers AgriShift under the hood:

* **React 19 & TypeScript:** The language and UI structure of the web app.
* **Three.js & WebGL:** The 3D graphics engine (the same tech used to make 3D browser games) to render the globe, soil layers, and profit surfaces.
* **Tailwind CSS:** For the sleek "dark-mode cyberpunk mission control" visual style.
* **TanStack Start & Router:** Powers the blazing-fast page navigation and server rendering.
* **Full Bilingual Support (English + বাংলা):** With one click, every single word, number, and label instantly switches between English and Bangla so rural Bangladeshi farmers and NASA judges in the US can both understand it effortlessly.

---

## 🏆 Summary: Why This Matters

AgriShift proves that space science isn't just about rockets going to Mars. 

By taking satellites that cost hundreds of millions of dollars and connecting their data to a kid, a scientist, or a farmer with a smartphone in rural Bangladesh, we can **save billions of litres of groundwater**, protect families from poverty during climate disasters, and ensure there's enough food to feed future generations.
