import { Link } from 'react-router-dom'
import Logo from '../Logo.jsx'
import BotonConfirmar from '../BotonConfirmar.jsx'
import NumeroAnimado from './NumeroAnimado.jsx'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { CLASE_ESTADO, ESTADOS } from '../../estado/estados.js'

// Barra superior del tablero: contadores por estado (un clic filtra la lista) y acciones de prueba.
export default function BarraOperador({ filtroEstado, onFiltrarEstado }) {
  const { reportes, simularReportes, borrarTodo } = useReportes()
  const contar = (estado) => reportes.filter((r) => r.estado === estado).length

  return (
    <header className="barra-op">
      <Link to="/" className="barra-op__marca" aria-label="Volver al inicio">
        <Logo tam={36} />
        <span>
          <strong>Centro de despacho</strong>
          <small>Radio operador · Línea 119</small>
        </span>
      </Link>

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
                <strong>
                  <NumeroAnimado valor={contar(estado)} />
                </strong>{' '}
                {estado}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="barra-op__acciones">
        <button type="button" className="boton boton--op" onClick={() => simularReportes(50)}>
          Simular 50 reportes
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
    </header>
  )
}
