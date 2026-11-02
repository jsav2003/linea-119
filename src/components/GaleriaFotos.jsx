import { useState } from 'react'
import Modal from './Modal.jsx'

// Fotos y video de un reporte. Las miniaturas se amplían en una ventana flotante.
//   fotos: lista de data URLs (como quedan guardadas en el reporte)
//   video: { url, nombre } o null
export default function GaleriaFotos({ fotos = [], video = null, fotosSinGuardar = 0 }) {
  const [abierta, setAbierta] = useState(null) // índice de la foto ampliada
  const [videoFallo, setVideoFallo] = useState(false)

  return (
    <div className="galeria">
      {fotos.length > 0 && (
        <ul className="galeria__miniaturas">
          {fotos.map((url, i) => (
            <li key={i}>
              <button type="button" className="galeria__miniatura" onClick={() => setAbierta(i)} aria-label={`Ampliar foto ${i + 1}`}>
                <img src={url} alt={`Foto ${i + 1} del reporte`} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {fotosSinGuardar > 0 && (
        <p className="pista">{fotosSinGuardar} foto(s) no cupieron en el almacenamiento del navegador.</p>
      )}

      {video &&
        (video.url && !videoFallo ? (
          <video className="galeria__video" src={video.url} controls playsInline preload="metadata" onError={() => setVideoFallo(true)} />
        ) : (
          <p className="pista">
            🎥 Se envió un video ({video.nombre}). Sin servidor, el video solo se ve en la sesión en que se envió.
          </p>
        ))}

      <Modal
        abierto={abierta !== null}
        onCerrar={() => setAbierta(null)}
        titulo={abierta !== null ? `Foto ${abierta + 1} de ${fotos.length}` : 'Foto'}
        grande
      >
        {abierta !== null && (
          <img className="galeria__ampliada" src={fotos[abierta]} alt={`Foto ${abierta + 1} del reporte, ampliada`} />
        )}
      </Modal>
    </div>
  )
}
