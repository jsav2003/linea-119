import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import NavPildora from '../NavPildora.jsx'
import BotonConfirmar from '../BotonConfirmar.jsx'
import NumeroAnimado from './NumeroAnimado.jsx'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { CLASE_ESTADO, ESTADOS } from '../../estado/estados.js'

// Barra superior del tablero: la misma marca y navegación del resto del sitio, las acciones de
// prueba y una franja de contadores por estado (un clic filtra la lista).
export default function BarraOperador({ filtroEstado, onFiltrarEstado }) {
  const { reportes, simularReportes, borrarTodo } = useReportes()
  const contar = (estado) => reportes.filter((r) => r.estado === estado).length

  return (
    <header className="barra-op">
      <div className="barra-op__fila">
        <Link to="/" className="marca" aria-label="Bomberos Cali, línea 119: ir al inicio">
          <Logo tam={36} />
          <span className="marca__texto">
            <strong>Centro de despacho</strong>
            <span>Radio operador · Línea 119</span>
          </span>
        </Link>

        <NavPildora />

        <div className="barra-op__acciones">
          <button type="button" className="boton boton--op" onClick={() => simularReportes(50)}>
            Simular 50
          </button>
          <BotonConfirmar
            className="boton boton--op boton--op-peligro"
            textoConfirmar="¿Borrar todo? Confirmar"
            onConfirmar={borrarTodo}
            disabled={reportes.length === 0}
          >
            Borrar todo
          </BotonConfirmar>
        </div>
      </div>

      <ul className="barra-op__contadores" aria-label="Reportes por estado (clic para filtrar)">
        {Object.values(ESTADOS).map((estado) => {
          const activo = filtroEstado === estado
          return (
            <li key={estado}>
              <button
                type="button"
                className={`contador contador--${CLASE_ESTADO[estado]}`}
                aria-pressed={activo}
                onClick={() => onFiltrarEstado(activo ? 'todos' : estado)}
              >
                <strong className="contador__numero">
                  <NumeroAnimado valor={contar(estado)} />
                </strong>
                <span className="contador__nombre">{estado}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </header>
  )
}
