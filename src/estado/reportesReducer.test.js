// Pruebas del protocolo de estados. Se corren con: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { reportesReducer } from './reportesReducer.js'
import { nuevoReporte, siguienteNumero } from './nuevoReporte.js'
import { ESTADOS } from './estados.js'
import { generarReportesSimulados } from './simulacion.js'

const FECHA = '2026-11-02T15:00:00.000Z'
const unReporte = (grupo = 100) =>
  nuevoReporte({ grupo, barrio: 'Junín', lat: 3.444, lng: -76.525, fotos: [] }, 1, FECHA)

const aplicar = (reportes, ...acciones) => acciones.reduce(reportesReducer, reportes)

test('un reporte nuevo queda en estado Recibido con radicado 119-AAAAMMDD-NNNN', () => {
  const r = unReporte()
  assert.equal(r.estado, ESTADOS.RECIBIDO)
  assert.match(r.id, /^119-\d{8}-0001$/)
  assert.equal(r.historial.length, 1)
})

test('no se puede despachar un caso sin validar', () => {
  const r = unReporte()
  const [despues] = reportesReducer([r], { type: 'despachar', id: r.id, unidad: 'Máquina', fecha: FECHA })
  assert.equal(despues.estado, ESTADOS.RECIBIDO)
  assert.equal(despues.unidad, null)
})

test('flujo completo: Recibido → Validado → Unidad despachada → Cerrado', () => {
  const r = unReporte()
  const [final] = aplicar(
    [r],
    { type: 'validar', id: r.id, grupo: 100, fecha: FECHA },
    { type: 'despachar', id: r.id, unidad: 'Máquina', fecha: FECHA },
    { type: 'cerrar', id: r.id, fecha: FECHA },
  )
  assert.equal(final.estado, ESTADOS.CERRADO)
  assert.equal(final.unidad, 'Máquina')
  assert.deepEqual(
    final.historial.map((h) => h.estado),
    [ESTADOS.RECIBIDO, ESTADOS.VALIDADO, ESTADOS.DESPACHADO, ESTADOS.CERRADO],
  )
})

test('al validar, el operador puede corregir el grupo', () => {
  const r = unReporte(100)
  const [validado] = reportesReducer([r], { type: 'validar', id: r.id, grupo: 400, fecha: FECHA })
  assert.equal(validado.grupo, 400)
  assert.equal(validado.grupoReportado, 100)
  assert.match(validado.historial.at(-1).texto, /100 → 400/)
})

test('un caso descartado ya no se puede validar ni despachar', () => {
  const r = unReporte()
  const [final] = aplicar(
    [r],
    { type: 'descartar', id: r.id, motivo: 'Falsa alarma', fecha: FECHA },
    { type: 'validar', id: r.id, grupo: 100, fecha: FECHA },
    { type: 'despachar', id: r.id, unidad: 'Máquina', fecha: FECHA },
  )
  assert.equal(final.estado, ESTADOS.DESCARTADO)
  assert.equal(final.motivoDescarte, 'Falsa alarma')
})

test('no se despacha una unidad que no existe', () => {
  const r = unReporte()
  const [final] = aplicar(
    [r],
    { type: 'validar', id: r.id, grupo: 100, fecha: FECHA },
    { type: 'despachar', id: r.id, unidad: 'Helicóptero', fecha: FECHA },
  )
  assert.equal(final.estado, ESTADOS.VALIDADO)
})

test('el operador pide más información y el ciudadano responde', () => {
  const r = unReporte()
  const [final] = aplicar(
    [r],
    { type: 'solicitarInfo', id: r.id, mensaje: '¿Hay personas atrapadas?', fecha: FECHA },
    { type: 'responderInfo', id: r.id, texto: 'Sí, dos en el segundo piso', fecha: FECHA },
  )
  assert.equal(final.solicitudInfo.respuesta, 'Sí, dos en el segundo piso')
  assert.equal(final.estado, ESTADOS.RECIBIDO)
})

test('el consecutivo sigue después del número más alto', () => {
  assert.equal(siguienteNumero([]), 1)
  assert.equal(siguienteNumero([{ numero: 3 }, { numero: 7 }]), 8)
})

test('la simulación crea 50 reportes con radicados únicos e historial válido', () => {
  const simulados = generarReportesSimulados(50, 1, new Date(FECHA))
  assert.equal(simulados.length, 50)
  assert.equal(new Set(simulados.map((r) => r.id)).size, 50)
  for (const r of simulados) {
    assert.equal(r.historial.at(-1).estado ?? r.estado, r.estado)
    assert.ok(new Date(r.historial.at(-1).fecha) <= new Date(FECHA), 'el historial no puede estar en el futuro')
  }
})
