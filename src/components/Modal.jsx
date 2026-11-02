import { useEffect, useId, useRef } from 'react'

// Ventana flotante accesible con el elemento <dialog> del navegador:
// mantiene el foco adentro, se cierra con Escape y oscurece el fondo.
export default function Modal({ abierto, onCerrar, titulo, grande = false, children }) {
  const ref = useRef(null)
  const idTitulo = useId()

  useEffect(() => {
    const dialogo = ref.current
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  function alHacerClic(evento) {
    // El clic en el fondo oscuro llega al <dialog> mismo (no a su contenido)
    if (evento.target === ref.current) onCerrar()
  }

  return (
    <dialog
      ref={ref}
      className={`modal${grande ? ' modal--grande' : ''}`}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={alHacerClic}
    >
      <div className="modal__contenido">
        <header className="modal__encabezado">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="modal__cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
