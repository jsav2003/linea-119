import L from 'leaflet'
import { colorDeGrupo } from '../data/grupos.js'
import { ESTADOS } from '../estado/estados.js'

// Los íconos se guardan en caché: si un pin no cambió, React-Leaflet recibe el mismo objeto,
// no vuelve a dibujarlo y la animación de pulso no se reinicia en cada render.
const cache = new Map()

function desdeCache(clave, crear) {
  if (!cache.has(clave)) cache.set(clave, crear())
  return cache.get(clave)
}

// Crea el ícono (pin) de un reporte con el color de su grupo.
// Usa HTML + CSS (clases en mapa.css), así no hace falta ninguna imagen.
export function crearIcono(color, { seleccionado = false, clases = '' } = {}) {
  return desdeCache(`pin|${color}|${seleccionado}|${clases}`, () => {
    const tam = seleccionado ? 34 : 26
    // El pin es un cuadrado girado 45°: su punta queda a 1.2 veces su tamaño desde arriba
    const punta = Math.round(tam * 1.207)
    return L.divIcon({
      className: '', // quita el estilo por defecto de Leaflet
      html: `<div class="pin ${seleccionado ? 'pin--seleccionado' : ''} ${clases}" style="--color:${color}; width:${tam}px; height:${tam}px"></div>`,
      iconSize: [tam, tam],
      iconAnchor: [tam / 2, punta], // la punta del pin queda sobre la coordenada
      popupAnchor: [0, -Math.round(tam * 1.25)],
    })
  })
}

// Clase CSS del pin según el estado del reporte: cada cambio de estado se ve en el mapa
export function clasesDeEstado(estado) {
  switch (estado) {
    case ESTADOS.RECIBIDO:
      return 'pin--pulso' // nuevo, sin validar: late para llamar la atención
    case ESTADOS.VALIDADO:
      return 'pin--validado'
    case ESTADOS.DESPACHADO:
      return 'pin--despachado'
    default:
      return 'pin--apagado' // Cerrado o Descartado
  }
}

// Ícono de un grupo de reportes cercanos: un círculo con el número de reportes y un anillo
// de colores (conic-gradient) con la proporción de cada grupo de emergencia.
export function crearIconoCumulo(reportes) {
  const total = reportes.length
  const porGrupo = new Map()
  for (const r of reportes) porGrupo.set(r.grupo, (porGrupo.get(r.grupo) ?? 0) + 1)

  let acumulado = 0
  const tramos = [...porGrupo]
    .sort((a, b) => a[0] - b[0])
    .map(([grupo, cantidad]) => {
      const desde = (acumulado / total) * 360
      acumulado += cantidad
      return `${colorDeGrupo(grupo)} ${desde}deg ${(acumulado / total) * 360}deg`
    })
    .join(', ')
  const pendientes = reportes.some((r) => r.estado === ESTADOS.RECIBIDO)
  const tam = total >= 20 ? 56 : total >= 8 ? 48 : 40

  return desdeCache(`cumulo|${tramos}|${pendientes}|${total}`, () =>
    L.divIcon({
      className: '',
      html: `<div class="cumulo ${pendientes ? 'cumulo--pendientes' : ''}" style="width:${tam}px; height:${tam}px; background:conic-gradient(${tramos})"><span>${total}</span></div>`,
      iconSize: [tam, tam],
      iconAnchor: [tam / 2, tam / 2],
    }),
  )
}
