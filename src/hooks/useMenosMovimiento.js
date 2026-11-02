import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

// true si la persona pidió en su sistema operativo reducir las animaciones.
// La escena 3D lo usa para no hacer destellos ni movimientos innecesarios.
export function useMenosMovimiento() {
  const [reducir, setReducir] = useState(() => window.matchMedia?.(CONSULTA).matches ?? false)
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA)
    const alCambiar = () => setReducir(consulta.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])
  return reducir
}
