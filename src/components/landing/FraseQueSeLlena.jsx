import { useEffect, useRef } from 'react'
import { useMenosMovimiento } from '../../hooks/useMenosMovimiento.js'

// Frase grande en la que cada palabra es un <span> que pasa de gris a blanco, en orden de lectura,
// mientras la frase cruza la pantalla. El gris inicial (#6f6f6f sobre negro) se puede leer:
// al ser texto grande, cumple el contraste AA (3:1).
export default function FraseQueSeLlena({ texto }) {
  const ref = useRef(null)
  const reducido = useMenosMovimiento()
  const palabras = texto.split(' ')

  useEffect(() => {
    const frase = ref.current
    const spans = Array.from(frase.querySelectorAll('.frase__palabra'))
    const pintar = (llenas) => spans.forEach((s, i) => s.classList.toggle('frase__palabra--llena', i < llenas))

    if (reducido) {
      pintar(spans.length)
      return
    }

    let cuadro = 0
    let ultimas = -1
    function calcular() {
      cuadro = 0
      const { top, height } = frase.getBoundingClientRect()
      const alto = window.innerHeight
      // 0 cuando la frase asoma por abajo (85 % de la pantalla); 1 cuando su final sube al 45 %
      const progreso = (alto * 0.85 - top) / (height + alto * 0.4)
      const llenas = Math.round(Math.min(1, Math.max(0, progreso)) * spans.length)
      if (llenas !== ultimas) {
        ultimas = llenas
        pintar(llenas)
      }
    }
    // El scroll se dispara muchas veces por cuadro: se calcula una sola vez por cuadro
    const alDesplazar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(calcular)
    }
    calcular()
    window.addEventListener('scroll', alDesplazar, { passive: true })
    window.addEventListener('resize', alDesplazar)
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', alDesplazar)
      window.removeEventListener('resize', alDesplazar)
    }
  }, [reducido, texto])

  return (
    <p ref={ref} className="frase__texto">
      {palabras.map((palabra, i) => (
        <span key={i}>
          <span className="frase__palabra">{palabra}</span>
          {i < palabras.length - 1 && ' '}
        </span>
      ))}
    </p>
  )
}
