import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PresentationControls } from '@react-three/drei'
import CamionBomberos from './CamionBomberos.jsx'
import Carretera from './Carretera.jsx'
import Entorno from './Entorno.jsx'
import PinesGrupos from './PinesGrupos.jsx'
import CamaraParallax from './CamaraParallax.jsx'
import { PAPEL } from './estilo.jsx'
import { useMenosMovimiento } from '../hooks/useMenosMovimiento.js'

// true en computadores con mouse; false en pantallas táctiles
const conMouse = () => window.matchMedia?.('(pointer: fine)').matches ?? true

// Escena 3D de la landing (React Three Fiber), con estilo de cómic brutalista: colores planos,
// contornos negros y sombras duras. Un camión de bomberos hecho con geometrías básicas, en una
// calle con edificios, rodeado por los 7 grupos de emergencia como pines del mapa.
//   - Al cargar: el camión entra desde la izquierda y frena.
//   - Mouse encima del camión: se encienden las luces de la sirena.
//   - Clic en el camión: sale a la emergencia (escalera, ruedas, calle en movimiento y humo).
//   - Clic en el cañón del techo: lanza un chorro de agua.
//   - Mouse encima de un pin: muestra el grupo. Clic: abre el reporte con ese grupo ya elegido.
//   - Arrastrar (solo con mouse): gira la maqueta; al soltar vuelve a su lugar.
//   - La cámara sigue un poco al mouse (efecto de profundidad).
export default function EscenaLanding({ onElegirGrupo }) {
  const [enServicio, setEnServicio] = useState(false)
  const reducido = useMenosMovimiento()
  const [mouse] = useState(conMouse)
  // En celular no se activa el arrastre: el dedo tiene que poder hacer scroll sobre la escena
  const arrastre = mouse && !reducido

  let pista
  if (enServicio) pista = '¡En camino! Toca el camión para detenerlo o el cañón del techo para lanzar agua.'
  else if (mouse)
    pista = 'Clic en el camión para salir a la emergencia, en el cañón del techo para lanzar agua o en un pin para reportar. Arrastra para girar.'
  else pista = 'Toca el camión para salir, el cañón del techo para lanzar agua o un pin para reportar.'

  return (
    <div className="escena">
      <div
        className="escena__lienzo"
        role="img"
        aria-label="Camión de bomberos en 3D en una calle con edificios, rodeado por los siete grupos de emergencia"
      >
        <Canvas shadows="percentage" flat dpr={[1, 2]} camera={{ position: [5, 2.8, 5.9], fov: 38 }}>
          <color attach="background" args={[PAPEL]} />
          <fog attach="fog" args={[PAPEL, 13, 28]} />

          {/* Luces: ambiente fuerte (la sombra del dibujo no queda negra) y un "sol" con sombras duras */}
          <ambientLight intensity={0.95} />
          <directionalLight
            position={[5, 8, 6]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0005}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-camera-near={0.5}
            shadow-camera-far={30}
          />

          <PresentationControls
            enabled={arrastre}
            global
            cursor={arrastre}
            snap
            speed={1.3}
            polar={[0, 0]}
            azimuth={[-0.7, 0.7]}
            config={{ mass: 1, tension: 170, friction: 24 }}
          >
            <CamionBomberos
              enServicio={enServicio}
              onAlternar={() => setEnServicio((valor) => !valor)}
              reducido={reducido}
            />
            <Carretera enMovimiento={enServicio && !reducido} />
            <Entorno enMovimiento={enServicio && !reducido} />
            <PinesGrupos onElegir={onElegirGrupo} reducido={reducido} />
          </PresentationControls>
          <CamaraParallax activa={!reducido} />
        </Canvas>
      </div>
      <p className="escena__pista" aria-live="polite">
        {pista}
      </p>
    </div>
  )
}
