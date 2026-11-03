import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { colorDeGrupo } from '../data/grupos.js'
import { Cilindro, Contorno, Pieza, useDesplazamiento, useMateriales } from './estilo.jsx'

const ROJO = colorDeGrupo(100)
const SEPARACION = 0.25
const FONDO_EDIFICIO = 1.6
const Z_EDIFICIOS = -3.9 - FONDO_EDIFICIO / 2 // la fachada queda justo al borde del andén de atrás

// Manzana de edificios simples: ancho, alto, tono y detalle del techo
const EDIFICIOS = [
  { ancho: 2.2, alto: 2.8, tono: 'claro', techo: 'tanque' },
  { ancho: 1.5, alto: 2.2, tono: 'medio' },
  { ancho: 2.6, alto: 3.6, tono: 'blanco', techo: 'antena' },
  { ancho: 1.8, alto: 2.6, tono: 'oscuro' },
  { ancho: 2.4, alto: 3.0, tono: 'claro', techo: 'tanque' },
  { ancho: 1.6, alto: 1.9, tono: 'blanco' },
  { ancho: 2.8, alto: 3.9, tono: 'medio', techo: 'antena' },
  { ancho: 1.9, alto: 2.4, tono: 'claro' },
  { ancho: 2.2, alto: 3.0, tono: 'oscuro', techo: 'tanque' },
  { ancho: 1.6, alto: 2.0, tono: 'blanco' },
  { ancho: 2.4, alto: 3.3, tono: 'claro', techo: 'antena' },
  { ancho: 1.8, alto: 2.8, tono: 'medio' },
]
// Cada edificio empieza donde termina el anterior; el total es el largo con que se repite la manzana
const POSICIONES = EDIFICIOS.reduce((lista, e, i) => {
  const inicio = i === 0 ? 0 : lista[i - 1].fin + SEPARACION
  return [...lista, { ...e, x: inicio + e.ancho / 2, fin: inicio + e.ancho }]
}, [])
const LARGO_MANZANA = POSICIONES.at(-1).fin + SEPARACION
const LARGO_CALLE = 28

const MATERIALES = {
  blanco: { color: '#f4f4f4' },
  claro: { color: '#d2d2d2' },
  medio: { color: '#b3b3b3' },
  oscuro: { color: '#9a9a9a' },
  cornisa: { color: '#2b2b2b' },
  poste: { color: '#3a3a3a' },
  lampara: { color: '#fff7d6', emissive: '#fff1c2', emissiveIntensity: 0.6 },
  rojo: { color: ROJO },
  negro: { color: '#1a1a1a' },
}

// Lo que rodea la vía: edificios al fondo, postes de luz, un hidrante y conos.
// Cuando el camión está en servicio todo se desplaza hacia atrás, igual que las líneas de la vía.
export default function Entorno({ enMovimiento }) {
  const manzana = useRef()
  const calle = useRef()
  const m = useMateriales(MATERIALES)
  const ventanas = useVentanas()
  useDesplazamiento(manzana, enMovimiento, LARGO_MANZANA)
  useDesplazamiento(calle, enMovimiento, LARGO_CALLE)

  return (
    <group>
      <group ref={manzana} position={[0, 0, Z_EDIFICIOS]}>
        {POSICIONES.map((e, i) => (
          <group key={i} position={[e.x - LARGO_MANZANA / 2, 0, 0]}>
            <Edificio datos={e} material={m[e.tono]} m={m} ventanas={ventanas} />
          </group>
        ))}
      </group>

      <group ref={calle}>
        {[-10.5, -3.5, 3.5, 10.5].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Poste m={m} />
          </group>
        ))}
        <group position={[-2.6, 0, 0]}>
          <Hidrante m={m} />
        </group>
        <group position={[2.4, 0, 0]}>
          <Cono m={m} x={0} />
          <Cono m={m} x={0.45} />
        </group>
      </group>
    </group>
  )
}

