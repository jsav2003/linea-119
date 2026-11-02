import { GRUPOS } from '../../data/grupos.js'

// Los 7 grupos de emergencia como tarjetas: solo se puede elegir uno (radio buttons).
export default function SelectorGrupo({ valor, onCambiar, error }) {
  return (
    <fieldset
      className={`campo selector-grupo${error ? ' campo--error' : ''}`}
      aria-describedby={error ? 'campo-grupo-error' : undefined}
    >
      <legend className="campo__etiqueta">
        Tipo de emergencia <span className="campo__obligatorio" aria-hidden="true">*</span>
      </legend>
      <div className="selector-grupo__opciones">
        {GRUPOS.map((g, i) => (
          <label key={g.codigo} className="tarjeta-grupo tarjeta-grupo--opcion" style={{ '--color': g.color }}>
            <input
              type="radio"
              name="grupo"
              id={i === 0 ? 'campo-grupo' : undefined}
              value={g.codigo}
              checked={valor === g.codigo}
              onChange={() => onCambiar(g.codigo)}
              className="visualmente-oculto"
            />
            <span className="tarjeta-grupo__codigo">{g.codigo}</span>
            <span className="tarjeta-grupo__nombre">{g.nombre}</span>
            <span className="tarjeta-grupo__ejemplos">{g.ejemplos}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="campo__error" id="campo-grupo-error">
          {error}
        </p>
      )}
    </fieldset>
  )
}
