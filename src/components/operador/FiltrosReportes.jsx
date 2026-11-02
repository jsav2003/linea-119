import { GRUPOS } from '../../data/grupos.js'
import { ESTADOS } from '../../estado/estados.js'

// Filtros por estado y por grupo (modo emergencia masiva) y el interruptor de agrupación del mapa.
//   filtros: { estado: 'todos' | 'activos' | estado, grupos: [códigos] }  ([] = todos los grupos)
export default function FiltrosReportes({ filtros, onCambiar, agrupar, onAgrupar, total, visibles }) {
  function alternarGrupo(codigo) {
    onCambiar((f) => ({
      ...f,
      grupos: f.grupos.includes(codigo) ? f.grupos.filter((c) => c !== codigo) : [...f.grupos, codigo],
    }))
  }

  return (
    <div className="filtros">
      <div className="filtros__fila">
        <label htmlFor="filtro-estado">Estado</label>
        <select
          id="filtro-estado"
          value={filtros.estado}
          onChange={(e) => onCambiar((f) => ({ ...f, estado: e.target.value }))}
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos (sin cerrar)</option>
          {Object.values(ESTADOS).map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="filtros__grupos">
        <legend>
          Grupos{' '}
          {filtros.grupos.length > 0 && (
            <button type="button" className="enlace" onClick={() => onCambiar((f) => ({ ...f, grupos: [] }))}>
              ver todos
            </button>
          )}
        </legend>
        {GRUPOS.map((g) => (
          <button
            key={g.codigo}
            type="button"
            className="chip-grupo"
            style={{ '--color': g.color }}
            aria-pressed={filtros.grupos.includes(g.codigo)}
            aria-label={`${g.codigo} · ${g.nombre}`}
            onClick={() => alternarGrupo(g.codigo)}
            title={g.nombre}
          >
            {g.codigo}
          </button>
        ))}
      </fieldset>

      <label className="casilla casilla--op">
        <input type="checkbox" checked={agrupar} onChange={(e) => onAgrupar(e.target.checked)} />
        Agrupar reportes cercanos en el mapa
      </label>

      <p className="filtros__conteo" aria-live="polite">
        Mostrando {visibles} de {total} reportes
      </p>
    </div>
  )
}
