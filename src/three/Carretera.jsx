import { useRef } from 'react'
import { PAPEL, Pieza, useDesplazamiento, useMateriales } from './estilo.jsx'

const LARGO = 44 // más largo de lo que alcanza a ver la cámara: así no se ven los bordes
const LARGO_LINEAS = 30
const LINEAS = 15

const MATERIALES = {
  piso: { color: PAPEL },
  asfalto: { color: '#2b2b2b' },
  anden: { color: '#ececec' },
  linea: { color: '#f4f4f4', emissive: '#f4f4f4', emissiveIntensity: 0.2 },
}

// Vía con línea central discontinua, andén delgado adelante y andén ancho atrás (donde van los edificios).
// Cuando el camión "avanza" no se mueve el camión: se mueven las líneas hacia atrás.
export default function Carretera({ enMovimiento }) {
  const lineas = useRef()
  const m = useMateriales(MATERIALES)
  useDesplazamiento(lineas, enMovimiento, LARGO_LINEAS)

  return (
    <group>
      {/* Piso alrededor, del mismo gris papel del fondo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={m.piso} receiveShadow>
        <planeGeometry args={[80, 80]} />
      </mesh>

      {/* Asfalto y andenes (el contorno negro marca los bordes) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.asfalto} receiveShadow>
        <planeGeometry args={[LARGO, 3.2]} />
      </mesh>
      <Pieza tam={[LARGO, 0.12, 0.5]} pos={[0, 0.06, 1.85]} material={m.anden} sombra={false} />
      <Pieza tam={[LARGO, 0.12, 2.3]} pos={[0, 0.06, -2.75]} material={m.anden} sombra={false} />

      {/* Línea central discontinua */}
      <group ref={lineas}>
        {Array.from({ length: LINEAS }, (_, i) => (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-LARGO_LINEAS / 2 + (i * LARGO_LINEAS) / LINEAS, 0.005, 0.45]}
            material={m.linea}
          >
            <planeGeometry args={[0.9, 0.09]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
