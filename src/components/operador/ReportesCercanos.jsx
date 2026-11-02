import { InsigniaEstado, InsigniaGrupo } from '../Insignias.jsx'
import { reportesCercanos } from '../../utils/geo.js'
import { hora } from '../../utils/formato.js'

// Extra (emergencia masiva): reportes a menos de 500 m y 1 hora de este.
// Probablemente son la misma emergencia: el operador los revisa y descarta los duplicados.
export default function ReportesCercanos({ reporte, reportes, onSeleccionar }) {
  const cercanos = reportesCercanos(reporte, reportes)
  if (cercanos.length === 0) return null

  return (
    <section className="detalle__seccion">
      <h3 className="detalle__subtitulo">Posibles duplicados ({cercanos.length})</h3>
      <p className="pista">A menos de 500 m y 1 hora de este reporte: pueden ser la misma emergencia.</p>
      <ul className="cercanos">
        {cercanos.slice(0, 8).map(({ reporte: otro, metros }) => (
          <li key={otro.id}>
            <button type="button" onClick={() => onSeleccionar(otro.id)}>
              <InsigniaGrupo codigo={otro.grupo} />
              <span className="cercanos__texto">
                …{otro.id.slice(-4)} · a {Math.round(metros)} m · <span className="sin-corte">{hora(otro.creadoEn)}</span>
              </span>
              <InsigniaEstado estado={otro.estado} />
            </button>
          </li>
        ))}
      </ul>
      {cercanos.length > 8 && <p className="pista">y {cercanos.length - 8} más.</p>}
    </section>
  )
}
