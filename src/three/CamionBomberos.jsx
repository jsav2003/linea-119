import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { colorDeGrupo } from '../data/grupos.js'

const ROJO = colorDeGrupo(100) // el mismo rojo del grupo 100 (Incendios) en toda la app

// Posiciones de las ruedas: eje delantero y doble eje trasero, a ambos lados
const RUEDAS = [1.05, -0.72, -1.22].flatMap((x) => [
  [x, 0.3, 0.52],
  [x, 0.3, -0.52],
])

// Camión de bomberos armado solo con cajas y cilindros (sin modelos externos).
export default function CamionBomberos({ enServicio, onAlternar, reducido }) {
  const elevacion = useRef() // sube un poco cuando el mouse está encima
  const carroceria = useRef() // vibra cuando el motor está encendido
  const escalera = useRef()
  const ruedas = useRef()
  const destelloRojo = useRef()
  const destelloAzul = useRef()
  const [encima, setEncima] = useState(false)
  useCursor(encima) // cursor de mano sobre el camión

  const m = useMateriales()
  const rotulo = useRotulo()

  // useFrame corre en cada cuadro (~60 veces por segundo): aquí van todas las animaciones
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // 1. Sirena: con el mouse encima o en servicio, alterna rojo y azul
    const sirena = enServicio || encima
    const turnoRojo = Math.sin(t * (enServicio ? 10 : 6)) > 0
    const rojo = sirena && (reducido || turnoRojo)
    const azul = sirena && (reducido || !turnoRojo)
    m.sirenaRoja.emissiveIntensity = rojo ? 4 : 0.25
    m.sirenaAzul.emissiveIntensity = azul ? 4 : 0.25
    destelloRojo.current.intensity = rojo ? 9 : 0
    destelloAzul.current.intensity = azul ? 9 : 0

    // 2. Faros: se encienden al salir
    m.faro.emissiveIntensity = THREE.MathUtils.damp(m.faro.emissiveIntensity, enServicio ? 3 : 0.4, 4, delta)

    // 3. Escalera: se levanta al salir a la emergencia (damp = acercarse suavemente al valor)
    escalera.current.rotation.z = THREE.MathUtils.damp(escalera.current.rotation.z, enServicio ? 0.3 : 0, 3, delta)

    // 4. Ruedas: giran sobre su eje mientras avanza
    if (enServicio && !reducido) {
      for (const rueda of ruedas.current.children) rueda.rotation.z -= delta * 7
    }

    // 5. Mouse encima: el camión se eleva un poco. En servicio: vibración del motor
    elevacion.current.position.y = THREE.MathUtils.damp(elevacion.current.position.y, encima ? 0.12 : 0, 8, delta)
    carroceria.current.position.y = enServicio && !reducido ? Math.sin(t * 45) * 0.006 : 0
  })

  return (
    <group position={[0, 0, -0.55]}>
      <group
        ref={elevacion}
        onPointerOver={(e) => {
          e.stopPropagation()
          setEncima(true)
        }}
        onPointerOut={() => setEncima(false)}
        onClick={(e) => {
          e.stopPropagation()
          onAlternar()
        }}
      >
        <group ref={ruedas}>
          {RUEDAS.map((posicion, i) => (
            <Rueda key={i} posicion={posicion} m={m} />
          ))}
        </group>

        <group ref={carroceria}>
          {/* Chasis */}
          <Caja tam={[3.1, 0.18, 0.92]} pos={[0, 0.42, 0]} material={m.gris} />

          {/* Cabina con vidrio, ventanas, parrilla, bómper y espejos */}
          <Caja tam={[0.95, 0.9, 1.1]} pos={[1.12, 0.96, 0]} material={m.rojo} />
          <Caja tam={[0.04, 0.36, 0.96]} pos={[1.6, 1.15, 0]} material={m.vidrio} />
          <Caja tam={[0.48, 0.3, 0.03]} pos={[1.2, 1.15, 0.556]} material={m.vidrio} />
          <Caja tam={[0.48, 0.3, 0.03]} pos={[1.2, 1.15, -0.556]} material={m.vidrio} />
          <Caja tam={[0.04, 0.22, 0.62]} pos={[1.6, 0.66, 0]} material={m.gris} />
          <Caja tam={[0.14, 0.14, 1.14]} pos={[1.64, 0.44, 0]} material={m.metal} />
          <Caja tam={[0.06, 0.2, 0.05]} pos={[1.48, 1.12, 0.62]} material={m.gris} />
          <Caja tam={[0.06, 0.2, 0.05]} pos={[1.48, 1.12, -0.62]} material={m.gris} />
          <Caja tam={[0.05, 0.12, 0.16]} pos={[1.615, 0.72, 0.4]} material={m.faro} />
          <Caja tam={[0.05, 0.12, 0.16]} pos={[1.615, 0.72, -0.4]} material={m.faro} />

          {/* Barra de luces (sirena) sobre la cabina, con luces de color que iluminan alrededor */}
          <Caja tam={[0.26, 0.06, 0.96]} pos={[1.12, 1.44, 0]} material={m.gris} />
          <Caja tam={[0.22, 0.11, 0.4]} pos={[1.12, 1.52, 0.23]} material={m.sirenaRoja} />
          <Caja tam={[0.22, 0.11, 0.4]} pos={[1.12, 1.52, -0.23]} material={m.sirenaAzul} />
          <pointLight ref={destelloRojo} position={[1.35, 1.8, 0.5]} color="#ef4444" distance={6} decay={1.5} intensity={0} />
          <pointLight ref={destelloAzul} position={[1.35, 1.8, -0.5]} color="#3b82f6" distance={6} decay={1.5} intensity={0} />

          {/* Carrocería trasera con franja blanca y el rótulo "BOMBEROS 119" a cada lado */}
          <Caja tam={[2.15, 1.0, 1.12]} pos={[-0.475, 1.0, 0]} material={m.rojo} />
          <Caja tam={[2.17, 0.07, 1.14]} pos={[-0.475, 0.72, 0]} material={m.blanco} />
          <Caja tam={[0.97, 0.07, 1.12]} pos={[1.12, 0.72, 0]} material={m.blanco} />
          <Caja tam={[0.04, 0.85, 1.0]} pos={[-1.56, 1.0, 0]} material={m.gris} />
          <mesh position={[-0.475, 1.12, 0.566]}>
            <planeGeometry args={[1.8, 0.45]} />
            <meshStandardMaterial map={rotulo} transparent polygonOffset polygonOffsetFactor={-2} />
          </mesh>
          <mesh position={[-0.475, 1.12, -0.566]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.8, 0.45]} />
            <meshStandardMaterial map={rotulo} transparent polygonOffset polygonOffsetFactor={-2} />
          </mesh>

          {/* Escalera: gira desde su base trasera para levantarse */}
          <group ref={escalera} position={[-1.42, 1.58, 0]}>
            <Caja tam={[0.3, 0.1, 0.56]} pos={[0, -0.03, 0]} material={m.gris} />
            <Caja tam={[2.3, 0.06, 0.06]} pos={[1.15, 0.04, 0.2]} material={m.metal} />
            <Caja tam={[2.3, 0.06, 0.06]} pos={[1.15, 0.04, -0.2]} material={m.metal} />
            {Array.from({ length: 9 }, (_, i) => (
              <Caja key={i} tam={[0.04, 0.04, 0.4]} pos={[0.15 + i * 0.26, 0.04, 0]} material={m.metal} />
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}

// Una caja con su material: la pieza básica del camión
function Caja({ tam, pos, material }) {
  return (
    <mesh position={pos} material={material} castShadow receiveShadow>
      <boxGeometry args={tam} />
    </mesh>
  )
}

// Rueda = llanta + rin + una barra en el rin (sin la barra no se notaría que gira)
function Rueda({ posicion, m }) {
  const lado = Math.sign(posicion[2]) // +1 o -1: hacia afuera del camión
  return (
    <group position={posicion}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.llanta} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.24, 28]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, lado * 0.121]} material={m.metal}>
        <cylinderGeometry args={[0.16, 0.16, 0.01, 20]} />
      </mesh>
      <mesh position={[0, 0, lado * 0.128]} material={m.gris}>
        <boxGeometry args={[0.26, 0.05, 0.01]} />
      </mesh>
    </group>
  )
}

