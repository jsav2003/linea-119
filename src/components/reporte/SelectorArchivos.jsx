import { useState } from 'react'
import Modal from '../Modal.jsx'
import { RECOMENDACIONES_FOTOS } from '../../data/consejos.js'
import { MAX_FOTOS } from '../../data/limites.js'

const MB = 1024 * 1024
const MAX_PESO_FOTO = 15 * MB
const MAX_PESO_VIDEO = 50 * MB

let contador = 0
const nuevoId = () => `archivo-${Date.now()}-${contador++}`

// Fotos (hasta 3, con miniaturas) y un video corto, con la ventana flotante de recomendaciones.
// Las vistas previas usan URL.createObjectURL: los archivos no se suben a ningún servidor.
//   fotos: [{ id, archivo, url }]   video: { archivo, url } o null
export default function SelectorArchivos({ fotos, onFotos, video, onVideo }) {
  const [aviso, setAviso] = useState('')
  const [verRecomendaciones, setVerRecomendaciones] = useState(false)
  const cupo = MAX_FOTOS - fotos.length

  function agregarFotos(evento) {
    const elegidas = Array.from(evento.target.files ?? [])
    evento.target.value = '' // permite volver a elegir el mismo archivo
    const validas = elegidas.filter((a) => a.type.startsWith('image/') && a.size <= MAX_PESO_FOTO)
    const nuevas = validas.slice(0, cupo).map((archivo) => ({
      id: nuevoId(),
      archivo,
      url: URL.createObjectURL(archivo),
    }))

    const mensajes = []
    if (validas.length < elegidas.length) mensajes.push('Algunos archivos no son imágenes o pesan más de 15 MB.')
    if (validas.length > cupo) mensajes.push(`Máximo ${MAX_FOTOS} fotos: se agregaron ${nuevas.length}.`)
    setAviso(mensajes.join(' '))
    if (nuevas.length > 0) onFotos([...fotos, ...nuevas])
  }

  function quitarFoto(id) {
    const foto = fotos.find((f) => f.id === id)
    if (foto) URL.revokeObjectURL(foto.url) // libera la memoria de la vista previa
    onFotos(fotos.filter((f) => f.id !== id))
    setAviso('')
  }

  function elegirVideo(evento) {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    if (!archivo.type.startsWith('video/') || archivo.size > MAX_PESO_VIDEO) {
      setAviso('El video debe ser un archivo de video de máximo 50 MB.')
      return
    }
    if (video) URL.revokeObjectURL(video.url)
    onVideo({ archivo, url: URL.createObjectURL(archivo) })
    setAviso('')
  }

  function quitarVideo() {
    URL.revokeObjectURL(video.url)
    onVideo(null)
  }

  return (
    <div className="archivos">
      <p className="campo__ayuda">
        Una foto o un video le ahorran preguntas al radio operador. Hasta {MAX_FOTOS} fotos y 1 video corto.{' '}
        <button type="button" className="enlace" onClick={() => setVerRecomendaciones(true)}>
          Ver recomendaciones para tomarlos
        </button>
      </p>

      <div className="archivos__botones">
        <label className={`boton${cupo === 0 ? ' boton--deshabilitado' : ''}`}>
          📷 Agregar fotos
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={agregarFotos}
            disabled={cupo === 0}
            className="visualmente-oculto"
          />
        </label>
        <label className="boton">
          🎥 {video ? 'Cambiar video' : 'Agregar video'}
          <input type="file" accept="video/*" onChange={elegirVideo} className="visualmente-oculto" />
        </label>
      </div>

      {aviso && (
        <p className="archivos__aviso" role="status">
          {aviso}
        </p>
      )}

      {(fotos.length > 0 || video) && (
        <ul className="archivos__miniaturas">
          {fotos.map((foto, i) => (
            <li key={foto.id} className="miniatura">
              <img src={foto.url} alt={`Foto ${i + 1}: ${foto.archivo.name}`} />
              <button
                type="button"
                className="miniatura__quitar"
                onClick={() => quitarFoto(foto.id)}
                aria-label={`Quitar foto ${i + 1}`}
              >
                ×
              </button>
            </li>
          ))}
          {video && (
            <li className="miniatura miniatura--video">
              <video src={video.url} muted playsInline preload="metadata" />
              <span className="miniatura__etiqueta">🎥 Video</span>
              <button type="button" className="miniatura__quitar" onClick={quitarVideo} aria-label="Quitar video">
                ×
              </button>
            </li>
          )}
        </ul>
      )}
      <p className="archivos__cuenta">
        {fotos.length} de {MAX_FOTOS} fotos{video ? ' · 1 video' : ''}
      </p>

      <Modal
        abierto={verRecomendaciones}
        onCerrar={() => setVerRecomendaciones(false)}
        titulo="Cómo tomar fotos y videos útiles"
      >
        <ol className="recomendaciones">
          {RECOMENDACIONES_FOTOS.map((r) => (
            <li key={r.titulo}>
              <strong>{r.titulo}.</strong> {r.texto}
            </li>
          ))}
        </ol>
        <button type="button" className="boton boton--primario boton--bloque" onClick={() => setVerRecomendaciones(false)}>
          Entendido
        </button>
      </Modal>
    </div>
  )
}
