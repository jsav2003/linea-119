import { ESTADOS } from './estados.js'

const dosDigitos = (n) => String(n).padStart(2, '0')

// Número de radicado: 119-AAAAMMDD-NNNN (fecha del envío + consecutivo de 4 dígitos)
export function radicado(numero, fechaISO) {
  const f = new Date(fechaISO)
  const dia = `${f.getFullYear()}${dosDigitos(f.getMonth() + 1)}${dosDigitos(f.getDate())}`
  return `119-${dia}-${String(numero).padStart(4, '0')}`
}

// El siguiente consecutivo es el mayor que ya exista + 1
export function siguienteNumero(reportes) {
  return reportes.reduce((mayor, r) => Math.max(mayor, r.numero ?? 0), 0) + 1
}

// Arma un reporte nuevo, en estado Recibido, a partir de los datos del formulario.
export function nuevoReporte(datos, numero, fechaISO) {
  return {
    simulado: false,
    ...datos,
    id: radicado(numero, fechaISO),
    numero,
    creadoEn: fechaISO,
    estado: ESTADOS.RECIBIDO,
    grupoReportado: datos.grupo, // lo que eligió el ciudadano (el operador puede corregirlo)
    unidad: null,
    motivoDescarte: null,
    solicitudInfo: null,
    historial: [{ fecha: fechaISO, estado: ESTADOS.RECIBIDO, texto: 'Reporte enviado desde la web' }],
  }
}
