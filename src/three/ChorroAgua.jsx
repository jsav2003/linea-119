import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Contorno } from './estilo.jsx'

const CANTIDAD = 90 // gotas (una sola malla instanciada: un solo dibujo para todas)
const VIDA = 0.95 // segundos que dura cada gota en el aire
const GRAVEDAD = 7
const RAPIDEZ = 5.2
const ESCONDIDA = new THREE.Vector3(0, -50, 0) // las gotas que no se usan se guardan bajo el piso

// Chorro de agua del cañón: gotas que salen de la boquilla y caen en parábola.
//   boquilla: ref de un objeto en la punta del cañón (su eje +y es la dirección del chorro)
//   espacio:  ref del grupo en cuyas coordenadas viven las gotas (la carrocería)
// Con movimiento reducido el chorro aparece quieto, dibujado como un arco.
export default function ChorroAgua({ activo, boquilla, espacio, reducido, material }) {
  const malla = useRef()
  const gotas = useMemo(
    () => Array.from({ length: CANTIDAD }, () => ({ pos: new THREE.Vector3(), vel: new THREE.Vector3(), edad: VIDA })),
    [],
  )
  const aux = useMemo(
    () => ({ objeto: new THREE.Object3D(), punta: new THREE.Vector3(), frente: new THREE.Vector3(), dir: new THREE.Vector3(), siguiente: 0, pendientes: 0 }),
    [],
  )

  // Las gotas se mueven por toda la escena: que three.js no las descarte por estar "fuera de cámara"
  useEffect(() => {
    malla.current.traverse((o) => {
      o.frustumCulled = false
    })
  }, [])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const { objeto, punta, frente, dir } = aux

    // Punta del cañón y dirección del chorro, en las coordenadas de la carrocería
    boquilla.current.getWorldPosition(punta)
    espacio.current.worldToLocal(punta)
    boquilla.current.localToWorld(frente.set(0, 1, 0))
    espacio.current.worldToLocal(frente)
    dir.subVectors(frente, punta).normalize()

    if (reducido) {
      gotas.forEach((g, i) => {
        const t = (i / CANTIDAD) * VIDA
        g.edad = activo ? t : VIDA
        g.pos.copy(punta).addScaledVector(dir, RAPIDEZ * t)
        g.pos.y -= 0.5 * GRAVEDAD * t * t
      })
    } else {
      // Mientras está activo salen gotas nuevas a ritmo constante (reutilizando las que ya cayeron)
      if (activo) {
        aux.pendientes += dt * (CANTIDAD / VIDA)
        while (aux.pendientes >= 1) {
          aux.pendientes -= 1
          const g = gotas[aux.siguiente]
          aux.siguiente = (aux.siguiente + 1) % CANTIDAD
          g.pos.copy(punta)
          g.vel.copy(dir).multiplyScalar(RAPIDEZ)
          g.vel.x += (Math.random() - 0.5) * 0.5
          g.vel.y += (Math.random() - 0.5) * 0.5
          g.vel.z += (Math.random() - 0.5) * 0.5
          g.edad = 0
        }
      }
      for (const g of gotas) {
        if (g.edad >= VIDA) continue
        g.edad += dt
        g.vel.y -= GRAVEDAD * dt
        g.pos.addScaledVector(g.vel, dt)
        if (g.pos.y < 0.03) g.edad = VIDA // llegó al piso
      }
    }

    // Cada gota crece un poco mientras vuela (el chorro se abre)
    gotas.forEach((g, i) => {
      const viva = g.edad < VIDA
      objeto.position.copy(viva ? g.pos : ESCONDIDA)
      objeto.scale.setScalar(viva ? 0.035 + g.edad * 0.09 : 0.0001)
      objeto.updateMatrix()
      malla.current.setMatrixAt(i, objeto.matrix)
    })
    malla.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={malla} args={[undefined, undefined, CANTIDAD]} material={material} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <Contorno grosor={1.5} />
    </instancedMesh>
  )
}
