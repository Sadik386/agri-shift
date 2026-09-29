import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const coordSchema = z.object({ lat: z.number(), lon: z.number() });

export interface LiveSoil {
  ok: boolean;
  ph?: number | undefined;
  clayPct?: number | undefined;
  sandPct?: number | undefined;
  siltPct?: number | undefined;
  organicCarbonPct?: number | undefined;
  error?: string | undefined;
}

export interface LiveWeather {
  ok: boolean;
  rainfall7dMm?: number | undefined;
  maxTempC?: number | undefined;
  forecastRain7dMm?: number | undefined;
  et0Next7dMm?: number | undefined;
  error?: string | undefined;
}

function meanOf(layers: unknown, name: string, factor: number): number | undefined {
  if (!Array.isArray(layers)) return undefined;
  const layer = layers.find((l) => (l as { name?: string }).name === name) as
    | { depths?: Array<{ values?: { mean?: number | null } }> }
    | undefined;
  const mean = layer?.depths?.[0]?.values?.mean;
  return typeof mean === "number" ? mean / factor : undefined;
}

/** ISRIC SoilGrids — free, no key. Falls back to sample values on any failure. */
export const fetchLiveSoil = createServerFn({ method: "GET" })
  .validator((input: unknown) => coordSchema.parse(input))
  .handler(async ({ data }): Promise<LiveSoil> => {
    const url =
      `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${data.lon}&lat=${data.lat}` +
      `&property=phh2o&property=clay&property=sand&property=silt&property=soc&depth=0-5cm&value=mean`;
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return { ok: false, error: `SoilGrids ${res.status}` };
      const json = (await res.json()) as { properties?: { layers?: unknown } };
      const layers = json.properties?.layers;
      const ph = meanOf(layers, "phh2o", 10);
      const clay = meanOf(layers, "clay", 10);
      const sand = meanOf(layers, "sand", 10);
      const silt = meanOf(layers, "silt", 10);
      const soc = meanOf(layers, "soc", 100);
      if (ph === undefined && clay === undefined) return { ok: false, error: "No soil data" };
      return {
        ok: true,
        ph,
        clayPct: clay,
        sandPct: sand,
        siltPct: silt,
        organicCarbonPct: soc,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Soil lookup failed" };
    }
  });

/** Open-Meteo — free, no key: observed 7-day rainfall plus forecast and reference ET. */
export const fetchLiveWeather = createServerFn({ method: "GET" })
  .validator((input: unknown) => coordSchema.parse(input))
  .handler(async ({ data }): Promise<LiveWeather> => {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}` +
      `&daily=precipitation_sum,temperature_2m_max,et0_fao_evapotranspiration&past_days=7&forecast_days=7&timezone=Asia%2FDhaka`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
      if (!res.ok) return { ok: false, error: `Open-Meteo ${res.status}` };
      const json = (await res.json()) as {
        daily?: {
          precipitation_sum?: (number | null)[];
          temperature_2m_max?: (number | null)[];
          et0_fao_evapotranspiration?: (number | null)[];
        };
      };
      const rain = json.daily?.precipitation_sum ?? [];
      const temps = json.daily?.temperature_2m_max ?? [];
      const et0 = json.daily?.et0_fao_evapotranspiration ?? [];
      const sum = (arr: (number | null)[]) =>
        arr.reduce<number>((a, b) => a + (typeof b === "number" ? b : 0), 0);
      if (rain.length === 0) return { ok: false, error: "No weather data" };
      return {
        ok: true,
        rainfall7dMm: Number(sum(rain.slice(0, 7)).toFixed(1)),
        forecastRain7dMm: Number(sum(rain.slice(7)).toFixed(1)),
        maxTempC: Math.max(...temps.map((t) => (typeof t === "number" ? t : -99))),
        et0Next7dMm: Number(sum(et0.slice(7)).toFixed(1)),
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Weather lookup failed" };
    }
  });
