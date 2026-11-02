import { lazy, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import { GRUPOS } from '../data/grupos.js'
import { useTitulo } from '../hooks/useTitulo.js'
import './Landing.css'

// La escena 3D (Three.js pesa cientos de kB) se descarga DESPUÉS de mostrar el botón de reporte.
const EscenaLanding = lazy(() => import('../three/EscenaLanding.jsx'))

const PASOS = [
  { titulo: 'Reportas', texto: 'Qué pasa, dónde y tu número. Si puedes, agrega fotos o un video corto.' },
  { titulo: 'Validamos', texto: 'Un radio operador ve tu reporte en el mapa y te llama si necesita más datos.' },
  { titulo: 'Despachamos', texto: 'La unidad sale hacia el punto y tú ves el estado de tu reporte en la pantalla.' },
]

// Pantalla 1 (/): en pocos segundos la persona entiende qué es y llega al reporte.
export default function Landing() {
  useTitulo('Inicio')
  const navigate = useNavigate()

  return (
    <div className="landing">
      <Encabezado oscuro />

      <main>
        <section className="hero">
          <div className="contenedor hero__grid">
            <div className="hero__texto">
              <p className="hero__antetitulo">Canal digital de la línea 119</p>
              <h1>¿Tienes una emergencia?</h1>
              <p className="hero__lead">
                Repórtala aquí con la ubicación y fotos. El radio operador de Bomberos Cali la ve al instante en su
                mapa y tú sigues el estado de tu reporte.
              </p>
              <div className="hero__acciones">
                <Link to="/reportar" className="boton boton--primario boton--grande">
                  Reportar emergencia
                </Link>
                <a href="tel:119" className="boton boton--claro boton--grande">
                  Llamar al 119
                </a>
              </div>
              <p className="hero__nota">Si hay personas en peligro inmediato, llama: el reporte web no reemplaza la llamada.</p>
            </div>

            <div className="hero__escena">
              <ErrorBoundary fallback={<div className="escena-respaldo">🚒 Tu navegador no pudo mostrar la escena 3D.</div>}>
                <Suspense fallback={<div className="escena-respaldo">Cargando escena 3D…</div>}>
                  <EscenaLanding onElegirGrupo={(codigo) => navigate(`/reportar?grupo=${codigo}`)} />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </section>

        <section className="seccion contenedor" aria-labelledby="titulo-como-funciona">
          <h2 id="titulo-como-funciona">Cómo funciona</h2>
          <ol className="pasos-landing">
            {PASOS.map((paso, i) => (
              <li key={paso.titulo}>
                <span className="pasos-landing__numero">{i + 1}</span>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="seccion contenedor" aria-labelledby="titulo-grupos">
          <h2 id="titulo-grupos">Grupos de emergencia</h2>
          <p className="seccion__intro">
            Son los códigos del protocolo de despacho de Bomberos Cali. Toca uno para reportar una emergencia de ese
            tipo.
          </p>
          <ul className="grupos-landing">
            {GRUPOS.map((g) => (
              <li key={g.codigo}>
                <Link to={`/reportar?grupo=${g.codigo}`} className="tarjeta-grupo" style={{ '--color': g.color }}>
                  <span className="tarjeta-grupo__codigo">{g.codigo}</span>
                  <span className="tarjeta-grupo__nombre">{g.nombre}</span>
                  <span className="tarjeta-grupo__ejemplos">{g.ejemplos}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="pie">
        <div className="contenedor pie__fila">
          <p>
            Prototipo académico · Desarrollo Web 2026-2 · Universidad de San Buenaventura Cali. No es un canal
            oficial: en una emergencia real, llama al 119.
          </p>
          <Link to="/operador" className="boton boton--claro pie__operador">
            Acceso radio operador
          </Link>
        </div>
      </footer>
    </div>
  )
}
