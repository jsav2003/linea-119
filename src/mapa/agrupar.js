// Junta en un mismo grupo los reportes que en pantalla quedarían a menos de `radio` píxeles.
// `aPixeles` convierte [lat, lng] en un punto { x, y } de la pantalla para el zoom actual;
// por eso la agrupación cambia con el zoom: de lejos se juntan, de cerca se separan.
// Devuelve una lista de grupos: [[reporte, reporte, …], [reporte], …]
export function agruparCercanos(reportes, aPixeles, radio = 44) {
  const grupos = [] // { x, y, reportes }
  for (const reporte of reportes) {
    const punto = aPixeles([reporte.lat, reporte.lng])
    const cercano = grupos.find((g) => Math.hypot(g.x - punto.x, g.y - punto.y) < radio)
    if (cercano) cercano.reportes.push(reporte)
    else grupos.push({ x: punto.x, y: punto.y, reportes: [reporte] })
  }
  return grupos.map((g) => g.reportes)
}
