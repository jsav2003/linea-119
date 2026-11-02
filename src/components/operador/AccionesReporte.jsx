import { useState } from 'react'
import BotonConfirmar from '../BotonConfirmar.jsx'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { ESTADOS, MOTIVOS_DESCARTE } from '../../estado/estados.js'
import { GRUPOS, grupoPorCodigo } from '../../data/grupos.js'
import { UNIDADES } from '../../data/unidades.js'
import { formatoTelefono, hora } from '../../utils/formato.js'

const sugerirUnidad = (codigo) => grupoPorCodigo(codigo)?.unidadSugerida ?? UNIDADES[0].nombre

// Los 4 pasos del radio operador: contactar → validar (o descartar) → despachar → cerrar.
// Cada botón se activa solo cuando le toca: no se puede despachar un caso sin validar.
export default function AccionesReporte({ reporte: r }) {
  const { validar, descartar, despachar, cerrar } = useReportes()
  const [grupo, setGrupo] = useState(r.grupo)
  const [motivo, setMotivo] = useState(MOTIVOS_DESCARTE[0])
  const [unidad, setUnidad] = useState(() => sugerirUnidad(r.grupo))

  const recibido = r.estado === ESTADOS.RECIBIDO
  const validado = r.estado === ESTADOS.VALIDADO
  const despachado = r.estado === ESTADOS.DESPACHADO
  const cerrado = r.estado === ESTADOS.CERRADO
  const descartado = r.estado === ESTADOS.DESCARTADO

  // Hora en que el reporte llegó a un estado (sale del historial)
  const horaDe = (estado) => {
    const registro = r.historial.find((h) => h.estado === estado)
    return registro ? hora(registro.fecha) : ''
  }

  function marcarValidado() {
    validar(r.id, grupo)
    setUnidad(sugerirUnidad(grupo)) // la unidad sugerida sigue al grupo confirmado
  }

  const unidadDespachada = UNIDADES.find((u) => u.nombre === r.unidad)

  return (
    <section className="acciones" aria-label="Atención del caso">
      <h3 className="detalle__subtitulo">Atención del caso</h3>
      <ol className="pasos-op">
        <Paso numero={1} titulo="Contactar al ciudadano" estado={recibido ? 'actual' : 'hecho'}>
          <a className="boton boton--llamar" href={`tel:${r.telefono}`}>
            📞 Llamar · {formatoTelefono(r.telefono)}
          </a>
        </Paso>

        <Paso numero={2} titulo="Validar o descartar" estado={recibido ? 'actual' : 'hecho'}>
          {recibido && (
            <>
              <div className="paso-op__fila">
                <label htmlFor="grupo-confirmado">Grupo confirmado</label>
                <select id="grupo-confirmado" value={grupo} onChange={(e) => setGrupo(Number(e.target.value))}>
                  {GRUPOS.map((g) => (
                    <option key={g.codigo} value={g.codigo}>
                      {g.codigo} · {g.nombre}
                    </option>
                  ))}
                </select>
              </div>
              {grupo !== r.grupo && (
                <p className="pista">
                  Se corregirá el grupo de {r.grupo} a {grupo}.
                </p>
              )}
              <button type="button" className="boton boton--op-exito" onClick={marcarValidado}>
                ✓ Marcar como validado
              </button>
              <div className="paso-op__fila paso-op__fila--descartar">
                <label htmlFor="motivo-descarte">Si es falso o duplicado:</label>
                <select id="motivo-descarte" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                  {MOTIVOS_DESCARTE.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <BotonConfirmar
                  className="boton boton--op boton--op-peligro"
                  textoConfirmar="Confirmar descarte"
                  onConfirmar={() => descartar(r.id, motivo)}
                >
                  Descartar
                </BotonConfirmar>
              </div>
            </>
          )}
          {descartado && (
            <p>
              Descartado a las {horaDe(ESTADOS.DESCARTADO)}: {r.motivoDescarte}.
            </p>
          )}
          {!recibido && !descartado && (
            <p>
              Validado a las {horaDe(ESTADOS.VALIDADO)} como grupo {r.grupo}
              {r.grupo !== r.grupoReportado ? ` (el ciudadano reportó ${r.grupoReportado})` : ''}.
            </p>
          )}
        </Paso>

        <Paso
          numero={3}
          titulo="Despachar unidad"
          estado={descartado ? 'omitido' : validado ? 'actual' : recibido ? 'bloqueado' : 'hecho'}
        >
          {descartado && <p>No aplica.</p>}
          {unidadDespachada && (
            <p>
              {unidadDespachada.icono} {unidadDespachada.nombre} despachada a las {horaDe(ESTADOS.DESPACHADO)}
            </p>
          )}
          {(recibido || validado) && (
            <>
              <div className="unidades" role="radiogroup" aria-label="Unidad a despachar">
                {UNIDADES.map((u) => (
                  <label key={u.nombre} className="unidad" title={u.descripcion}>
                    <input
                      type="radio"
                      name={`unidad-${r.id}`}
                      value={u.nombre}
                      checked={unidad === u.nombre}
                      onChange={() => setUnidad(u.nombre)}
                      disabled={!validado}
                    />
                    <span className="unidad__icono" aria-hidden="true">
                      {u.icono}
                    </span>
                    <span className="unidad__nombre">{u.nombre}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="boton boton--op-primario"
                disabled={!validado}
                onClick={() => despachar(r.id, unidad)}
              >
                Despachar {unidad}
              </button>
              {recibido && <p className="pista">Se activa cuando el caso esté validado: no se despacha sin validar.</p>}
            </>
          )}
        </Paso>

        <Paso
          numero={4}
          titulo="Cerrar caso"
          estado={cerrado ? 'hecho' : despachado ? 'actual' : descartado ? 'omitido' : 'bloqueado'}
        >
          {cerrado && <p>Cerrado a las {horaDe(ESTADOS.CERRADO)}</p>}
          {descartado && <p>No aplica.</p>}
          {!cerrado && !descartado && (
            <>
              <button type="button" className="boton boton--op" disabled={!despachado} onClick={() => cerrar(r.id)}>
                Cerrar caso
              </button>
              {!despachado && <p className="pista">Se activa cuando la unidad esté despachada.</p>}
            </>
          )}
        </Paso>
      </ol>
    </section>
  )
}

function Paso({ numero, titulo, estado, children }) {
  return (
    <li className={`paso-op paso-op--${estado}`}>
      <span className="paso-op__numero" aria-hidden="true">
        {estado === 'hecho' ? '✓' : numero}
      </span>
      <div className="paso-op__cuerpo">
        <h4 className="paso-op__titulo">{titulo}</h4>
        {children}
      </div>
    </li>
  )
}
