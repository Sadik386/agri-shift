export function Sparkline({
  data,
  color = "#00e5ff",
  height = 36,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const points = data
    .map((v, i) => `${(i * 100) / (data.length - 1)},${height - 2 - v * (height - 4)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        points={points}
      />
    </svg>
  );
}
