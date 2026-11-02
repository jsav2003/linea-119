import { useEffect, useMemo, useRef, useState } from 'react'
import MapaOperador from '../mapa/MapaOperador.jsx'
import BarraOperador from '../components/operador/BarraOperador.jsx'
import FiltrosReportes from '../components/operador/FiltrosReportes.jsx'
import ListaReportes from '../components/operador/ListaReportes.jsx'
import DetalleReporte from '../components/operador/DetalleReporte.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { estaTerminado } from '../estado/estados.js'
import { grupoPorCodigo } from '../data/grupos.js'
import { useTitulo } from '../hooks/useTitulo.js'
import './Operador.css'

// Pantalla 3 (/operador): mapa real con los reportes del estado global, lista, detalle,
// validación y despacho. Ya no usa los reportes de prueba del código base.
export default function Operador() {
  useTitulo('Tablero del radio operador')
  const { reportes } = useReportes()
  const [seleccionadoId, setSeleccionadoId] = useState(null)
  const [filtros, setFiltros] = useState({ estado: 'todos', grupos: [] })
  const [agrupar, setAgrupar] = useState(true)
  const aviso = useAvisoDeNuevos(reportes)
  const detalleRef = useRef(null)

  const visibles = useMemo(() => filtrarYOrdenar(reportes, filtros), [reportes, filtros])
  const seleccionado = reportes.find((r) => r.id === seleccionadoId) ?? null
  // En el mapa siempre se ve el seleccionado, aunque los filtros lo saquen de la lista
  const enMapa = seleccionado && !visibles.includes(seleccionado) ? [...visibles, seleccionado] : visibles

  function seleccionar(id) {
    setSeleccionadoId(id)
    // En celular el detalle queda debajo del mapa: bajar hasta él
    if (window.matchMedia('(max-width: 760px)').matches) {
      requestAnimationFrame(() => detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  return (
    <div className={`operador${seleccionado ? ' operador--con-detalle' : ''}`}>
      <BarraOperador
        filtroEstado={filtros.estado}
        onFiltrarEstado={(estado) => setFiltros((f) => ({ ...f, estado }))}
      />

      <div className="operador__cuerpo">
        <aside className="operador__lista" aria-label="Lista de reportes">
          <FiltrosReportes
            filtros={filtros}
            onCambiar={setFiltros}
            agrupar={agrupar}
            onAgrupar={setAgrupar}
            total={reportes.length}
            visibles={visibles.length}
          />
          <ListaReportes
            reportes={visibles}
            seleccionadoId={seleccionadoId}
            onSeleccionar={seleccionar}
            hayReportes={reportes.length > 0}
          />
        </aside>

        <section className="operador__mapa" aria-label="Mapa de reportes">
          <MapaOperador
            reportes={enMapa}
            seleccionadoId={seleccionadoId}
            onSeleccionar={seleccionar}
            agrupar={agrupar}
          />
        </section>

        <aside className="operador__detalle" ref={detalleRef} aria-label="Detalle del reporte">
          {seleccionado ? (
            // key: al cambiar de reporte, el detalle arranca de cero (unidad sugerida, grupo, etc.)
            <DetalleReporte
              key={seleccionado.id}
              reporte={seleccionado}
              onCerrar={() => setSeleccionadoId(null)}
              onSeleccionar={seleccionar}
            />
          ) : (
            <div className="detalle-vacio">
              <p>
                <strong>Selecciona un reporte</strong>
              </p>
              <p>En la lista o en el mapa. Aquí verás sus datos, las fotos y los pasos para validarlo y despacharlo.</p>
            </div>
          )}
        </aside>
      </div>

      {aviso && (
        <div className="aviso-flotante" role="status">
          {aviso}
        </div>
      )}
    </div>
  )
}

function filtrarYOrdenar(reportes, { estado, grupos }) {
  return reportes
    .filter((r) => grupos.length === 0 || grupos.includes(r.grupo))
    .filter((r) => {
      if (estado === 'todos') return true
      if (estado === 'activos') return !estaTerminado(r.estado)
      return r.estado === estado
    })
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)) // los más recientes primero
}

// Muestra un aviso de unos segundos cuando llegan reportes nuevos (desde otra pestaña o la simulación)
function useAvisoDeNuevos(reportes) {
  const conocidos = useRef(null)
  const [aviso, setAviso] = useState(null)

  useEffect(() => {
    const ids = new Set(reportes.map((r) => r.id))
    if (conocidos.current) {
      const nuevos = reportes.filter((r) => !conocidos.current.has(r.id))
      if (nuevos.length === 1) {
        const r = nuevos[0]
        setAviso(`Nuevo reporte ${r.id}: ${grupoPorCodigo(r.grupo)?.nombre} en ${r.barrio}`)
      } else if (nuevos.length > 1) {
        setAviso(`Llegaron ${nuevos.length} reportes nuevos`)
      }
    }
    conocidos.current = ids
  }, [reportes])

  useEffect(() => {
    if (!aviso) return
    const temporizador = setTimeout(() => setAviso(null), 5000)
    return () => clearTimeout(temporizador)
  }, [aviso])

  return aviso
}
