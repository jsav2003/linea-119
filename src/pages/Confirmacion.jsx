import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import GaleriaFotos from '../components/GaleriaFotos.jsx'
import LineaDeEstados from '../components/reporte/LineaDeEstados.jsx'
import { InsigniaGrupo } from '../components/Insignias.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { CLASE_ESTADO, MENSAJE_CIUDADANO, estaTerminado } from '../estado/estados.js'
import { grupoPorCodigo } from '../data/grupos.js'
import { UNIDADES } from '../data/unidades.js'
import { CONSEJOS_POR_GRUPO } from '../data/consejos.js'
import { useTitulo } from '../hooks/useTitulo.js'
import { coordenadas, fechaYHora, hora, telefonoOculto } from '../utils/formato.js'
import './Confirmacion.css'

// Respuesta automática (/reportar/:radicado): número de radicado, hora y estado del reporte.
// El reporte se lee del estado global: cuando el operador lo actualiza, esta pantalla cambia sola.
export default function Confirmacion() {
  const { radicado } = useParams()
  const { buscarReporte } = useReportes()
  const reporte = buscarReporte(radicado)
  useTitulo(reporte ? `${reporte.estado} · Reporte ${radicado}` : 'Reporte no encontrado')

  return (
    <div className="pagina-ciudadano">
      <Encabezado />
      <main className="contenedor contenedor--estrecho confirmacion">
        {reporte ? <EstadoDelReporte reporte={reporte} /> : <NoEncontrado radicado={radicado} />}
      </main>
    </div>
  )
}

function EstadoDelReporte({ reporte: r }) {
  const grupo = grupoPorCodigo(r.grupo)
  const unidad = UNIDADES.find((u) => u.nombre === r.unidad)

  return (
    <>
      <section className="recibido">
        <div className="recibido__icono" aria-hidden="true">
          ✓
        </div>
        <h1>Reporte recibido</h1>
        <p className="recibido__radicado">
          Número de radicado <strong>{r.id}</strong>
        </p>
        <p className="recibido__hora">Enviado el {fechaYHora(r.creadoEn)}</p>
      </section>

      <div className="mensaje-auto">
        <p className="mensaje-auto__de">
          Bomberos Cali · Línea 119 <span>Respuesta automática · {hora(r.creadoEn)}</span>
        </p>
        <p>
          Recibimos tu reporte <strong>{r.id}</strong> ({r.grupoReportado} ·{' '}
          {grupoPorCodigo(r.grupoReportado)?.nombre}) en {r.barrio}. Un radio operador lo está revisando y puede
          llamarte al {telefonoOculto(r.telefono)}. Si la situación empeora, llama al 119.
        </p>
      </div>

      <section className={`estado-actual estado-actual--${CLASE_ESTADO[r.estado]}`} aria-live="polite">
        <p className="estado-actual__etiqueta">Estado de tu reporte</p>
        {/* key: al cambiar el estado, React crea el elemento de nuevo y la animación se repite */}
        <p className="estado-actual__valor" key={r.estado}>
          {r.estado}
        </p>
        <p className="estado-actual__mensaje">
          {MENSAJE_CIUDADANO[r.estado]}
          {unidad && ` Unidad asignada: ${unidad.icono} ${unidad.nombre}.`}
          {r.motivoDescarte && ` Motivo: ${r.motivoDescarte}.`}
        </p>
        {r.grupo !== r.grupoReportado && (
          <p className="estado-actual__mensaje">
            El radio operador clasificó la emergencia como {r.grupo} · {grupo?.nombre}.
          </p>
        )}
        <LineaDeEstados reporte={r} />
      </section>

      {r.solicitudInfo && <SolicitudDelOperador reporte={r} />}

      {!estaTerminado(r.estado) && (
        <section className="tarjeta">
          <h2>Mientras llega la unidad</h2>
          <ul className="consejos">
            {CONSEJOS_POR_GRUPO[r.grupo].map((consejo) => (
              <li key={consejo}>{consejo}</li>
            ))}
          </ul>
        </section>
      )}

      <details className="tarjeta resumen">
        <summary>Ver lo que enviaste</summary>
        <dl className="resumen__datos">
          <Fila etiqueta="Tipo">
            <InsigniaGrupo codigo={r.grupoReportado} conNombre />
          </Fila>
          <Fila etiqueta="¿Qué ves?">{r.queVe}</Fila>
          <Fila etiqueta="Dirección">
            {r.direccion}, {r.barrio}
          </Fila>
          <Fila etiqueta="Referencia">{r.referencia}</Fila>
          <Fila etiqueta="Edificio">{r.edificioNoAplica ? 'No aplica' : r.edificio}</Fila>
          <Fila etiqueta="Ubicación">
            {coordenadas(r.lat, r.lng)} {r.ubicacionExacta ? '(punto marcado)' : '(centro del barrio)'}
          </Fila>
          <Fila etiqueta="Nombre">
            {r.nombres} {r.apellidos}
          </Fila>
        </dl>
        {(r.fotos?.length > 0 || r.video) && (
          <GaleriaFotos fotos={r.fotos} video={r.video} fotosSinGuardar={r.fotosSinGuardar} />
        )}
      </details>

      <div className="confirmacion__acciones">
        <a href="tel:119" className="boton boton--primario">
          Llamar al 119
        </a>
        <Link to="/reportar" className="boton">
          Hacer otro reporte
        </Link>
        <Link to="/" className="boton boton--texto">
          Volver al inicio
        </Link>
      </div>
    </>
  )
}

function Fila({ etiqueta, children }) {
  return (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{children}</dd>
    </div>
  )
}

// Extra: aviso cuando el operador pide más información, con un campo para responder
function SolicitudDelOperador({ reporte: r }) {
  const { responderInfo } = useReportes()
  const [texto, setTexto] = useState('')
  const { mensaje, fecha, respuesta, fechaRespuesta } = r.solicitudInfo

  function enviar(evento) {
    evento.preventDefault()
    if (!texto.trim()) return
    responderInfo(r.id, texto.trim())
    setTexto('')
  }

  return (
    <section
      className={`solicitud-ciudadano${respuesta ? ' solicitud-ciudadano--respondida' : ''}`}
      role={respuesta ? undefined : 'alert'}
    >
      <h2>{respuesta ? 'Respondiste al radio operador' : 'El radio operador necesita más información'}</h2>
      <p className="burbuja burbuja--operador">
        <small>Radio operador · {hora(fecha)}</small>
        {mensaje}
      </p>
      {respuesta ? (
        <p className="burbuja burbuja--ciudadano">
          <small>Tú · {hora(fechaRespuesta)}</small>
          {respuesta}
        </p>
      ) : (
        <form onSubmit={enviar} className="solicitud-ciudadano__formulario">
          <label htmlFor="respuesta-operador" className="campo__etiqueta">
            Tu respuesta
          </label>
          <textarea
            id="respuesta-operador"
            className="campo__control"
            rows={3}
            maxLength={300}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
          <button type="submit" className="boton boton--primario" disabled={!texto.trim()}>
            Enviar respuesta
          </button>
        </form>
      )}
    </section>
  )
}

function NoEncontrado({ radicado }) {
  return (
    <section className="tarjeta no-encontrado">
      <h1>No encontramos el reporte</h1>
      <p>
        El radicado <strong>{radicado}</strong> no está en este navegador. Este prototipo no tiene servidor: los
        reportes se guardan en el navegador desde donde se enviaron.
      </p>
      <div className="confirmacion__acciones">
        <Link to="/reportar" className="boton boton--primario">
          Hacer un reporte
        </Link>
        <Link to="/" className="boton">
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
