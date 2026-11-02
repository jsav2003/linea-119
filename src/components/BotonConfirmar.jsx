import { useEffect, useState } from 'react'

// Botón de dos pasos para acciones que no se pueden deshacer (descartar, borrar todo):
// el primer clic pide confirmación y el segundo la ejecuta. Si no confirma en 4 s, vuelve a su estado.
export default function BotonConfirmar({ children, textoConfirmar = '¿Seguro? Confirmar', onConfirmar, className = '', ...resto }) {
  const [armado, setArmado] = useState(false)

  useEffect(() => {
    if (!armado) return
    const temporizador = setTimeout(() => setArmado(false), 4000)
    return () => clearTimeout(temporizador)
  }, [armado])

  function alHacerClic() {
    if (!armado) {
      setArmado(true)
      return
    }
    setArmado(false)
    onConfirmar()
  }

  return (
    <button type="button" className={`${className}${armado ? ' boton--armado' : ''}`} onClick={alHacerClic} {...resto}>
      {armado ? textoConfirmar : children}
    </button>
  )
}
