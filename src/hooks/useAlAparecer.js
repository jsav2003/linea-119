import { useEffect, useRef, useState } from 'react'
import { useMenosMovimiento } from './useMenosMovimiento.js'

// Devuelve [ref, visible]: `visible` pasa a true la primera vez que el elemento entra en la pantalla
// (IntersectionObserver) y ya no vuelve a false. Con movimiento reducido es true desde el inicio,
// así todo aparece ya en su lugar.
export function useAlAparecer({ umbral = 0.2, margen = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null)
  const reducido = useMenosMovimiento()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible || reducido) return
    const elemento = ref.current
    if (!elemento || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { threshold: umbral, rootMargin: margen },
    )
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [visible, reducido, umbral, margen])

  return [ref, visible || reducido]
}
