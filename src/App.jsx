import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ReportesProvider } from './estado/ReportesContext.jsx'
import Landing from './pages/Landing.jsx'
import NoEncontrada from './pages/NoEncontrada.jsx'

// Las pantallas con mapa se descargan solo cuando se visitan, así la landing abre rápido.
const Reportar = lazy(() => import('./pages/Reportar.jsx'))
const Confirmacion = lazy(() => import('./pages/Confirmacion.jsx'))
const Operador = lazy(() => import('./pages/Operador.jsx'))

// Las tres pantallas comparten el MISMO estado (ReportesProvider):
// lo que envía el ciudadano en /reportar aparece en el mapa de /operador,
// y lo que cambia el operador lo ve el ciudadano en /reportar/:radicado.
export default function App() {
  return (
    <ReportesProvider>
      <SubirAlCambiarDePantalla />
      <Suspense fallback={<p className="cargando">Cargando…</p>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/reportar" element={<Reportar />} />
          <Route path="/reportar/:radicado" element={<Confirmacion />} />
          <Route path="/operador" element={<Operador />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </Suspense>
    </ReportesProvider>
  )
}

// Al cambiar de pantalla, empezar arriba (si no, se conserva el scroll de la anterior)
function SubirAlCambiarDePantalla() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
