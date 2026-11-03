import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'

// Estilo brutalista de la escena: colores planos (MeshToonMaterial con 3 tonos, sin degradados)
// y un contorno negro grueso alrededor de cada pieza, como un dibujo de cómic.

export const TINTA = '#0b0b0b'
export const PAPEL = '#dadada'
export const VELOCIDAD_CALLE = 6 // unidades por segundo: la calle, los edificios y las ruedas usan la misma

// Rampa de luz de 3 escalones (sombra, medio, luz). NearestFilter: cambios bruscos, sin suavizar.
let rampa = null
export function rampaToon() {
  if (!rampa) {
    const tonos = new Uint8Array([105, 185, 255])
    rampa = new THREE.DataTexture(tonos, tonos.length, 1, THREE.RedFormat)
    rampa.minFilter = THREE.NearestFilter
    rampa.magFilter = THREE.NearestFilter
    rampa.needsUpdate = true
  }
  return rampa
}

// Crea los materiales de una lista { nombre: { color, emissive… } } una sola vez y los libera al salir.
// La lista debe ser una constante fuera del componente (si no, se recrearían en cada render).
export function useMateriales(definiciones) {
  const materiales = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(definiciones).map(([nombre, def]) => [
          nombre,
          new THREE.MeshToonMaterial({ gradientMap: rampaToon(), ...def }),
        ]),
      ),
    [definiciones],
  )
  useEffect(() => () => Object.values(materiales).forEach((m) => m.dispose()), [materiales])
  return materiales
}

// Contorno negro. `grosor` va en píxeles de pantalla (se multiplica por la densidad de la pantalla).
export function Contorno({ grosor = 2 }) {
  const dpr = useThree((estado) => estado.viewport.dpr)
  return <Outlines thickness={grosor * dpr} color={TINTA} />
}

// Caja con su material y su contorno: la pieza básica de la escena
export function Pieza({ tam, pos, rot, material, contorno = 2, sombra = true, children, ...resto }) {
  return (
    <mesh position={pos} rotation={rot} material={material} castShadow={sombra} receiveShadow {...resto}>
      <boxGeometry args={tam} />
      {contorno > 0 && <Contorno grosor={contorno} />}
      {children}
    </mesh>
  )
}

// Cilindro: args = [radio arriba, radio abajo, alto, lados]
export function Cilindro({ args, pos, rot, material, contorno = 2, sombra = true, ...resto }) {
  return (
    <mesh position={pos} rotation={rot} material={material} castShadow={sombra} receiveShadow {...resto}>
      <cylinderGeometry args={args} />
      {contorno > 0 && <Contorno grosor={contorno} />}
    </mesh>
  )
}

// Mueve los hijos de un grupo hacia atrás (eje x) y los vuelve a poner adelante al salir:
// así parece que el camión avanza aunque esté quieto (como en los videojuegos de carros).
export function useDesplazamiento(grupo, activo, largo, velocidad = VELOCIDAD_CALLE) {
  useFrame((_, delta) => {
    if (!activo || !grupo.current) return
    const paso = Math.min(delta, 0.05) * velocidad
    for (const hijo of grupo.current.children) {
      hijo.position.x -= paso
      if (hijo.position.x < -largo / 2) hijo.position.x += largo
    }
  })
}
