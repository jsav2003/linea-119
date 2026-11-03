import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { colorDeGrupo } from '../data/grupos.js'
import { Cilindro, Contorno, Pieza, VELOCIDAD_CALLE, useMateriales } from './estilo.jsx'
import ChorroAgua from './ChorroAgua.jsx'
import Humo from './Humo.jsx'

const ROJO = colorDeGrupo(100) // el mismo rojo del grupo 100 (Incendios) en toda la app
const RADIO_RUEDA = 0.3
const DURACION_CHORRO = 2600 // ms que dura el chorro de agua por cada clic
const ESCAPE = [0.625, 1.72, 0.5] // punta del tubo de escape (de ahí sale el humo)

// Posiciones de las ruedas: eje delantero y doble eje trasero, a ambos lados
const RUEDAS = [1.05, -0.72, -1.22].flatMap((x) => [
  [x, RADIO_RUEDA, 0.52],
  [x, RADIO_RUEDA, -0.52],
])

// Puertas de los compartimentos (persianas enrollables) a cada lado de la carrocería
const PUERTAS = [-1.17, -0.475, 0.22]

const MATERIALES = {
  rojo: { color: ROJO },
  rojoOscuro: { color: '#991b1b' },
  negro: { color: '#1a1a1a' },
  llanta: { color: '#151515' },
  gris: { color: '#3a3a3a' },
  metal: { color: '#c9c9c9' },
  blanco: { color: '#f4f4f4' },
  vidrio: { color: '#23272b' },
  brillo: { color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.3 },
  faro: { color: '#fff7d6', emissive: '#ffe9a8', emissiveIntensity: 0.4 },
  ambar: { color: '#b45309', emissive: '#f59e0b', emissiveIntensity: 0.4 },
  stop: { color: '#7f1d1d', emissive: '#ef4444', emissiveIntensity: 0.6 },
  sirenaRoja: { color: '#7f1d1d', emissive: '#ef4444', emissiveIntensity: 0.25 },
  sirenaAzul: { color: '#1e3a8a', emissive: '#3b82f6', emissiveIntensity: 0.25 },
  sirenaBlanca: { color: '#bdbdbd', emissive: '#ffffff', emissiveIntensity: 0.15 },
  manguera: { color: '#e9e2cf' },
  agua: { color: '#ffffff', emissive: '#dbeafe', emissiveIntensity: 0.25 },
  humo: { color: '#9a9a9a' },
}

