// Estados de un reporte y las reglas para pasar de uno a otro.
//
//   Recibido ──► Validado ──► Unidad despachada ──► Cerrado
//       │
//       └──► Descartado (falso o duplicado)
//
// La regla clave del protocolo: no se puede despachar un caso que no esté validado.
export const ESTADOS = {
  RECIBIDO: 'Recibido',
  VALIDADO: 'Validado',
  DESPACHADO: 'Unidad despachada',
  CERRADO: 'Cerrado',
  DESCARTADO: 'Descartado',
}

// Pasos que ve el ciudadano en su línea de tiempo
export const PASOS = [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO]

// A qué estados se puede pasar desde cada estado
const SIGUIENTES = {
  [ESTADOS.RECIBIDO]: [ESTADOS.VALIDADO, ESTADOS.DESCARTADO],
  [ESTADOS.VALIDADO]: [ESTADOS.DESPACHADO],
  [ESTADOS.DESPACHADO]: [ESTADOS.CERRADO],
  [ESTADOS.CERRADO]: [],
  [ESTADOS.DESCARTADO]: [],
}

export function puedePasarA(estadoActual, estadoNuevo) {
  return SIGUIENTES[estadoActual]?.includes(estadoNuevo) ?? false
}

export function estaTerminado(estado) {
  return estado === ESTADOS.CERRADO || estado === ESTADOS.DESCARTADO
}

// Sufijo de clase CSS para cada estado (insignias y contadores)
export const CLASE_ESTADO = {
  [ESTADOS.RECIBIDO]: 'recibido',
  [ESTADOS.VALIDADO]: 'validado',
  [ESTADOS.DESPACHADO]: 'despachado',
  [ESTADOS.CERRADO]: 'cerrado',
  [ESTADOS.DESCARTADO]: 'descartado',
}

// Lo que lee el ciudadano en su pantalla de confirmación según el estado
export const MENSAJE_CIUDADANO = {
  [ESTADOS.RECIBIDO]: 'Tu reporte llegó al centro de despacho. Un radio operador lo está revisando.',
  [ESTADOS.VALIDADO]: 'Un radio operador confirmó la emergencia y está asignando una unidad.',
  [ESTADOS.DESPACHADO]: 'Una unidad de Bomberos va en camino.',
  [ESTADOS.CERRADO]: 'La atención de la emergencia terminó. Gracias por reportar.',
  [ESTADOS.DESCARTADO]: 'El reporte se cerró sin enviar una unidad.',
}

export const MOTIVOS_DESCARTE = ['Falsa alarma', 'Reporte duplicado', 'Broma o uso indebido', 'Otro']

// Caso crítico: en un rescate o emergencia médica (grupo 300) la persona no respira o está inconsciente
export function esCritico(reporte) {
  const c = reporte.continuacion
  return Boolean(c && (c.respira === 'No' || c.consciente === 'No'))
}
