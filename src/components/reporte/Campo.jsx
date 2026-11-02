// Piezas del formulario: cada campo une su etiqueta, su ayuda y su mensaje de error
// al control (aria-describedby / aria-invalid), así un lector de pantalla los anuncia juntos.

// Props de accesibilidad para el control de un campo
function propsAria(id, ayuda, error) {
  const describe = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ')
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describe || undefined,
    'aria-required': true,
  }
}

function Etiqueta({ texto, opcional }) {
  return (
    <>
      {texto}
      {opcional ? (
        <span className="campo__opcional"> (opcional)</span>
      ) : (
        <span className="campo__obligatorio" aria-hidden="true"> *</span>
      )}
    </>
  )
}

// Contenedor genérico: etiqueta + ayuda + control (children) + error
export function Campo({ id, etiqueta, ayuda, error, opcional = false, children }) {
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label className="campo__etiqueta" htmlFor={id}>
        <Etiqueta texto={etiqueta} opcional={opcional} />
      </label>
      {ayuda && (
        <p className="campo__ayuda" id={`${id}-ayuda`}>
          {ayuda}
        </p>
      )}
      {children}
      {error && (
        <p className="campo__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

// Campo de texto (input o textarea). `despues` se dibuja debajo del control.
export function CampoTexto({ id, etiqueta, ayuda, error, multilinea = false, despues = null, ...control }) {
  const Control = multilinea ? 'textarea' : 'input'
  return (
    <Campo id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <Control className="campo__control" {...propsAria(id, ayuda, error)} {...control} />
      {despues}
    </Campo>
  )
}

// Lista desplegable
export function CampoSelect({ id, etiqueta, ayuda, error, children, ...control }) {
  return (
    <Campo id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <select className="campo__control" {...propsAria(id, ayuda, error)} {...control}>
        {children}
      </select>
    </Campo>
  )
}

// Grupo de opciones (radio buttons con forma de botón)
export function Opciones({ nombre, etiqueta, opciones, valor, onCambiar, error }) {
  const id = `campo-${nombre}`
  return (
    <fieldset
      className={`campo campo--opciones${error ? ' campo--error' : ''}`}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className="campo__etiqueta">
        <Etiqueta texto={etiqueta} />
      </legend>
      <div className="opciones">
        {opciones.map((opcion, i) => (
          <label key={opcion} className="opcion">
            <input
              type="radio"
              name={nombre}
              id={i === 0 ? id : undefined}
              value={opcion}
              checked={valor === opcion}
              onChange={() => onCambiar(opcion)}
            />
            <span>{opcion}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="campo__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  )
}