// Camión de bomberos armado solo con cajas y cilindros (sin modelos externos).
//   - Al cargar la página entra desde la izquierda y frena.
//   - Mouse encima: se encienden las luces de la sirena. Clic: sale a la emergencia
//     (sube y se extiende la escalera, giran las ruedas, se mueve la calle y sale humo).
//   - Clic en el cañón de agua del techo: lanza un chorro durante unos segundos.
export default function CamionBomberos({ enServicio, onAlternar, reducido }) {
  const avance = useRef() // posición durante la entrada
  const elevacion = useRef() // sube un poco cuando el mouse está encima
  const carroceria = useRef() // vibra con el motor y se inclina al frenar
  const escalera = useRef()
  const tramo = useRef() // segundo tramo de la escalera, que se extiende
  const ruedas = useRef()
  const canon = useRef()
  const boquilla = useRef()
  const destelloRojo = useRef()
  const destelloAzul = useRef()
  const [encima, setEncima] = useState(false)
  const [encimaCanon, setEncimaCanon] = useState(false)
  const [disparo, setDisparo] = useState(0) // cuenta los clics en el cañón
  const [chorro, setChorro] = useState(false)
  useCursor(encima || encimaCanon) // cursor de mano sobre el camión y el cañón

  const m = useMateriales(MATERIALES)
  const rotulo = useRotulo()

  // Cada clic en el cañón (re)inicia el chorro
  useEffect(() => {
    if (!disparo) return
    setChorro(true)
    const temporizador = setTimeout(() => setChorro(false), DURACION_CHORRO)
    return () => clearTimeout(temporizador)
  }, [disparo])

  // useFrame corre en cada cuadro (~60 veces por segundo): aquí van todas las animaciones
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05) // si la pestaña estuvo oculta, no dar un salto enorme

    // 1. Entrada: llega desde la izquierda y frena (damp = acercarse suavemente al valor)
    const xAntes = avance.current.position.x
    const x = reducido ? 0 : THREE.MathUtils.damp(xAntes, 0, 1.7, dt)
    avance.current.position.x = Math.abs(x) < 0.002 ? 0 : x
    const velocidadEntrada = (avance.current.position.x - xAntes) / dt

    // 2. Sirena: con el mouse encima o en servicio, alterna rojo y azul; el centro blanco destella
    const sirena = enServicio || encima
    const turnoRojo = Math.sin(t * (enServicio ? 10 : 6)) > 0
    const rojo = sirena && (reducido || turnoRojo)
    const azul = sirena && (reducido || !turnoRojo)
    m.sirenaRoja.emissiveIntensity = rojo ? 4 : 0.25
    m.sirenaAzul.emissiveIntensity = azul ? 4 : 0.25
    m.sirenaBlanca.emissiveIntensity = sirena && !reducido && Math.sin(t * 17) > 0.7 ? 3 : 0.15
    destelloRojo.current.intensity = rojo ? 9 : 0
    destelloAzul.current.intensity = azul ? 9 : 0

    // 3. Faros: se encienden al salir
    m.faro.emissiveIntensity = THREE.MathUtils.damp(m.faro.emissiveIntensity, enServicio ? 3 : 0.4, 4, dt)

    // 4. Escalera: se levanta y el segundo tramo se extiende al salir a la emergencia
    escalera.current.rotation.z = THREE.MathUtils.damp(escalera.current.rotation.z, enServicio ? 0.32 : 0, 3, dt)
    tramo.current.position.x = THREE.MathUtils.damp(tramo.current.position.x, enServicio ? 1.0 : 0, 2.2, dt)

    // 5. Ruedas: giran según lo que "avanza" el camión (en servicio o durante la entrada)
    const rapidez = (enServicio && !reducido ? VELOCIDAD_CALLE : 0) + velocidadEntrada
    for (const rueda of ruedas.current.children) rueda.rotation.z -= (rapidez * dt) / RADIO_RUEDA

    // 6. Mouse encima: se eleva un poco. En servicio: vibración del motor. Al frenar: cabecea hacia adelante
    elevacion.current.position.y = THREE.MathUtils.damp(elevacion.current.position.y, encima ? 0.12 : 0, 8, dt)
    carroceria.current.position.y = enServicio && !reducido ? Math.sin(t * 45) * 0.006 : 0
    carroceria.current.rotation.z = THREE.MathUtils.clamp(-velocidadEntrada * 0.003, -0.045, 0)

    // 7. Cañón: crece con el mouse encima y, mientras lanza agua, barre de lado a lado
    const escalaCanon = THREE.MathUtils.damp(canon.current.scale.x, encimaCanon ? 1.15 : 1, 10, dt)
    canon.current.scale.setScalar(escalaCanon)
    const barrido = chorro && !reducido ? Math.sin(t * 2.2) * 0.3 : 0
    canon.current.rotation.y = THREE.MathUtils.damp(canon.current.rotation.y, barrido, 6, dt)
  })

  return (
    <group position={[0, 0, -0.55]}>
      <group ref={avance} position={[reducido ? 0 : -9, 0, 0]}>
        <group
          ref={elevacion}
          onPointerOver={(e) => {
            e.stopPropagation()
            setEncima(true)
          }}
          onPointerOut={() => setEncima(false)}
          onClick={(e) => {
            e.stopPropagation()
            if (e.delta > 6) return // fue un arrastre para girar la escena, no un clic
            onAlternar()
          }}
        >
          <group ref={ruedas}>
            {RUEDAS.map((posicion, i) => (
              <Rueda key={i} posicion={posicion} m={m} />
            ))}
          </group>

          <group ref={carroceria}>
            {/* Chasis y guardabarros */}
            <Pieza tam={[3.1, 0.18, 0.92]} pos={[0, 0.42, 0]} material={m.gris} />
            <Pieza tam={[0.74, 0.05, 0.3]} pos={[1.05, 0.64, 0.53]} material={m.negro} />
            <Pieza tam={[0.74, 0.05, 0.3]} pos={[1.05, 0.64, -0.53]} material={m.negro} />
            <Pieza tam={[1.24, 0.05, 0.3]} pos={[-0.97, 0.64, 0.53]} material={m.negro} />
            <Pieza tam={[1.24, 0.05, 0.3]} pos={[-0.97, 0.64, -0.53]} material={m.negro} />

            <Cabina m={m} />
            <BarraDeLuces m={m} destelloRojo={destelloRojo} destelloAzul={destelloAzul} />
            <Carroceria m={m} rotulo={rotulo} />
            <Carrete m={m} />

            {/* Tubo de escape entre la cabina y la carrocería */}
            <Cilindro args={[0.035, 0.035, 0.85, 12]} pos={[0.625, 1.28, 0.5]} material={m.metal} contorno={1.5} />

            {/* Escalera: gira desde su base trasera para levantarse; el segundo tramo se desliza */}
            <group ref={escalera} position={[-1.42, 1.58, 0]}>
              <Cilindro args={[0.24, 0.24, 0.07, 24]} pos={[0, -0.045, 0]} material={m.gris} />
              <Pieza tam={[0.3, 0.12, 0.5]} pos={[0, 0.02, 0]} material={m.rojoOscuro} />
              <Pieza tam={[2.3, 0.06, 0.06]} pos={[1.15, 0.06, 0.2]} material={m.metal} contorno={1.5} />
              <Pieza tam={[2.3, 0.06, 0.06]} pos={[1.15, 0.06, -0.2]} material={m.metal} contorno={1.5} />
              {Array.from({ length: 9 }, (_, i) => (
                <Pieza key={i} tam={[0.04, 0.04, 0.4]} pos={[0.15 + i * 0.26, 0.06, 0]} material={m.metal} contorno={1} />
              ))}
              <group ref={tramo}>
                <Pieza tam={[2.0, 0.05, 0.05]} pos={[1.1, 0.13, 0.15]} material={m.blanco} contorno={1.5} />
                <Pieza tam={[2.0, 0.05, 0.05]} pos={[1.1, 0.13, -0.15]} material={m.blanco} contorno={1.5} />
                {Array.from({ length: 8 }, (_, i) => (
                  <Pieza key={i} tam={[0.035, 0.035, 0.3]} pos={[0.25 + i * 0.25, 0.13, 0]} material={m.blanco} contorno={1} />
                ))}
              </group>
            </group>

            {/* Cañón de agua en el techo, del lado que mira a la cámara: se puede tocar para lanzar el chorro */}
            <Cilindro args={[0.11, 0.13, 0.1, 16]} pos={[0.05, 1.55, 0.39]} material={m.negro} />
            <group ref={canon} position={[0.05, 1.62, 0.39]}>
              <mesh material={m.metal} castShadow>
                <sphereGeometry args={[0.08, 16, 12]} />
                <Contorno grosor={1.5} />
              </mesh>
              <group rotation={[0, 0, -(Math.PI / 2 - 0.6)]}>
                <Cilindro args={[0.045, 0.065, 0.5, 14]} pos={[0, 0.25, 0]} material={m.metal} />
                <Cilindro args={[0.065, 0.045, 0.1, 14]} pos={[0, 0.54, 0]} material={m.rojo} />
                <group ref={boquilla} position={[0, 0.6, 0]} />
                {/* Zona invisible más grande que el cañón: así es fácil tocarlo */}
                <mesh
                  position={[0, 0.3, 0]}
                  visible={false}
                  onPointerOver={(e) => {
                    e.stopPropagation()
                    setEncimaCanon(true)
                  }}
                  onPointerOut={() => setEncimaCanon(false)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (e.delta > 6) return
                    setDisparo((n) => n + 1)
                  }}
                >
                  <sphereGeometry args={[0.34, 10, 8]} />
                </mesh>
              </group>
            </group>

            <ChorroAgua activo={chorro} boquilla={boquilla} espacio={carroceria} reducido={reducido} material={m.agua} />
            <Humo activo={enServicio && !reducido} origen={ESCAPE} material={m.humo} />
          </group>
        </group>
      </group>
    </group>
  )
}

