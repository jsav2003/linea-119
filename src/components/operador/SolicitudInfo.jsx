import { useState } from 'react'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { hora } from '../../utils/formato.js'

const SUGERENCIAS = [
  'Envíe una foto de la fachada',
  '¿Hay personas atrapadas?',
  '¿Cuántos pisos tiene la edificación?',
  '¿De qué color es el humo?',
]

// Extra: el operador le pide más información al ciudadano y este la ve como aviso en su pantalla.
export default function SolicitudInfo({ reporte: r }) {
  const { solicitarInfo } = useReportes()
  const [mensaje, setMensaje] = useState('')
  const solicitud = r.solicitudInfo

  function enviar(evento) {
    evento.preventDefault()
    if (!mensaje.trim()) return
    solicitarInfo(r.id, mensaje.trim())
    setMensaje('')
  }

  return (
    <section className="solicitud">
      <h3 className="detalle__subtitulo">Solicitar más información</h3>

      {solicitud && (
        <div className="conversacion">
          <p className="burbuja burbuja--operador">
            <small>Tú · {hora(solicitud.fecha)}</small>
            {solicitud.mensaje}
          </p>
          {solicitud.respuesta ? (
            <p className="burbuja burbuja--ciudadano">
              <small>
                {r.nombres} · {hora(solicitud.fechaRespuesta)}
              </small>
              {solicitud.respuesta}
            </p>
          ) : (
            <p className="pista">Esperando la respuesta del ciudadano…</p>
          )}
        </div>
      )}

      <form onSubmit={enviar} className="solicitud__formulario">
        <div className="sugerencias">
          {SUGERENCIAS.map((texto) => (
            <button key={texto} type="button" className="chip" onClick={() => setMensaje(texto)}>
              {texto}
            </button>
          ))}
        </div>
        <label htmlFor={`mensaje-${r.id}`} className="visualmente-oculto">
          Mensaje para el ciudadano
        </label>
        <textarea
          id={`mensaje-${r.id}`}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={2}
          maxLength={200}
          placeholder="Escribe la pregunta para el ciudadano"
        />
        <button type="submit" className="boton boton--op" disabled={!mensaje.trim()}>
          Enviar al ciudadano
        </button>
      </form>
    </section>
  )
}
