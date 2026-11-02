// Enlace para abrir el punto en Google Maps (formato pedido en el enunciado)
export const enlaceGoogleMaps = (lat, lng) =>
  `https://www.google.com/maps?q=${Number(lat).toFixed(6)},${Number(lng).toFixed(6)}`

// Distancia en metros entre dos puntos { lat, lng } (fórmula de Haversine)
export function distanciaMetros(a, b) {
  const RADIO_TIERRA = 6371000
  const rad = (grados) => (grados * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA * Math.asin(Math.sqrt(h))
}

// Reportes cercanos en distancia y en tiempo: posibles duplicados del mismo incidente.
// Devuelve [{ reporte, metros }] ordenados del más cercano al más lejano.
export function reportesCercanos(reporte, reportes, { metros = 500, minutos = 60 } = {}) {
  const hora = new Date(reporte.creadoEn).getTime()
  return reportes
    .filter((otro) => otro.id !== reporte.id)
    .filter((otro) => Math.abs(new Date(otro.creadoEn).getTime() - hora) <= minutos * 60000)
    .map((otro) => ({ reporte: otro, metros: distanciaMetros(reporte, otro) }))
    .filter((c) => c.metros <= metros)
    .sort((a, b) => a.metros - b.metros)
}

// Punto medio de varios reportes
export function centroDe(reportes) {
  const n = reportes.length
  return {
    lat: reportes.reduce((suma, r) => suma + r.lat, 0) / n,
    lng: reportes.reduce((suma, r) => suma + r.lng, 0) / n,
  }
}
