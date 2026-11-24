const COIN_MM = 19.41
const GAP_MM = 6
const PX_PER_MM = 5

export function TrueSizeScale({ length, width }: { length: number; width: number }) {
  const long = Math.max(length, width)
  const short = Math.min(length, width)
  const height = Math.max(COIN_MM, short)
  const total = long + GAP_MM + COIN_MM
  const stroke = 0.3

  return (
    <figure className="mt-4 border-b border-rule pb-3 text-sm">
      <svg
        viewBox={`${-stroke} ${-stroke} ${total + stroke * 2} ${height + stroke * 2}`}
        width={total * PX_PER_MM}
        height={height * PX_PER_MM}
        className="h-auto max-w-full"
        aria-hidden="true"
      >
        <ellipse
          cx={long / 2}
          cy={height / 2}
          rx={long / 2}
          ry={short / 2}
          className="fill-plinth-2 stroke-ink"
          strokeWidth={stroke}
        />
        <circle
          cx={long + GAP_MM + COIN_MM / 2}
          cy={height / 2}
          r={COIN_MM / 2}
          className="fill-plinth stroke-ink-3"
          strokeWidth={stroke}
        />
        <text
          x={long + GAP_MM + COIN_MM / 2}
          y={height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={5}
          className="fill-ink-3"
        >
          5c
        </text>
      </svg>
      <figcaption className="mt-2 text-ink-2">
        Shown to scale beside a 5c coin: stone {long} × {short} mm, coin {COIN_MM} mm across.
      </figcaption>
    </figure>
  )
}
