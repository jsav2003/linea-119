// Logo de la línea 119: SVG dibujado en código, sin imágenes externas
export default function Logo({ tam = 40 }) {
  return (
    <svg className="logo" width={tam} height={tam} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#dc2626" />
      <rect x="3" y="3" width="42" height="42" rx="9.5" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fontFamily="system-ui, 'Segoe UI', Roboto, sans-serif"
        fontWeight="800"
        fontSize="19"
        letterSpacing="-0.5"
        fill="#fff"
      >
        119
      </text>
    </svg>
  )
}
