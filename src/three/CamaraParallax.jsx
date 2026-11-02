import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// La cámara se mueve un poco siguiendo al mouse (efecto de profundidad) y siempre mira al camión.
// En pantallas angostas (celular) se aleja para que quepa toda la escena.
export default function CamaraParallax({ activa = true }) {
  const { width, height } = useThree((state) => state.size)
  const lejania = width / height < 1.3 ? 1.25 : 1
  const base = useMemo(() => new THREE.Vector3(5, 2.8, 5.9).multiplyScalar(lejania), [lejania])
  const objetivo = useMemo(() => new THREE.Vector3(0, 1, -0.55), [])

  useFrame(({ camera, pointer }, delta) => {
    const x = base.x + (activa ? pointer.x * 0.6 : 0)
    const y = base.y + (activa ? pointer.y * 0.3 : 0)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, x, 2.5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, y, 2.5, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, base.z, 2.5, delta)
    camera.lookAt(objetivo)
  })

  return null
}
