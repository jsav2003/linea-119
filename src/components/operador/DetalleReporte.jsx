import AccionesReporte from './AccionesReporte.jsx'
import SolicitudInfo from './SolicitudInfo.jsx'
import ReportesCercanos from './ReportesCercanos.jsx'
import GaleriaFotos from '../GaleriaFotos.jsx'
import Historial from '../Historial.jsx'
import { InsigniaEstado, InsigniaGrupo } from '../Insignias.jsx'
import { useReportes } from '../../estado/ReportesContext.jsx'
import { esCritico, estaTerminado } from '../../estado/estados.js'
import { useAhora } from '../../hooks/useAhora.js'
import { coordenadas, formatoTelefono, haceCuanto, hora } from '../../utils/formato.js'
import { enlaceGoogleMaps } from '../../utils/geo.js'

// Detalle del reporte seleccionado: emergencia, fotos, acciones del operador, ciudadano y ubicación.
export default function DetalleReporte({ reporte: r, onCerrar, onSeleccionar }) {
  const { reportes } = useReportes()
  const ahora = useAhora(30000)
  const tieneArchivos = r.fotos?.length > 0 || r.video || r.fotosSinGuardar > 0

  return (
    <article className="detalle">
      <header className="detalle__encabezado">
        <div>
          <p className="detalle__radicado">{r.id}</p>
          <div className="detalle__insignias">
            <InsigniaEstado key={r.estado} estado={r.estado} />
            <InsigniaGrupo codigo={r.grupo} conNombre />
            {esCritico(r) && <span className="critico">⚠ Crítico</span>}
          </div>
        </div>
        <button type="button" className="detalle__cerrar" onClick={onCerrar} aria-label="Cerrar el detalle">
          ×
        </button>
      </header>

      <p className="detalle__hora">
        Recibido a las {hora(r.creadoEn)} ({haceCuanto(r.creadoEn, ahora)}){r.simulado ? ' · reporte simulado' : ''}
      </p>

      <section className="detalle__seccion">
        <h3 className="detalle__subtitulo">¿Qué ve?</h3>
        <blockquote className="detalle__que-ve">{r.queVe}</blockquote>
        {r.continuacion && <DatosRescate datos={r.continuacion} />}
      </section>

      {tieneArchivos && (
        <section className="detalle__seccion">
          <h3 className="detalle__subtitulo">Fotos y video</h3>
          <GaleriaFotos fotos={r.fotos} video={r.video} fotosSinGuardar={r.fotosSinGuardar} />
        </section>
      )}

      <AccionesReporte reporte={r} />
      {!estaTerminado(r.estado) && <SolicitudInfo reporte={r} />}

      <section className="detalle__seccion">
        <h3 className="detalle__subtitulo">Ciudadano</h3>
        <dl className="datos">
          <Dato etiqueta="Nombre">
            {r.nombres} {r.apellidos}
          </Dato>
          <Dato etiqueta="Teléfono">{formatoTelefono(r.telefono)}</Dato>
        </dl>
      </section>

      <section className="detalle__seccion">
        <h3 className="detalle__subtitulo">Ubicación</h3>
        <dl className="datos">
          <Dato etiqueta="Dirección">{r.direccion}</Dato>
          <Dato etiqueta="Barrio">{r.barrio}</Dato>
          <Dato etiqueta="Referencia">{r.referencia}</Dato>
          <Dato etiqueta="Edificio">{r.edificioNoAplica ? 'No aplica' : r.edificio}</Dato>
          <Dato etiqueta="Coordenadas">
            {coordenadas(r.lat, r.lng)}
            <small>{r.ubicacionExacta ? 'Punto marcado en el mapa' : 'Aproximada: centro del barrio'}</small>
          </Dato>
        </dl>
        <a className="boton boton--op" href={enlaceGoogleMaps(r.lat, r.lng)} target="_blank" rel="noreferrer">
          Ver en Google Maps ↗
        </a>
      </section>

      <ReportesCercanos reporte={r} reportes={reportes} onSeleccionar={onSeleccionar} />

      <section className="detalle__seccion">
        <h3 className="detalle__subtitulo">Historial</h3>
        <Historial entradas={r.historial} />
      </section>

      <a className="detalle__ver-ciudadano" href={`/reportar/${r.id}`} target="_blank" rel="noreferrer">
        Abrir la pantalla del ciudadano en otra pestaña ↗
      </a>
    </article>
  )
}

function Dato({ etiqueta, children }) {
  return (
    <div className="datos__fila">
      <dt>{etiqueta}</dt>
      <dd>{children}</dd>
    </div>
  )
}

// Respuestas a las preguntas de continuación del grupo 300
function DatosRescate({ datos }) {
  const alerta = (valor) => (valor === 'No' ? ' datos__valor--alerta' : '')
  return (
    <dl className="datos datos--rescate">
      <Dato etiqueta="Sexo">{datos.sexo}</Dato>
      <Dato etiqueta="Edad">{datos.edad}</Dato>
      <div className="datos__fila">
        <dt>¿Consciente?</dt>
        <dd className={`datos__valor${alerta(datos.consciente)}`}>{datos.consciente}</dd>
      </div>
      <div className="datos__fila">
        <dt>¿Respira?</dt>
        <dd className={`datos__valor${alerta(datos.respira)}`}>{datos.respira}</dd>
      </div>
    </dl>
  )
}
