import { Link } from 'react-router-dom'
import Logo from './Logo.jsx'

// Encabezado con la identidad de Bomberos Cali / Línea 119.
// Se usa en la landing (oscuro) y en las pantallas del ciudadano (claro).
export default function Encabezado({ oscuro = false }) {
  return (
    <header className={`encabezado${oscuro ? ' encabezado--oscuro' : ''}`}>
      <div className="contenedor encabezado__fila">
        <Link to="/" className="marca" aria-label="Bomberos Cali, línea 119: ir al inicio">
          <Logo />
          <span className="marca__texto">
            <strong>Bomberos Cali</strong>
            <span>Línea de emergencias 119</span>
          </span>
        </Link>
        <a href="tel:119" className="boton boton--primario boton--pequeno">
          Llamar al 119
        </a>
      </div>
    </header>
  )
}
