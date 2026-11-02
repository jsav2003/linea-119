import { grupoPorCodigo } from '../data/grupos.js'
import { CLASE_ESTADO } from '../estado/estados.js'

// Chip con el color y el código del grupo de emergencia (y, si se pide, el nombre)
export function InsigniaGrupo({ codigo, conNombre = false }) {
  const grupo = grupoPorCodigo(codigo)
  return (
    <span className="insignia-grupo" style={{ '--color': grupo?.color ?? '#6b7280' }} title={grupo?.nombre}>
      <span className="insignia-grupo__punto" aria-hidden="true" />
      <span className="insignia-grupo__codigo">{codigo}</span>
      {conNombre && <span className="insignia-grupo__nombre">{grupo?.nombre}</span>}
    </span>
  )
}

// Etiqueta del estado del reporte (Recibido, Validado…) con su color
export function InsigniaEstado({ estado }) {
  return <span className={`insignia-estado insignia-estado--${CLASE_ESTADO[estado]}`}>{estado}</span>
}