// Cabina: vidrios con reflejo, puerta, manija, estribo, espejos, parrilla, faros y bómper
function Cabina({ m }) {
  return (
    <>
      <RoundedBox args={[0.95, 0.9, 1.1]} radius={0.06} smoothness={3} position={[1.12, 0.96, 0]} material={m.rojo} castShadow receiveShadow>
        <Contorno grosor={2.5} />
      </RoundedBox>
      <Pieza tam={[0.04, 0.36, 0.96]} pos={[1.6, 1.15, 0]} material={m.vidrio} contorno={1.5} />
      <Pieza tam={[0.01, 0.05, 0.28]} pos={[1.625, 1.2, 0.18]} rot={[0.7, 0, 0]} material={m.brillo} contorno={0} sombra={false} />
      <Pieza tam={[0.01, 0.03, 0.18]} pos={[1.625, 1.12, 0.26]} rot={[0.7, 0, 0]} material={m.brillo} contorno={0} sombra={false} />
      {[1, -1].map((lado) => (
        <group key={lado}>
          <Pieza tam={[0.48, 0.3, 0.03]} pos={[1.2, 1.15, lado * 0.556]} material={m.vidrio} contorno={1.5} />
          <Pieza tam={[0.012, 0.62, 0.006]} pos={[0.9, 0.93, lado * 0.553]} material={m.negro} contorno={0} sombra={false} />
          <Pieza tam={[0.09, 0.025, 0.02]} pos={[1.0, 0.95, lado * 0.562]} material={m.metal} contorno={1} />
          <Pieza tam={[0.3, 0.04, 0.14]} pos={[1.15, 0.5, lado * 0.6]} material={m.metal} contorno={1.5} />
          <Pieza tam={[0.06, 0.04, 0.12]} pos={[1.5, 1.2, lado * 0.6]} material={m.gris} contorno={1} />
          <Pieza tam={[0.05, 0.22, 0.08]} pos={[1.5, 1.12, lado * 0.67]} material={m.gris} contorno={1.5} />
          <Cilindro args={[0.065, 0.065, 0.04, 18]} pos={[1.62, 0.74, lado * 0.42]} rot={[0, 0, Math.PI / 2]} material={m.faro} contorno={1.5} />
          <Pieza tam={[0.03, 0.05, 0.08]} pos={[1.61, 0.62, lado * 0.47]} material={m.ambar} contorno={1} />
        </group>
      ))}
      {/* Parrilla con barras, bómper y placa */}
      <Pieza tam={[0.04, 0.24, 0.66]} pos={[1.6, 0.66, 0]} material={m.negro} contorno={1.5} />
      {[0.6, 0.66, 0.72].map((y) => (
        <Pieza key={y} tam={[0.05, 0.022, 0.6]} pos={[1.615, y, 0]} material={m.metal} contorno={0} sombra={false} />
      ))}
      <Pieza tam={[0.14, 0.14, 1.14]} pos={[1.64, 0.44, 0]} material={m.metal} />
      <Pieza tam={[0.02, 0.09, 0.24]} pos={[1.715, 0.44, 0]} material={m.blanco} contorno={1} />
      {/* Antena */}
      <Cilindro args={[0.008, 0.008, 0.35, 6]} pos={[0.75, 1.58, -0.4]} material={m.gris} contorno={1} />
    </>
  )
}

