import { lazy, Suspense, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import FraseQueSeLlena from '../components/landing/FraseQueSeLlena.jsx'
import Cifra from '../components/landing/Cifra.jsx'
import { GRUPOS, grupoPorCodigo } from '../data/grupos.js'
import { UNIDADES } from '../data/unidades.js'
import { MAX_FOTOS } from '../data/limites.js'
import { useTitulo } from '../hooks/useTitulo.js'
import { useAlAparecer } from '../hooks/useAlAparecer.js'
import { useMenosMovimiento } from '../hooks/useMenosMovimiento.js'
import './Landing.css'

// La escena 3D (Three.js pesa cientos de kB) se descarga DESPUÉS de mostrar el botón de reporte.
const EscenaLanding = lazy(() => import('../three/EscenaLanding.jsx'))

const FRASE =
  'Cada segundo cuenta. Reporta con tu ubicación y una foto, y el radio operador ve exactamente dónde estás.'

// Solo datos que existen en el proyecto (no son estadísticas de Bomberos)
const CIFRAS = [
  { valor: GRUPOS.length, etiqueta: 'grupos de emergencia del protocolo de despacho' },
  { valor: UNIDADES.length, etiqueta: 'tipos de unidad que puede despachar el radio operador' },
  { valor: MAX_FOTOS, etiqueta: 'fotos y un video corto por reporte' },
  { valor: 24, sufijo: '/7', etiqueta: 'para llamar al 119 si hay personas en peligro inmediato' },
]

// Acceso rápido del hero: las emergencias más comunes, dichas como las vería la persona.
// Abren el formulario con el grupo ya elegido.
const ACCESOS = [
  { codigo: 100, texto: 'Fuego o humo' },
  { codigo: 300, texto: 'Herido o atrapado' },
  { codigo: 400, texto: 'Gas o cables caídos' },
  { codigo: 800, texto: 'Inundación o vendaval' },
]

const PASOS = [
  { titulo: 'Reportas', texto: 'Qué pasa, dónde y tu número. Si puedes, agrega fotos o un video corto.' },
  { titulo: 'Validamos', texto: 'Un radio operador ve tu reporte en el mapa y te llama si necesita más datos.' },
  { titulo: 'Despachamos', texto: 'La unidad sale hacia el punto y tú ves el estado de tu reporte en la pantalla.' },
]

// Pantalla 1 (/): en pocos segundos la persona entiende qué es y llega al reporte.
export default function Landing() {
  useTitulo('Inicio')
  const navigate = useNavigate()
  const escena = useParallax()
  const [refPasos, pasosVisibles] = useAlAparecer({ umbral: 0.15 })
  const [refGrupos, gruposVisibles] = useAlAparecer({ umbral: 0.1 })

  return (
    <div className="landing">
      <Encabezado />

      <main>
        <section className="hero" aria-labelledby="titulo-hero">
          <div className="contenedor contenedor--ancho">
            <p className="rotulo hero__antetitulo entrada" style={{ '--orden': 0 }}>Canal digital de la línea 119 · Bomberos Cali</p>
            {/* Cada línea del titular está dentro de una máscara: al cargar sube desde abajo */}
            <h1 id="titulo-hero" className="hero__titulo">
              <span className="hero__linea">
                <span style={{ '--i': 0 }}>¿Tienes una</span>
              </span>{' '}
              <span className="hero__linea">
                <span style={{ '--i': 1 }}>emergencia?</span>
              </span>
            </h1>

            <div className="hero__grid">
              <div className="hero__texto">
                <p className="hero__lead entrada" style={{ '--orden': 1 }}>
                  Repórtala aquí con la ubicación y fotos. El radio operador de Bomberos Cali la ve al instante en su
                  mapa y tú sigues el estado de tu reporte.
                </p>
                <div className="hero__acciones entrada" style={{ '--orden': 2 }}>
                  <Link to="/reportar" className="boton boton--primario boton--grande">
                    Reportar emergencia
                  </Link>
                  <a href="tel:119" className="boton boton--grande">
                    Llamar al 119
                  </a>
                </div>
                <p className="hero__nota entrada" style={{ '--orden': 3 }}>
                  Si hay personas en peligro inmediato, llama: el reporte web no reemplaza la llamada.
                </p>
                <AccesoRapido />
              </div>

              <div className="hero__escena" ref={escena}>
                <div className="hero__escena-entrada">
                  <ErrorBoundary fallback={<div className="escena-respaldo">🚒 Tu navegador no pudo mostrar la escena 3D.</div>}>
                    <Suspense fallback={<div className="escena-respaldo">Cargando escena 3D…</div>}>
                      <EscenaLanding onElegirGrupo={(codigo) => navigate(`/reportar?grupo=${codigo}`)} />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </section>

        <BarraTexto />

        <section className="frase zona-oscura" aria-labelledby="titulo-frase">
          <div className="contenedor contenedor--ancho">
            <h2 id="titulo-frase" className="rotulo frase__rotulo">
              Por qué reportar aquí
            </h2>
            <FraseQueSeLlena texto={FRASE} />
            <ul className="cifras">
              {CIFRAS.map((c, i) => (
                <Cifra key={c.etiqueta} {...c} orden={i} />
              ))}
            </ul>
          </div>
        </section>

        <section id="como-funciona" className="seccion" aria-labelledby="titulo-como-funciona">
          <div className="contenedor contenedor--ancho">
            <div className="seccion__cabeza">
              <p className="rotulo seccion__indice" aria-hidden="true">
                (01)
              </p>
              <h2 id="titulo-como-funciona">Cómo funciona</h2>
            </div>
            <ol ref={refPasos} className={`pasos-landing revelar${pasosVisibles ? ' revelar--visible' : ''}`}>
              {PASOS.map((paso, i) => (
                <li key={paso.titulo} style={{ '--orden': i }}>
                  <span className="pasos-landing__numero" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3>{paso.titulo}</h3>
                  <p>{paso.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="seccion" aria-labelledby="titulo-grupos">
          <div className="contenedor contenedor--ancho">
            <div className="seccion__cabeza">
              <p className="rotulo seccion__indice" aria-hidden="true">
                (02)
              </p>
              <h2 id="titulo-grupos">Grupos de emergencia</h2>
              <p className="seccion__intro">
                Son los códigos del protocolo de despacho de Bomberos Cali. Toca uno para reportar una emergencia de
                ese tipo.
              </p>
            </div>
            <ul ref={refGrupos} className={`grupos-landing revelar${gruposVisibles ? ' revelar--visible' : ''}`}>
              {GRUPOS.map((g, i) => (
                <li key={g.codigo} style={{ '--orden': i }}>
                  <Link to={`/reportar?grupo=${g.codigo}`} className="tarjeta-grupo" style={{ '--color': g.color }}>
                    <span className="tarjeta-grupo__codigo">{g.codigo}</span>
                    <span className="tarjeta-grupo__nombre">{g.nombre}</span>
                    <span className="tarjeta-grupo__ejemplos">{g.ejemplos}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="pie">
        <div className="contenedor contenedor--ancho">
          <p className="pie__marca" aria-hidden="true">
            Línea 119
          </p>
          <div className="pie__fila">
            <p>
              Prototipo académico · Desarrollo Web 2026-2 · Universidad de San Buenaventura Cali. No es un canal
              oficial: en una emergencia real, llama al 119.
            </p>
            <Link to="/operador" className="boton boton--claro pie__operador">
              Acceso radio operador
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Acceso rápido bajo la nota del hero: llena el espacio junto a la escena 3D y acorta el camino
// al formulario (cada botón llega con el grupo ya elegido).
function AccesoRapido() {
  return (
    <nav className="acceso-rapido entrada" style={{ '--orden': 4 }} aria-labelledby="titulo-acceso-rapido">
      <p id="titulo-acceso-rapido" className="rotulo acceso-rapido__titulo">
        ¿Qué estás viendo? Empieza por aquí
      </p>
      <ul className="acceso-rapido__lista">
        {ACCESOS.map(({ codigo, texto }) => (
          <li key={codigo}>
            <Link
              to={`/reportar?grupo=${codigo}`}
              className="acceso-rapido__enlace"
              style={{ '--color': grupoPorCodigo(codigo)?.color }}
            >
              <span className="acceso-rapido__codigo">{codigo}</span>
              <span className="acceso-rapido__texto">{texto}</span>
              <span className="acceso-rapido__flecha" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Barra de texto en mayúsculas bajo el hero, con líneas finas arriba y abajo
function BarraTexto() {
  return (
    <div className="barra-texto entrada" style={{ '--orden': 5 }}>
      <div className="contenedor contenedor--ancho barra-texto__fila">
        <span className="barra-texto__izq">Línea 119 · Bomberos Cali</span>
        <a href="#como-funciona" className="barra-texto__bajar">
          <span>Baja para ver cómo funciona</span>
          <span className="flecha-circular" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M7 1v11M2.5 7.5 7 12l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
        </a>
        <span className="barra-texto__der">24 horas</span>
      </div>
    </div>
  )
}

// Parallax suave: al bajar, la escena 3D se desplaza un poco más despacio que la página
// (máximo 36 px para que no se monte sobre la barra de texto). Sin efecto con movimiento reducido.
function useParallax() {
  const ref = useRef(null)
  const reducido = useMenosMovimiento()

  useEffect(() => {
    const elemento = ref.current
    if (!elemento || reducido) return
    let cuadro = 0
    const mover = () => {
      cuadro = 0
      const desplazamiento = Math.min(window.scrollY * 0.1, 36)
      elemento.style.transform = `translate3d(0, ${desplazamiento}px, 0)`
    }
    const alDesplazar = () => {
      if (!cuadro) cuadro = requestAnimationFrame(mover)
    }
    window.addEventListener('scroll', alDesplazar, { passive: true })
    mover()
    return () => {
      cancelAnimationFrame(cuadro)
      window.removeEventListener('scroll', alDesplazar)
      elemento.style.transform = ''
    }
  }, [reducido])

  return ref
}
