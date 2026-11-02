import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { GRUPOS } from '../data/grupos.js'

const RADIO = 3.1
const ALTURA = 2.25

// Los 7 grupos de emergencia como pines del mapa (mismos colores que en el mapa del operador),
// flotando en un anillo que gira alrededor del camión.
export default function PinesGrupos({ onElegir, reducido }) {
  const anillo = useRef()
  const [activo, setActivo] = useState(null) // código del pin que tiene el mouse encima
  useCursor(activo !== null)

  useFrame((_, delta) => {
    // El anillo gira despacio; se detiene mientras el mouse está sobre un pin
    if (!reducido && activo === null) anillo.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={anillo} position={[0, 0, -0.55]}>
      {GRUPOS.map((grupo, i) => {
        const angulo = (i / GRUPOS.length) * Math.PI * 2
        return (
          <Pin
            key={grupo.codigo}
            grupo={grupo}
            posicion={[Math.cos(angulo) * RADIO, ALTURA, Math.sin(angulo) * RADIO]}
            fase={i}
            activo={activo === grupo.codigo}
            onEncima={() => setActivo(grupo.codigo)}
            onFuera={() => setActivo((actual) => (actual === grupo.codigo ? null : actual))}
            onElegir={() => onElegir?.(grupo.codigo)}
            reducido={reducido}
          />
        )
      })}
    </group>
  )
}

function Pin({ grupo, posicion, fase, activo, onEncima, onFuera, onElegir, reducido }) {
  const ref = useRef()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    // Flota arriba y abajo (cada pin con su propia fase) y gira sobre sí mismo
    ref.current.position.y = posicion[1] + (reducido ? 0 : Math.sin(t * 1.6 + fase) * 0.12)
    if (!reducido) ref.current.rotation.y += delta * 0.8
    // Con el mouse encima crece suavemente
    const escala = THREE.MathUtils.damp(ref.current.scale.x, activo ? 1.4 : 1, 8, delta)
    ref.current.scale.setScalar(escala)
  })

  return (
    <group
      ref={ref}
      position={posicion}
      onPointerOver={(e) => {
        e.stopPropagation()
        onEncima()
      }}
      onPointerOut={onFuera}
      onClick={(e) => {
        e.stopPropagation()
        onElegir()
      }}
    >
      {/* Zona invisible más grande que el pin: así es fácil apuntarle con el mouse aunque se mueva */}
      <mesh position={[0, 0.1, 0]} visible={false}>
        <sphereGeometry args={[0.45, 12, 8]} />
      </mesh>

      {/* Cabeza redonda + punta (cono invertido): la misma forma de gota del pin del mapa */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 16]} />
        <meshStandardMaterial color={grupo.color} emissive={grupo.color} emissiveIntensity={activo ? 0.9 : 0.35} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.4, 24]} />
        <meshStandardMaterial color={grupo.color} emissive={grupo.color} emissiveIntensity={activo ? 0.9 : 0.35} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <torusGeometry args={[0.2, 0.025, 8, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {activo && (
        <Html center position={[0, 0.75, 0]} zIndexRange={[20, 0]}>
          <div className="etiqueta-3d" style={{ '--color': grupo.color }}>
            <strong>{grupo.codigo}</strong> {grupo.nombre}
            <small>Clic para reportar</small>
          </div>
        </Html>
      )}
    </group>
  )
}
