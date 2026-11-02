import { useEffect } from 'react'

// Cambia el título de la pestaña del navegador según la pantalla
export function useTitulo(titulo) {
  useEffect(() => {
    document.title = `${titulo} · Línea 119 Bomberos Cali`
  }, [titulo])
}
