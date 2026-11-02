import { InsigniaEstado } from './Insignias.jsx'
import { hora } from '../utils/formato.js'

// Todo lo que ha pasado con un reporte, en orden de tiempo
export default function Historial({ entradas }) {
  return (
    <ol className="historial">
      {entradas.map((entrada, i) => (
        <li key={i} className="historial__entrada">
          <time className="historial__hora" dateTime={entrada.fecha}>
            {hora(entrada.fecha)}
          </time>
          <span className="historial__texto">
            {entrada.estado && <InsigniaEstado estado={entrada.estado} />} {entrada.texto}
          </span>
        </li>
      ))}
    </ol>
  )
}
