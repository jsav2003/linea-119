// Reduce una foto (máx. 720 px por lado, JPEG) y la convierte en texto base64 (data URL)
// para poder guardarla en localStorage. Una foto de celular pesa 3-10 MB; así queda en ~100 kB.
export function comprimirImagen(archivo, { ladoMaximo = 720, calidad = 0.6 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo)
    const imagen = new Image()

    imagen.onload = () => {
      const escala = Math.min(1, ladoMaximo / Math.max(imagen.naturalWidth, imagen.naturalHeight))
      const lienzo = document.createElement('canvas')
      lienzo.width = Math.round(imagen.naturalWidth * escala)
      lienzo.height = Math.round(imagen.naturalHeight * escala)
      const ctx = lienzo.getContext('2d')
      ctx.fillStyle = '#ffffff' // fondo blanco para las imágenes PNG transparentes
      ctx.fillRect(0, 0, lienzo.width, lienzo.height)
      ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height)
      URL.revokeObjectURL(url)
      resolve(lienzo.toDataURL('image/jpeg', calidad))
    }

    imagen.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`No se pudo leer la imagen ${archivo.name}`))
    }

    imagen.src = url
  })
}
