const HORA = new Intl.DateTimeFormat('es-CO', { hour: 'numeric', minute: '2-digit' })
const FECHA_Y_HORA = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
})

// "3:45 p. m."
export const hora = (iso) => HORA.format(new Date(iso))

// "2 de noviembre, 3:45 p. m."
export const fechaYHora = (iso) => FECHA_Y_HORA.format(new Date(iso))

// "hace 5 min", "hace 2 h 10 min"
export function haceCuanto(iso, ahora = Date.now()) {
  const minutos = Math.max(0, Math.floor((ahora - new Date(iso).getTime()) / 60000))
  if (minutos < 1) return 'hace un momento'
  if (minutos < 60) return `hace ${minutos} min`
  const horas = Math.floor(minutos / 60)
  return minutos % 60 ? `hace ${horas} h ${minutos % 60} min` : `hace ${horas} h`
}

// "300 123 4567"
export const formatoTelefono = (telefono = '') => telefono.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3')

// "300 ••• 4567": para mostrarlo sin exponer el número completo
export const telefonoOculto = (telefono = '') => `${telefono.slice(0, 3)} ••• ${telefono.slice(-4)}`

// "3.44750, -76.54100"
export const coordenadas = (lat, lng) => `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
