import { ESTADOS, estaTerminado, puedePasarA } from './estados.js'
import { grupoPorCodigo } from '../data/grupos.js'
import { esUnidadValida } from '../data/unidades.js'

// Reducer del estado global: recibe la lista de reportes y una acción, y devuelve la lista nueva.
// Es una función pura: no lee la hora ni localStorage; todo lo que necesita viene en la acción.
// Si una acción rompe el protocolo (p. ej. despachar sin validar), la lista queda igual.
export function reportesReducer(reportes, accion) {
  switch (accion.type) {
    case 'crear':
      return [accion.reporte, ...reportes]

    case 'agregarVarios':
      return [...accion.reportes, ...reportes]

    case 'reemplazarTodo': // llegó una versión nueva desde otra pestaña
      return accion.reportes

    case 'borrarTodo':
      return []

    case 'validar':
      return actualizar(reportes, accion.id, (r) => {
        const grupo = grupoPorCodigo(accion.grupo) ? Number(accion.grupo) : r.grupo
        const texto = grupo === r.grupo ? `Grupo confirmado: ${grupo}` : `Grupo corregido: ${r.grupo} → ${grupo}`
        return cambiarEstado(r, ESTADOS.VALIDADO, accion.fecha, texto, { grupo })
      })

    case 'descartar':
      return actualizar(reportes, accion.id, (r) =>
        cambiarEstado(r, ESTADOS.DESCARTADO, accion.fecha, `Motivo: ${accion.motivo}`, {
          motivoDescarte: accion.motivo,
        }),
      )

    case 'despachar':
      if (!esUnidadValida(accion.unidad)) return reportes
      return actualizar(reportes, accion.id, (r) =>
        cambiarEstado(r, ESTADOS.DESPACHADO, accion.fecha, `Unidad: ${accion.unidad}`, { unidad: accion.unidad }),
      )

    case 'cerrar':
      return actualizar(reportes, accion.id, (r) =>
        cambiarEstado(r, ESTADOS.CERRADO, accion.fecha, 'Atención terminada'),
      )

    case 'solicitarInfo':
      return actualizar(reportes, accion.id, (r) => {
        if (estaTerminado(r.estado)) return r
        return {
          ...r,
          solicitudInfo: { mensaje: accion.mensaje, fecha: accion.fecha, respuesta: null, fechaRespuesta: null },
          historial: [...r.historial, { fecha: accion.fecha, texto: `El operador pidió más información: «${accion.mensaje}»` }],
        }
      })

    case 'responderInfo':
      return actualizar(reportes, accion.id, (r) => {
        if (!r.solicitudInfo) return r
        return {
          ...r,
          solicitudInfo: { ...r.solicitudInfo, respuesta: accion.texto, fechaRespuesta: accion.fecha },
          historial: [...r.historial, { fecha: accion.fecha, texto: `El ciudadano respondió: «${accion.texto}»` }],
        }
      })

    default:
      return reportes
  }
}

// Aplica `cambio` solo al reporte con ese id (los demás quedan iguales)
function actualizar(reportes, id, cambio) {
  return reportes.map((r) => (r.id === id ? cambio(r) : r))
}

// Cambia el estado si el protocolo lo permite y lo anota en el historial
function cambiarEstado(reporte, estadoNuevo, fecha, texto, cambiosExtra = {}) {
  if (!puedePasarA(reporte.estado, estadoNuevo)) return reporte
  return {
    ...reporte,
    ...cambiosExtra,
    estado: estadoNuevo,
    historial: [...reporte.historial, { fecha, estado: estadoNuevo, texto }],
  }
}
