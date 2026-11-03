import { useEffect, useState } from 'react'
import { useAlAparecer } from '../../hooks/useAlAparecer.js'
import { useMenosMovimiento } from '../../hooks/useMenosMovimiento.js'

const DURACION = 1400 // ms

// Tarjeta con un número grande que cuenta desde 0 cuando entra en la pantalla.
// El lector de pantalla oye el valor final de una vez (el número que cambia está oculto para él).
export default function Cifra({ valor, sufijo = '', etiqueta, orden = 0 }) {
  const [ref, visible] = useAlAparecer({ umbral: 0.5 })
  const reducido = useMenosMovimiento()
  const [numero, setNumero] = useState(0)

  useEffect(() => {
    if (!visible || reducido) return
    let inicio = null
    let cuadro = 0
    const paso = (ahora) => {
      inicio ??= ahora
      const avance = Math.min(1, (ahora - inicio) / DURACION)
      setNumero(Math.round(valor * (1 - (1 - avance) ** 3))) // arranca rápido y frena al final
      if (avance < 1) cuadro = requestAnimationFrame(paso)
    }
    cuadro = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(cuadro)
  }, [visible, reducido, valor])

  return (
    <li ref={ref} className={`cifra${visible ? ' cifra--visible' : ''}`} style={{ '--orden': orden }}>
      <p className="cifra__numero" aria-hidden="true">
        {reducido ? valor : numero}
        {sufijo}
      </p>
      <p className="cifra__etiqueta">
        <span className="visualmente-oculto">
          {valor}
          {sufijo}{' '}
        </span>
        {etiqueta}
      </p>
    </li>
  )
}
