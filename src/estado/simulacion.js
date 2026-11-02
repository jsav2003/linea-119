import { BARRIOS } from '../data/barrios.js'
import { GRUPOS, grupoPorCodigo } from '../data/grupos.js'
import { OPCIONES_EDAD, OPCIONES_SEXO } from '../data/preguntasRescate.js'
import { MOTIVOS_DESCARTE } from './estados.js'
import { nuevoReporte } from './nuevoReporte.js'
import { reportesReducer } from './reportesReducer.js'

// Datos FICTICIOS para el modo emergencia masiva: no son personas ni teléfonos reales.
const NOMBRES = ['Ana', 'Luis', 'Carmen', 'Jorge', 'Marta', 'Pedro', 'Sofía', 'Andrés', 'Lucía', 'Diego', 'Valentina', 'Camilo', 'Paula', 'Mateo']
const APELLIDOS = ['Prueba', 'Demo', 'Simulado', 'Ficticio', 'Ejemplo']
const QUE_VE = {
  100: ['Sale humo negro del segundo piso de una casa', 'Se está quemando un carro en la vía', 'Hay fuego en un lote con basuras', 'Salen llamas del techo de una bodega'],
  200: ['Se escuchó una explosión y hay vidrios rotos en la calle', 'Reventó un tanque en una fábrica'],
  300: ['Choque entre moto y carro, el motociclista está en el piso', 'Hay dos personas atrapadas en un ascensor', 'Una persona se cayó al río y no puede salir'],
  400: ['Huele mucho a gas en todo el edificio', 'Un cable de energía cayó sobre la calle y echa chispas'],
  500: ['Un árbol pequeño tapa la entrada del garaje', 'Hay un panal de abejas en el balcón de un apartamento'],
  800: ['La calle se inundó y el agua está entrando a las casas', 'El viento tumbó un árbol sobre un carro'],
  900: ['Hay un olor extraño que sale de una alcantarilla', 'Un perro quedó atrapado en un canal'],
}
const REFERENCIAS = ['Frente al parque', 'Al lado de la iglesia', 'Diagonal a la panadería', 'Cerca de la estación del MIO', 'En la esquina de la droguería', 'Detrás del colegio']
const EDIFICIOS = ['Edificio Demo', 'Conjunto Prueba', 'Torre Ficticia', 'Bodega Simulada']
const VIAS = ['Calle', 'Carrera', 'Avenida', 'Transversal', 'Diagonal']
const MINUTO = 60 * 1000

const azar = (n) => Math.floor(Math.random() * n)
const elegir = (lista) => lista[azar(lista.length)]

// Genera `cantidad` reportes ficticios:
// - ~40 % son del MISMO incendio grande: mucha gente reportando lo mismo en pocos minutos
//   (el primero ya fue atendido; los demás son posibles duplicados);
// - el resto son emergencias sueltas por la ciudad, algunas ya atendidas.
export function generarReportesSimulados(cantidad, primerNumero, ahora = new Date()) {
  const foco = elegir(BARRIOS)
  const enElFoco = Math.round(cantidad * 0.4)

  return Array.from({ length: cantidad }, (_, i) => {
    const masivo = i < enElFoco
    const barrio = masivo ? foco : elegir(BARRIOS)
    const grupo = masivo ? 100 : elegir(GRUPOS).codigo
    const dispersion = masivo ? 0.002 : 0.006 // en grados: unos 200 m o 650 m alrededor del barrio
    const minutosAtras = masivo ? (i === 0 ? 14 : azar(13)) : azar(120)
    const creadoEn = new Date(ahora.getTime() - minutosAtras * MINUTO).toISOString()
    const conEdificio = azar(3) === 0

    const base = nuevoReporte(
      {
        simulado: true,
        grupo,
        queVe: elegir(QUE_VE[grupo]),
        nombres: elegir(NOMBRES),
        apellidos: elegir(APELLIDOS),
        telefono: '000' + String(azar(1e7)).padStart(7, '0'), // empieza en 000: no existe en Colombia
        direccion: `${elegir(VIAS)} ${1 + azar(80)} # ${1 + azar(90)}-${1 + azar(99)}`,
        barrio: barrio.nombre,
        referencia: elegir(REFERENCIAS),
        edificio: conEdificio ? elegir(EDIFICIOS) : '',
        edificioNoAplica: !conEdificio,
        lat: barrio.lat + (Math.random() * 2 - 1) * dispersion,
        lng: barrio.lng + (Math.random() * 2 - 1) * dispersion,
        ubicacionExacta: true,
        continuacion: grupo === 300 ? continuacionAlAzar() : null,
        fotos: [],
        video: null,
      },
      primerNumero + i,
      creadoEn,
    )
    const reporte = {
      ...base,
      historial: [{ ...base.historial[0], texto: 'Reporte simulado (modo emergencia masiva)' }],
    }

    if (masivo) return i === 0 ? avanzar(reporte, ['validar', 'despachar']) : reporte
    return avanzar(reporte, pasosSegunEdad(minutosAtras))
  })
}

// Entre más viejo el reporte, más avanzado va en el protocolo
function pasosSegunEdad(minutos) {
  if (minutos >= 90) return azar(4) === 0 ? ['descartar'] : ['validar', 'despachar', 'cerrar']
  if (minutos >= 45) return ['validar', 'despachar']
  if (minutos >= 20) return azar(2) === 0 ? ['validar'] : []
  return []
}

// Minutos después del reporte en que ocurre cada paso (para que el historial tenga horas creíbles)
const MINUTOS_DESPUES = { validar: 2, descartar: 3, despachar: 5, cerrar: 40 }

// Avanza el reporte con el MISMO reducer de la app, así el historial sigue las reglas del protocolo
function avanzar(reporte, pasos) {
  const inicio = new Date(reporte.creadoEn).getTime()
  return pasos.reduce((r, tipo) => {
    const accion = {
      type: tipo,
      id: r.id,
      fecha: new Date(inicio + MINUTOS_DESPUES[tipo] * MINUTO).toISOString(),
      grupo: r.grupo,
      unidad: grupoPorCodigo(r.grupo).unidadSugerida,
      motivo: elegir(MOTIVOS_DESCARTE.slice(0, 2)),
    }
    return reportesReducer([r], accion)[0]
  }, reporte)
}

function continuacionAlAzar() {
  return {
    sexo: elegir(OPCIONES_SEXO),
    edad: elegir(OPCIONES_EDAD),
    consciente: elegir(['Sí', 'Sí', 'No']),
    respira: elegir(['Sí', 'Sí', 'Sí', 'No sé']),
  }
}