// Barra de luces sobre la cabina: rojo, rojo, blanco, azul, azul. Las luces de color iluminan alrededor.
function BarraDeLuces({ m, destelloRojo, destelloAzul }) {
  const segmentos = [
    [0.38, m.sirenaRoja],
    [0.19, m.sirenaRoja],
    [0, m.sirenaBlanca],
    [-0.19, m.sirenaAzul],
    [-0.38, m.sirenaAzul],
  ]
  return (
    <>
      <Pieza tam={[0.26, 0.06, 1.0]} pos={[1.12, 1.44, 0]} material={m.negro} contorno={1.5} />
      {segmentos.map(([z, material]) => (
        <Pieza key={z} tam={[0.22, 0.1, 0.17]} pos={[1.12, 1.52, z]} material={material} contorno={1.5} />
      ))}
      <pointLight ref={destelloRojo} position={[1.35, 1.8, 0.5]} color="#ef4444" distance={6} decay={1.5} intensity={0} />
      <pointLight ref={destelloAzul} position={[1.35, 1.8, -0.5]} color="#3b82f6" distance={6} decay={1.5} intensity={0} />
    </>
  )
}

// Carrocería trasera: franja blanca, rótulo "BOMBEROS 119", persianas de los compartimentos y luces traseras
function Carroceria({ m, rotulo }) {
  return (
    <>
      <RoundedBox args={[2.15, 1.0, 1.12]} radius={0.05} smoothness={3} position={[-0.475, 1.0, 0]} material={m.rojo} castShadow receiveShadow>
        <Contorno grosor={2.5} />
      </RoundedBox>
      <Pieza tam={[2.17, 0.07, 1.14]} pos={[-0.475, 0.72, 0]} material={m.blanco} contorno={1.5} />
      <Pieza tam={[0.97, 0.07, 1.12]} pos={[1.12, 0.72, 0]} material={m.blanco} contorno={1.5} />

      {[1, -1].map((lado) => (
        <group key={lado}>
          <mesh position={[-0.475, 1.32, lado * 0.566]} rotation={[0, lado > 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[1.5, 0.3]} />
            <meshBasicMaterial map={rotulo} transparent polygonOffset polygonOffsetFactor={-2} />
          </mesh>
          {PUERTAS.map((x) => (
            <group key={x} position={[x, 0.98, lado * 0.565]}>
              <Pieza tam={[0.62, 0.36, 0.012]} material={m.metal} contorno={1.5} />
              {[-0.09, 0, 0.09].map((y) => (
                <Pieza key={y} tam={[0.56, 0.012, 0.006]} pos={[0, y, lado * 0.008]} material={m.gris} contorno={0} sombra={false} />
              ))}
              <Pieza tam={[0.1, 0.025, 0.02]} pos={[0, -0.15, lado * 0.012]} material={m.negro} contorno={0} sombra={false} />
            </group>
          ))}
          <Pieza tam={[0.03, 0.1, 0.12]} pos={[-1.585, 0.66, lado * 0.44]} material={m.stop} contorno={1} />
        </group>
      ))}

      <Pieza tam={[0.04, 0.85, 1.0]} pos={[-1.56, 1.0, 0]} material={m.gris} contorno={1.5} />
      <Pieza tam={[0.12, 0.08, 1.04]} pos={[-1.6, 0.46, 0]} material={m.metal} contorno={1.5} />
    </>
  )
}

// Carrete de manguera en la parte de atrás
function Carrete({ m }) {
  return (
    <group position={[-1.66, 1.05, 0]} rotation={[0, 0, Math.PI / 2]}>
      <Cilindro args={[0.2, 0.2, 0.16, 24]} material={m.gris} />
      {[-0.045, 0, 0.045].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.manguera} castShadow>
          <torusGeometry args={[0.2, 0.03, 8, 28]} />
          <Contorno grosor={1} />
        </mesh>
      ))}
    </group>
  )
}

