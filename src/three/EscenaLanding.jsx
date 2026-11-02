import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import CamionBomberos from './CamionBomberos.jsx'
import Carretera from './Carretera.jsx'
import PinesGrupos from './PinesGrupos.jsx'
import CamaraParallax from './CamaraParallax.jsx'
import { useMenosMovimiento } from '../hooks/useMenosMovimiento.js'

// Escena 3D de la landing (React Three Fiber): un camión de bomberos hecho con geometrías
// básicas, sobre una vía, rodeado por los 7 grupos de emergencia como pines del mapa.
//   - Mouse encima del camión: se encienden las luces de la sirena.
//   - Clic en el camión: sale a la emergencia (sube la escalera, giran las ruedas, se mueve la vía).
//   - Mouse encima de un pin: muestra el grupo. Clic: abre el reporte con ese grupo ya elegido.
//   - La cámara sigue un poco al mouse (efecto de profundidad).
export default function EscenaLanding({ onElegirGrupo }) {
  const [enServicio, setEnServicio] = useState(false)
  const reducido = useMenosMovimiento()

  return (
    <div className="escena">
      <div
        className="escena__lienzo"
        role="img"
        aria-label="Camión de bomberos en 3D rodeado por los siete grupos de emergencia"
      >
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 2.8, 5.9], fov: 38 }}>
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 11, 24]} />

          {/* Luces: ambiente suave, cielo/suelo y un "sol" que proyecta sombras */}
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#dbeafe', '#0f172a', 0.7]} />
          <directionalLight position={[5, 8, 6]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />

          <CamionBomberos
            enServicio={enServicio}
            onAlternar={() => setEnServicio((valor) => !valor)}
            reducido={reducido}
          />
          <Carretera enMovimiento={enServicio && !reducido} />
          <PinesGrupos onElegir={onElegirGrupo} reducido={reducido} />
          <CamaraParallax activa={!reducido} />
        </Canvas>
      </div>
      <p className="escena__pista" aria-live="polite">
        {enServicio
          ? '¡En camino! Haz clic en el camión para detenerlo.'
          : 'Pasa el mouse por el camión y haz clic para salir a la emergencia. Toca un pin para reportar.'}
      </p>
    </div>
  )
}
