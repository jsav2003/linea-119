import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const ENLACES = [
  { a: '/', texto: 'Inicio', exacto: true },
  { a: '/reportar', texto: 'Reportar' },
  { a: '/operador', texto: 'Operador' },
]

// Navegación tipo píldora segmentada: un fondo negro se desliza hacia el enlace que tiene
// el mouse o el foco del teclado, y vuelve al de la pantalla actual al salir.
export default function NavPildora() {
  const { pathname } = useLocation()
  const enlaces = useRef([])
  const [resaltado, setResaltado] = useState(null) // índice bajo el mouse o con foco
  const [fondo, setFondo] = useState(null) // { x, ancho } del fondo, en píxeles
  const [listo, setListo] = useState(false) // sin animación en la primera medida (que no "vuele" al cargar)

  const actual = ENLACES.findIndex((e) => (e.exacto ? pathname === e.a : pathname.startsWith(e.a)))
  const indice = resaltado ?? actual

  useLayoutEffect(() => {
    let vigente = true
    function medir() {
      if (!vigente) return
      const enlace = enlaces.current[indice]
      setFondo(enlace ? { x: enlace.offsetLeft, ancho: enlace.offsetWidth } : null)
    }
    medir()
    // Cuando llega la fuente de Google, los enlaces cambian de ancho: medir otra vez
    document.fonts?.ready.then(medir)
    window.addEventListener('resize', medir)
    return () => {
      vigente = false
      window.removeEventListener('resize', medir)
    }
  }, [indice])

  useLayoutEffect(() => {
    const cuadro = requestAnimationFrame(() => setListo(true))
    return () => cancelAnimationFrame(cuadro)
  }, [])

  return (
    <nav className={`nav-pildora${listo ? ' nav-pildora--lista' : ''}`} aria-label="Principal">
      <span
        className="nav-pildora__fondo"
        aria-hidden="true"
        style={fondo ? { transform: `translateX(${fondo.x}px)`, width: fondo.ancho, opacity: 1 } : { opacity: 0 }}
      />
      <ul className="nav-pildora__lista" onPointerLeave={() => setResaltado(null)}>
        {ENLACES.map((e, i) => (
          <li key={e.a}>
            <NavLink
              ref={(el) => {
                enlaces.current[i] = el
              }}
              to={e.a}
              end={e.exacto}
              className={`nav-pildora__enlace${i === indice ? ' nav-pildora__enlace--sobre' : ''}`}
              onPointerEnter={() => setResaltado(i)}
              onFocus={() => setResaltado(i)}
              onBlur={() => setResaltado(null)}
            >
              {e.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
