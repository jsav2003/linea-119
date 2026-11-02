import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono, crearIconoCumulo, clasesDeEstado } from './iconos.js'
import { agruparCercanos } from './agrupar.js'
import { GRUPOS, colorDeGrupo, grupoPorCodigo } from '../data/grupos.js'
import { InsigniaEstado, InsigniaGrupo } from '../components/Insignias.jsx'
import { centroDe } from '../utils/geo.js'
import { hora } from '../utils/formato.js'

const CENTRO_CALI = [3.437, -76.522]

// Mapa REAL de Cali (OpenStreetMap a través de Leaflet). No necesita API key.
// Props:
//   reportes: reportes del estado global (los que envía el ciudadano), ya filtrados
//   seleccionadoId: id del reporte seleccionado (o null)
//   onSeleccionar: (id) => void
//   agrupar: si es true, junta los pines muy cercanos en un círculo con el número de reportes
export default function MapaOperador({ reportes = [], seleccionadoId = null, onSeleccionar, agrupar = false }) {
  const seleccionado = reportes.find((r) => r.id === seleccionadoId)
  const marcadores = useRef(new Map()) // id del reporte → marcador de Leaflet (para abrir su popup)

  return (
    <MapContainer center={CENTRO_CALI} zoom={13} style={{ width: '100%', height: '100%' }}>
      {/* Dos estilos de mapa: el operador los cambia con el control de la esquina */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Calles (OpenStreetMap)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Oscuro (centro de control)">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <Pines
        reportes={reportes}
        seleccionadoId={seleccionadoId}
        onSeleccionar={onSeleccionar}
        agrupar={agrupar}
        marcadores={marcadores}
      />
      <IrAlSeleccionado reporte={seleccionado} marcadores={marcadores} />
      <Leyenda reportes={reportes} />
    </MapContainer>
  )
}

// Dibuja un pin por reporte o, si `agrupar` está activo, un círculo por cada grupo de pines cercanos.
function Pines({ reportes, seleccionadoId, onSeleccionar, agrupar, marcadores }) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  const [idsLista, setIdsLista] = useState(null) // reportes de un círculo que se listan en un popup
  const popupLista = useRef(null)

  // Eventos del mapa: recalcular los grupos al cambiar el zoom y cerrar la lista con su popup
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
    popupclose: (e) => {
      if (e.popup === popupLista.current) setIdsLista(null)
    },
  })

  const seleccionado = reportes.find((r) => r.id === seleccionadoId)
  const grupos = useMemo(() => {
    const resto = reportes.filter((r) => r.id !== seleccionadoId) // el seleccionado siempre va solo
    if (!agrupar) return resto.map((r) => [r])
    return agruparCercanos(resto, (latlng) => map.project(latlng, zoom))
  }, [reportes, seleccionadoId, agrupar, map, zoom])

  const reportesLista = idsLista ? reportes.filter((r) => idsLista.includes(r.id)) : []

  function abrirCirculo(grupo) {
    const limites = L.latLngBounds(grupo.map((r) => [r.lat, r.lng]))
    const casiElMismoPunto = map.distance(limites.getNorthEast(), limites.getSouthWest()) < 30 // metros
    if (casiElMismoPunto || zoom >= 17) {
      setIdsLista(grupo.map((r) => r.id)) // con zoom ya no se separan: se listan
    } else {
      map.flyToBounds(limites, { padding: [60, 60], maxZoom: 17, duration: 0.7 })
    }
  }

  return (
    <>
      {grupos.map((grupo) =>
        grupo.length === 1 ? (
          <PinReporte key={grupo[0].id} reporte={grupo[0]} onSeleccionar={onSeleccionar} marcadores={marcadores} />
        ) : (
          <Marker
            key={`circulo-${grupo[0].id}`}
            position={centroDe(grupo)}
            icon={crearIconoCumulo(grupo)}
            title={`${grupo.length} reportes cercanos: clic para acercar`}
            eventHandlers={{ click: () => abrirCirculo(grupo) }}
          />
        ),
      )}

      {seleccionado && (
        <PinReporte reporte={seleccionado} seleccionado onSeleccionar={onSeleccionar} marcadores={marcadores} />
      )}

      {reportesLista.length > 0 && (
        <Popup ref={popupLista} key={idsLista.join()} position={centroDe(reportesLista)}>
          <ListaDelCirculo reportes={reportesLista} onSeleccionar={onSeleccionar} />
        </Popup>
      )}
    </>
  )
}

