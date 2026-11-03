import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import NavPildora from './NavPildora.jsx'

// Encabezado con la identidad de Bomberos Cali / Línea 119, la navegación y el botón de llamar.
// Se usa en la landing y en las pantallas del ciudadano. `oscuro` lo pinta sobre fondo negro.
export default function Encabezado({ oscuro = false }) {
  return (
    <header className={`encabezado${oscuro ? ' encabezado--oscuro' : ''}`}>
      <div className="contenedor contenedor--ancho encabezado__fila">
        <Link to="/" className="marca" aria-label="Bomberos Cali, línea 119: ir al inicio">
          <Logo />
          <span className="marca__texto">
            <strong>Bomberos Cali</strong>
            <span>Línea de emergencias 119</span>
          </span>
        </Link>
        <NavPildora />
        <a href="tel:119" className="boton boton--primario boton--pequeno encabezado__llamar" aria-label="Llamar al 119">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
            />
          </svg>
          <span>
            <span className="encabezado__llamar-texto">Llamar al </span>119
          </span>
        </a>
      </div>
    </header>
  )
}
