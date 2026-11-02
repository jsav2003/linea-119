import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { reportesReducer } from './reportesReducer.js'
import { CLAVE_REPORTES, aLista, cargarReportes, guardarReportes } from './almacenamiento.js'
import { nuevoReporte, siguienteNumero } from './nuevoReporte.js'
import { generarReportesSimulados } from './simulacion.js'

const ReportesContext = createContext(null)

// ESTADO GLOBAL de la app: la lista de reportes.
// - /reportar agrega reportes, /operador los valida y despacha, y /reportar/:radicado
//   le muestra al ciudadano el estado actual. Todas leen la misma lista.
// - Se guarda en localStorage, así sobrevive a recargar la página.
// - Escucha el evento "storage" para sincronizar dos pestañas abiertas (ciudadano y operador).
export function ReportesProvider({ children }) {
  const [reportes, dispatch] = useReducer(reportesReducer, undefined, cargarReportes)
  const ultimoGuardado = useRef(null)

  // 1. Guardar en localStorage cada vez que cambia la lista
  useEffect(() => {
    const texto = JSON.stringify(reportes)
    if (texto === ultimoGuardado.current) return // ya está guardado (p. ej. vino de otra pestaña)
    guardarReportes(reportes, texto)
    ultimoGuardado.current = texto
  }, [reportes])

  // 2. Si otra pestaña guarda cambios, traerlos a esta
  useEffect(() => {
    function alGuardarOtraPestana(evento) {
      if (evento.key !== CLAVE_REPORTES) return
      ultimoGuardado.current = evento.newValue
      dispatch({ type: 'reemplazarTodo', reportes: aLista(evento.newValue) })
    }
    window.addEventListener('storage', alGuardarOtraPestana)
    return () => window.removeEventListener('storage', alGuardarOtraPestana)
  }, [])

  // 3. Acciones que usan las pantallas. Los componentes no llaman a dispatch directamente:
  //    piden "validar", "despachar"... y la hora se pone aquí, no en el reducer.
  const valor = useMemo(() => {
    const ahora = () => new Date().toISOString()
    return {
      reportes,
      buscarReporte: (id) => reportes.find((r) => r.id === id) ?? null,
      crearReporte(datos) {
        const reporte = nuevoReporte(datos, siguienteNumero(reportes), ahora())
        dispatch({ type: 'crear', reporte })
        return reporte.id // el formulario lo usa para ir a la pantalla de confirmación
      },
      validar: (id, grupo) => dispatch({ type: 'validar', id, grupo, fecha: ahora() }),
      descartar: (id, motivo) => dispatch({ type: 'descartar', id, motivo, fecha: ahora() }),
      despachar: (id, unidad) => dispatch({ type: 'despachar', id, unidad, fecha: ahora() }),
      cerrar: (id) => dispatch({ type: 'cerrar', id, fecha: ahora() }),
      solicitarInfo: (id, mensaje) => dispatch({ type: 'solicitarInfo', id, mensaje, fecha: ahora() }),
      responderInfo: (id, texto) => dispatch({ type: 'responderInfo', id, texto, fecha: ahora() }),
      simularReportes(cantidad = 50) {
        const simulados = generarReportesSimulados(cantidad, siguienteNumero(reportes))
        dispatch({ type: 'agregarVarios', reportes: simulados })
      },
      borrarTodo: () => dispatch({ type: 'borrarTodo' }),
    }
  }, [reportes])

  return <ReportesContext.Provider value={valor}>{children}</ReportesContext.Provider>
}

// Hook para leer el estado global desde cualquier pantalla o componente
export function useReportes() {
  const contexto = useContext(ReportesContext)
  if (!contexto) throw new Error('useReportes() debe usarse dentro de <ReportesProvider>')
  return contexto
}
