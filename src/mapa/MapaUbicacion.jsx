import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './mapa.css'
import { crearIcono } from './iconos.js'

// Mini mapa de /reportar: el ciudadano toca el mapa (o arrastra el pin) para marcar el punto
// exacto de la emergencia. Así el operador recibe coordenadas reales y no solo el centro del barrio.
//   centro: [lat, lng] del barrio elegido      punto: [lat, lng] marcado
export default function MapaUbicacion({ centro, punto, color, onElegir }) {
  return (
    <MapContainer center={centro} zoom={15} className="mini-mapa" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AlTocarElMapa onElegir={onElegir} />
      <SeguirAlBarrio centro={centro} />
      <Marker
        position={punto}
        icon={crearIcono(color, { clases: 'pin--pulso' })}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng()
            onElegir(lat, lng)
          },
        }}
      />
    </MapContainer>
  )
}

// useMapEvents: escucha el clic (o toque) sobre el mapa
function AlTocarElMapa({ onElegir }) {
  useMapEvents({
    click: (e) => onElegir(e.latlng.lat, e.latlng.lng),
  })
  return null
}

// Si el ciudadano cambia de barrio, el mapa vuela al centro del barrio nuevo
function SeguirAlBarrio({ centro }) {
  const map = useMap()
  const [lat, lng] = centro
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 0.6 })
  }, [lat, lng, map])
  return null
}
