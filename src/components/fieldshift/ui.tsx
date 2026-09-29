import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  eyebrow,
  right,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  eyebrow?: string;
  right?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-xl",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_-40px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.05),transparent_45%)]" />
      {(title || right) && (
        <header className="relative flex items-start justify-between gap-4 border-b border-border/70 px-4 py-3">
          <div>
            {eyebrow && (
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
          </div>
          {right}
        </header>
      )}
      <div className={cn("relative p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatusBadge({
  label,
  value,
  unit,
  hint,
  tone = "cyan",
  origin,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "cyan" | "amber" | "green" | "rose";
  origin?: "live" | "sample" | "modeled";
}) {
  const toneMap = {
    cyan: "text-[oklch(0.82_0.13_210)]",
    amber: "text-[oklch(0.83_0.14_80)]",
    green: "text-[oklch(0.82_0.15_150)]",
    rose: "text-[oklch(0.75_0.16_20)]",
  } as const;

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border/80 bg-secondary/40 p-3 backdrop-blur-md">
      <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        {origin && <OriginDot origin={origin} />}
      </div>
      <p className={cn("mt-2 font-mono text-2xl leading-none tabular-nums", toneMap[tone])}>
        {value}
        {unit && <span className="ml-1 text-xs text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function OriginDot({ origin }: { origin: "live" | "sample" | "modeled" }) {
  const map = {
    live: { color: "bg-[oklch(0.8_0.17_150)]", label: "LIVE" },
    sample: { color: "bg-[oklch(0.78_0.14_85)]", label: "SAMPLE" },
    modeled: { color: "bg-[oklch(0.72_0.11_250)]", label: "MODEL" },
  } as const;
  const m = map[origin];
  return (
    <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", m.color, origin === "live" && "animate-pulse")} />
      {m.label}
    </span>
  );
}

export function Meter({
  label,
  value,
  max,
  suffix,
  tone = "cyan",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
  tone?: "cyan" | "amber" | "green";
}) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  const bar = {
    cyan: "bg-[oklch(0.75_0.13_210)]",
    amber: "bg-[oklch(0.78_0.14_80)]",
    green: "bg-[oklch(0.75_0.15_150)]",
  }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <span className="font-mono text-xs tabular-nums text-foreground">
          {value.toLocaleString("en-US")}
          {suffix}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all duration-500", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SceneFrame({
  children,
  className,
  caption,
}: {
  children: ReactNode;
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border/80 bg-[oklch(0.15_0.02_250)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:38px_38px]" />
      {children}
      {caption && (
        <p className="pointer-events-none absolute bottom-2 left-3 z-20 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {caption}
        </p>
      )}
    </div>
  );
}
