import { InsigniaEstado, InsigniaGrupo } from '../Insignias.jsx'
import { colorDeGrupo } from '../../data/grupos.js'
import { esCritico, estaTerminado } from '../../estado/estados.js'
import { useAhora } from '../../hooks/useAhora.js'
import { haceCuanto, hora } from '../../utils/formato.js'

// Lista de reportes: color y código del grupo, hora, barrio y estado.
// Al hacer clic, el mapa vuela al reporte y se abre su detalle.
export default function ListaReportes({ reportes, seleccionadoId, onSeleccionar, hayReportes }) {
  const ahora = useAhora(30000)

  if (!hayReportes) {
    return (
      <div className="lista-vacia">
        <p>
          <strong>Aún no hay reportes.</strong>
        </p>
        <p>
          Envía uno desde el{' '}
          <a href="/reportar" target="_blank" rel="noreferrer">
            formulario del ciudadano
          </a>{' '}
          (se abre en otra pestaña y llega aquí al instante) o usa «Simular 50 reportes».
        </p>
      </div>
    )
  }

  if (reportes.length === 0) return <p className="lista-vacia">Ningún reporte coincide con los filtros.</p>

  return (
    <ul className="lista-reportes">
      {reportes.map((r) => {
        const activo = r.id === seleccionadoId
        return (
          <li key={r.id}>
            <button
              type="button"
              className={`item-reporte${activo ? ' item-reporte--activo' : ''}${estaTerminado(r.estado) ? ' item-reporte--apagado' : ''}`}
              style={{ '--color': colorDeGrupo(r.grupo) }}
              onClick={() => onSeleccionar(r.id)}
              aria-current={activo ? 'true' : undefined}
            >
              <span className="item-reporte__fila">
                <InsigniaGrupo codigo={r.grupo} />
                {esCritico(r) && <span className="critico">⚠ Crítico</span>}
                <span className="item-reporte__hora">
                  {hora(r.creadoEn)} · {haceCuanto(r.creadoEn, ahora)}
                </span>
              </span>
              <span className="item-reporte__barrio">{r.barrio}</span>
              <span className="item-reporte__que-ve">{r.queVe}</span>
              <span className="item-reporte__fila">
                {/* key: al cambiar de estado, la insignia se crea de nuevo y entra con una transición */}
                <InsigniaEstado key={r.estado} estado={r.estado} />
                <span className="item-reporte__extras">
                  {r.fotos?.length > 0 && <span title="Fotos">📷 {r.fotos.length}</span>}
                  {r.video && <span title="Video">🎥</span>}
                  {r.solicitudInfo && !r.solicitudInfo.respuesta && <span title="Esperando respuesta del ciudadano">💬</span>}
                  {r.simulado && <span className="item-reporte__simulado">simulado</span>}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
