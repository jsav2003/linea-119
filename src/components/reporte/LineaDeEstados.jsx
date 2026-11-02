import { ESTADOS, PASOS } from '../../estado/estados.js'
import { hora } from '../../utils/formato.js'

// Línea de tiempo del ciudadano: Recibido → Validado → Unidad despachada → Cerrado
// (si el reporte se descartó: Recibido → Descartado)
export default function LineaDeEstados({ reporte }) {
  const pasos = reporte.estado === ESTADOS.DESCARTADO ? [ESTADOS.RECIBIDO, ESTADOS.DESCARTADO] : PASOS
  const actual = pasos.indexOf(reporte.estado)

  return (
    <ol className="linea-estados">
      {pasos.map((paso, i) => {
        const registro = reporte.historial.find((h) => h.estado === paso)
        const clase = i < actual ? 'hecho' : i === actual ? 'actual' : 'pendiente'
        return (
          <li
            key={paso}
            className={`linea-estados__paso linea-estados__paso--${clase}`}
            aria-current={i === actual ? 'step' : undefined}
          >
            <span className="linea-estados__punto" aria-hidden="true">
              {i <= actual ? '✓' : i + 1}
            </span>
            <span className="linea-estados__nombre">{paso}</span>
            <span className="linea-estados__hora">{registro ? hora(registro.fecha) : ''}</span>
          </li>
        )
      })}
    </ol>
  )
}
