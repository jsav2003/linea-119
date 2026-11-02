import { useEffect, useState } from 'react'

// Devuelve la hora actual (en milisegundos) y se actualiza cada `cadaMs`.
// Sirve para textos como "hace 3 min" que deben avanzar solos.
export function useAhora(cadaMs = 30000) {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), cadaMs)
    return () => clearInterval(id)
  }, [cadaMs])
  return ahora
}
