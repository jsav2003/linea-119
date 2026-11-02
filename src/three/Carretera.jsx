import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const LARGO = 18
const LINEAS = 9

// Vía con línea central discontinua. Cuando el camión "avanza" no se mueve el camión:
// se mueven las líneas hacia atrás (como en los videojuegos de carros).
export default function Carretera({ enMovimiento }) {
  const lineas = useRef()

  useFrame((_, delta) => {
    if (!enMovimiento) return
    for (const linea of lineas.current.children) {
      linea.position.x -= delta * 6
      if (linea.position.x < -LARGO / 2) linea.position.x += LARGO // vuelve a entrar por delante
    }
  })

  return (
    <group>
      {/* Piso alrededor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Asfalto y andenes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[LARGO, 3.2]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>
      {[1.85, -1.85].map((z) => (
        <mesh key={z} position={[0, 0.06, z]} receiveShadow>
          <boxGeometry args={[LARGO, 0.12, 0.5]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Línea central discontinua */}
      <group ref={lineas}>
        {Array.from({ length: LINEAS }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-LARGO / 2 + (i * LARGO) / LINEAS, 0.005, 0.45]}>
            <planeGeometry args={[0.9, 0.09]} />
            <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.15} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