function Edificio({ datos, material, m, ventanas }) {
  const { ancho, alto, techo } = datos
  // Cada edificio repite la textura de una ventana según su tamaño (clone comparte la imagen)
  const mapa = useMemo(() => {
    const t = ventanas.clone()
    t.repeat.set(Math.max(1, Math.round((ancho - 0.3) / 0.42)), Math.max(1, Math.round((alto - 0.5) / 0.5)))
    t.needsUpdate = true
    return t
  }, [ventanas, ancho, alto])
  useEffect(() => () => mapa.dispose(), [mapa])

  return (
    <>
      <Pieza tam={[ancho, alto, FONDO_EDIFICIO]} pos={[0, alto / 2, 0]} material={material} contorno={2.5} />
      <Pieza tam={[ancho + 0.06, 0.1, FONDO_EDIFICIO + 0.06]} pos={[0, alto + 0.05, 0]} material={m.cornisa} contorno={1.5} />
      <mesh position={[0, alto / 2 + 0.05, FONDO_EDIFICIO / 2 + 0.005]}>
        <planeGeometry args={[ancho - 0.3, alto - 0.5]} />
        <meshBasicMaterial map={mapa} transparent />
      </mesh>
      {techo === 'tanque' && (
        <>
          <Cilindro args={[0.22, 0.22, 0.38, 16]} pos={[-ancho / 4, alto + 0.29, -0.2]} material={m.blanco} />
          <mesh position={[-ancho / 4, alto + 0.56, -0.2]} material={m.cornisa} castShadow>
            <coneGeometry args={[0.24, 0.16, 16]} />
            <Contorno grosor={1.5} />
          </mesh>
        </>
      )}
      {techo === 'antena' && (
        <>
          <Cilindro args={[0.02, 0.02, 0.9, 6]} pos={[ancho / 4, alto + 0.55, -0.3]} material={m.poste} contorno={1} />
          <Pieza tam={[0.3, 0.02, 0.02]} pos={[ancho / 4, alto + 0.8, -0.3]} material={m.poste} contorno={1} />
          <Pieza tam={[0.36, 0.22, 0.3]} pos={[-ancho / 4, alto + 0.21, 0.1]} material={m.medio} contorno={1.5} />
        </>
      )}
    </>
  )
}

// Poste de luz en el andén de atrás, con el brazo hacia la vía
function Poste({ m }) {
  return (
    <group position={[0, 0.12, -1.95]}>
      <Cilindro args={[0.035, 0.045, 1.6, 10]} pos={[0, 0.8, 0]} material={m.poste} contorno={1.5} />
      <Pieza tam={[0.04, 0.04, 0.5]} pos={[0, 1.58, 0.23]} material={m.poste} contorno={1} />
      <Pieza tam={[0.12, 0.05, 0.2]} pos={[0, 1.55, 0.45]} material={m.lampara} contorno={1.5} />
    </group>
  )
}

// Hidrante rojo en el andén de adelante
function Hidrante({ m }) {
  return (
    <group position={[0, 0.12, 1.85]}>
      <Cilindro args={[0.07, 0.08, 0.3, 14]} pos={[0, 0.15, 0]} material={m.rojo} />
      <Cilindro args={[0.05, 0.075, 0.07, 14]} pos={[0, 0.34, 0]} material={m.rojo} contorno={1.5} />
      <Pieza tam={[0.22, 0.05, 0.05]} pos={[0, 0.2, 0]} material={m.rojo} contorno={1.5} />
    </group>
  )
}

// Cono de tránsito rojo con franja blanca
function Cono({ m, x }) {
  return (
    <group position={[x, 0.12, 1.8]}>
      <Pieza tam={[0.22, 0.03, 0.22]} pos={[0, 0.015, 0]} material={m.negro} contorno={1} />
      <mesh position={[0, 0.18, 0]} material={m.rojo} castShadow>
        <coneGeometry args={[0.09, 0.32, 14]} />
        <Contorno grosor={1.5} />
      </mesh>
      <Cilindro args={[0.052, 0.066, 0.05, 14]} pos={[0, 0.19, 0]} material={m.blanco} contorno={0} sombra={false} />
    </group>
  )
}

// Textura de UNA ventana (cuadro negro con marco transparente) que cada fachada repite
function useVentanas() {
  const textura = useMemo(() => {
    const lienzo = document.createElement('canvas')
    lienzo.width = 64
    lienzo.height = 64
    const ctx = lienzo.getContext('2d')
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(14, 10, 36, 40)
    ctx.fillStyle = '#f4f4f4'
    ctx.fillRect(18, 14, 8, 14) // reflejo
    const t = new THREE.CanvasTexture(lienzo)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.RepeatWrapping
    t.magFilter = THREE.NearestFilter
    return t
  }, [])
  useEffect(() => () => textura.dispose(), [textura])
  return textura
}