// Materiales compartidos: se crean una sola vez y se liberan al salir de la página
function useMateriales() {
  const materiales = useMemo(
    () => ({
      rojo: new THREE.MeshStandardMaterial({ color: ROJO, metalness: 0.2, roughness: 0.45 }),
      gris: new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.8 }),
      llanta: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.95 }),
      metal: new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.75, roughness: 0.3 }),
      vidrio: new THREE.MeshStandardMaterial({ color: '#0c2340', metalness: 0.3, roughness: 0.1 }),
      blanco: new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.5 }),
      faro: new THREE.MeshStandardMaterial({ color: '#fef9c3', emissive: '#fde68a', emissiveIntensity: 0.4 }),
      sirenaRoja: new THREE.MeshStandardMaterial({ color: '#7f1d1d', emissive: '#ef4444', emissiveIntensity: 0.25 }),
      sirenaAzul: new THREE.MeshStandardMaterial({ color: '#1e3a8a', emissive: '#3b82f6', emissiveIntensity: 0.25 }),
    }),
    [],
  )
  useEffect(() => () => Object.values(materiales).forEach((material) => material.dispose()), [materiales])
  return materiales
}

// Rótulo "BOMBEROS 119" dibujado en un <canvas> 2D y usado como textura (sin archivos de fuentes)
function useRotulo() {
  const textura = useMemo(() => {
    const lienzo = document.createElement('canvas')
    lienzo.width = 1024
    lienzo.height = 256
    const ctx = lienzo.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'middle'
    ctx.font = '700 96px system-ui, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('BOMBEROS', 36, 132)
    ctx.textAlign = 'right'
    ctx.font = '900 168px system-ui, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('119', 996, 136)
    const t = new THREE.CanvasTexture(lienzo)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [])
  useEffect(() => () => textura.dispose(), [textura])
  return textura
}