// Pin de un reporte: color del grupo + clase según el estado (pulso, validado, despachado, apagado)
function PinReporte({ reporte, seleccionado = false, onSeleccionar, marcadores }) {
  return (
    <Marker
      position={[reporte.lat, reporte.lng]}
      icon={crearIcono(colorDeGrupo(reporte.grupo), { seleccionado, clases: clasesDeEstado(reporte.estado) })}
      zIndexOffset={seleccionado ? 1000 : 0}
      ref={(marcador) => {
        if (marcador) marcadores.current.set(reporte.id, marcador)
        else marcadores.current.delete(reporte.id)
      }}
      eventHandlers={{ click: () => onSeleccionar?.(reporte.id) }}
    >
      <Popup>
        <PopupReporte reporte={reporte} />
      </Popup>
    </Marker>
  )
}

// Popup del pin: nombre, qué ve y estado (además del grupo, el barrio y la hora)
function PopupReporte({ reporte: r }) {
  const grupo = grupoPorCodigo(r.grupo)
  return (
    <div className="popup-reporte">
      <p className="popup-reporte__grupo" style={{ '--color': grupo?.color }}>
        <strong>{r.grupo}</strong> {grupo?.nombre}
      </p>
      <p className="popup-reporte__nombre">
        {r.nombres} {r.apellidos}
      </p>
      <p className="popup-reporte__que-ve">«{r.queVe}»</p>
      <p className="popup-reporte__pie">
        <InsigniaEstado estado={r.estado} />
        <span>
          {r.barrio} · {hora(r.creadoEn)}
        </span>
      </p>
    </div>
  )
}

function ListaDelCirculo({ reportes, onSeleccionar }) {
  return (
    <div className="lista-circulo">
      <p className="lista-circulo__titulo">{reportes.length} reportes en este punto</p>
      <ul>
        {reportes.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => onSeleccionar?.(r.id)}>
              <InsigniaGrupo codigo={r.grupo} />
              <span>
                …{r.id.slice(-4)} · {hora(r.creadoEn)}
              </span>
              <InsigniaEstado estado={r.estado} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Cuando se selecciona un reporte (desde la lista o el mapa), el mapa vuela hasta él y abre su popup.
function IrAlSeleccionado({ reporte, marcadores }) {
  const map = useMap()
  const id = reporte?.id
  const lat = reporte?.lat
  const lng = reporte?.lng

  useEffect(() => {
    if (id == null) return
    const abrirPopup = () => marcadores.current.get(id)?.openPopup()
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.8 })
    map.once('moveend', abrirPopup)
    return () => map.off('moveend', abrirPopup)
  }, [id, lat, lng, map, marcadores])

  return null
}

// Leyenda fija en la esquina inferior izquierda: color y conteo por grupo, y cómo se ve cada estado.
function Leyenda({ reportes }) {
  const ref = useRef(null)
  const [abiertaAlInicio] = useState(() => window.innerWidth > 760)

  useEffect(() => {
    // Que los clics y la rueda del mouse sobre la leyenda no muevan el mapa
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  return (
    <div className="leaflet-bottom leaflet-left">
      <details ref={ref} className="leaflet-control leyenda" open={abiertaAlInicio}>
        <summary className="leyenda__titulo">REPORTES · {reportes.length}</summary>
        {GRUPOS.map((g) => {
          const n = reportes.filter((r) => r.grupo === g.codigo).length
          return (
            <div key={g.codigo} className="leyenda__fila" style={{ opacity: n ? 1 : 0.45 }}>
              <span className="leyenda__punto" style={{ background: g.color }} />
              <span className="leyenda__codigo">{g.codigo}</span>
              <span className="leyenda__nombre">{g.nombre}</span>
              <strong>{n}</strong>
            </div>
          )
        })}
        <div className="leyenda__estados">
          <span>
            <i className="pin pin--muestra pin--pulso" /> Recibido
          </span>
          <span>
            <i className="pin pin--muestra pin--validado" /> Validado
          </span>
          <span>
            <i className="pin pin--muestra pin--despachado" /> Despachado
          </span>
          <span>
            <i className="pin pin--muestra pin--apagado" /> Cerrado o descartado
          </span>
        </div>
      </details>
    </div>
  )
}