// Rueda = llanta + rin + 5 rayos + tapa (los rayos dejan ver que gira)
function Rueda({ posicion, m }) {
  const lado = Math.sign(posicion[2]) // +1 o -1: hacia afuera del camión
  return (
    <group position={posicion}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.llanta} castShadow>
        <cylinderGeometry args={[RADIO_RUEDA, RADIO_RUEDA, 0.24, 28]} />
        <Contorno grosor={2.5} />
      </mesh>
      <Cilindro args={[0.17, 0.17, 0.012, 24]} pos={[0, 0, lado * 0.121]} rot={[Math.PI / 2, 0, 0]} material={m.metal} contorno={1} sombra={false} />
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i / 5) * Math.PI * 2
        return (
          <Pieza
            key={i}
            tam={[0.03, 0.15, 0.006]}
            pos={[Math.cos(a) * 0.075, Math.sin(a) * 0.075, lado * 0.13]}
            rot={[0, 0, a - Math.PI / 2]}
            material={m.gris}
            contorno={0}
            sombra={false}
          />
        )
      })}
      <Cilindro args={[0.045, 0.045, 0.02, 12]} pos={[0, 0, lado * 0.135]} rot={[Math.PI / 2, 0, 0]} material={m.negro} contorno={1} sombra={false} />
    </group>
  )
}

// Rótulo "BOMBEROS 119" dibujado en un <canvas> 2D y usado como textura (sin archivos de fuentes).
// Se dibuja con la letra del sistema y se redibuja con Archivo cuando la fuente termina de cargar.
function useRotulo() {
  const { textura, dibujar } = useMemo(() => {
    const lienzo = document.createElement('canvas')
    lienzo.width = 1024
    lienzo.height = 205
    const ctx = lienzo.getContext('2d')
    const t = new THREE.CanvasTexture(lienzo)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    const dibujar = () => {
      const letra = "'Archivo', system-ui, 'Segoe UI', Roboto, sans-serif"
      ctx.clearRect(0, 0, lienzo.width, lienzo.height)
      if ('fontStretch' in ctx) ctx.fontStretch = 'semi-expanded'
      ctx.fillStyle = '#ffffff'
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'left'
      ctx.font = `800 88px ${letra}`
      ctx.fillText('BOMBEROS', 24, 108)
      ctx.textAlign = 'right'
      ctx.font = `900 170px ${letra}`
      ctx.fillText('119', 1000, 112)
      t.needsUpdate = true
    }
    dibujar()
    return { textura: t, dibujar }
  }, [])

  useEffect(() => {
    let vigente = true
    document.fonts?.load("800 88px 'Archivo'").then(() => vigente && dibujar())
    return () => {
      vigente = false
    }
  }, [dibujar])
  useEffect(() => () => textura.dispose(), [textura])
  return textura
}
