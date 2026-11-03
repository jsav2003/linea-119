import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Contorno } from './estilo.jsx'

const CANTIDAD = 16
const VIDA = 1.6 // segundos
const POR_SEGUNDO = 9
const ESCONDIDA = new THREE.Vector3(0, -50, 0)

// Bocanadas de humo del tubo de escape mientras el camión está en servicio.
// Suben y se quedan atrás (la calle se mueve hacia atrás), crecen y al final se encogen.
export default function Humo({ activo, origen, material }) {
  const malla = useRef()
  const bocanadas = useMemo(
    () => Array.from({ length: CANTIDAD }, () => ({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), edad: VIDA })),
    [],
  )
  const aux = useMemo(() => ({ objeto: new THREE.Object3D(), siguiente: 0, pendientes: 0 }), [])

  useEffect(() => {
    malla.current.traverse((o) => {
      o.frustumCulled = false
    })
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (activo) {
      aux.pendientes += dt * POR_SEGUNDO
      while (aux.pendientes >= 1) {
        aux.pendientes -= 1
        const b = bocanadas[aux.siguiente]
        aux.siguiente = (aux.siguiente + 1) % CANTIDAD
        b.pos.set(...origen)
        b.vel.set(-1.7 + Math.random() * 0.4, 0.75 + Math.random() * 0.3, (Math.random() - 0.5) * 0.25)
        b.edad = 0
      }
    }

    bocanadas.forEach((b, i) => {
      if (b.edad < VIDA) {
        b.edad += dt
        b.pos.addScaledVector(b.vel, dt)
      }
      const viva = b.edad < VIDA
      const final = Math.min(1, (VIDA - b.edad) / (VIDA * 0.25)) // se encoge en el último cuarto de vida
      aux.objeto.position.copy(viva ? b.pos : ESCONDIDA)
      aux.objeto.scale.setScalar(viva ? (0.06 + b.edad * 0.12) * final : 0.0001)
      aux.objeto.updateMatrix()
      malla.current.setMatrixAt(i, aux.objeto.matrix)
    })
    malla.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={malla} args={[undefined, undefined, CANTIDAD]} material={material} frustumCulled={false}>
      <icosahedronGeometry args={[1, 1]} />
      <Contorno grosor={1.5} />
    </instancedMesh>
  )
}
