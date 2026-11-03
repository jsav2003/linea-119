import { useEffect, useRef, useState } from 'react'
import { useMenosMovimiento } from '../../hooks/useMenosMovimiento.js'

const DURACION = 450 // ms

// Número que, al cambiar, pasa contando del valor anterior al nuevo y da un pequeño salto.
// Con movimiento reducido cambia de una vez.
export default function NumeroAnimado({ valor }) {
  const reducido = useMenosMovimiento()
  const [mostrado, setMostrado] = useState(valor)
  const anterior = useRef(valor)

  useEffect(() => {
    const desde = anterior.current
    anterior.current = valor
    if (desde === valor) return
    if (reducido) {
      setMostrado(valor)
      return
    }
    let inicio = null
    let cuadro = 0
    const paso = (ahora) => {
      inicio ??= ahora
      const avance = Math.min(1, (ahora - inicio) / DURACION)
      setMostrado(Math.round(desde + (valor - desde) * (1 - (1 - avance) ** 3)))
      if (avance < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [valor, reducido])

  // key={valor}: cada cambio crea el <span> de nuevo y la animación de salto (CSS) se repite
  return (
    <span key={valor} className="numero-animado">
      {mostrado}
    </span>
  )
}
