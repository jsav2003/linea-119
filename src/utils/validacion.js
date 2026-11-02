// Valores iniciales del formulario del ciudadano (formulario controlado)
export const FORMULARIO_INICIAL = {
  // 1. ¿Cuál es su emergencia?
  grupo: '',
  queVe: '',
  sexo: '', // las 4 siguientes solo para el grupo 300
  edad: '',
  consciente: '',
  respira: '',
  // 2. ¿De qué número me llama?
  telefono: '',
  // 3. ¿Dónde es su emergencia?
  direccion: '',
  barrio: '',
  lat: null,
  lng: null,
  ubicacionExacta: false,
  referencia: '',
  edificio: '',
  edificioNoAplica: false,
  // 4. ¿Cuál es su nombre?
  nombres: '',
  apellidos: '',
}

// Nombre visible de cada campo (para la lista de lo que falta)
export const ETIQUETAS = {
  grupo: 'Tipo de emergencia',
  queVe: '¿Qué ves?',
  sexo: 'Sexo de la persona',
  edad: 'Edad aproximada',
  consciente: '¿Está consciente?',
  respira: '¿Respira?',
  telefono: 'Teléfono',
  direccion: 'Dirección',
  barrio: 'Barrio',
  referencia: 'Punto de referencia',
  edificio: 'Nombre del edificio',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
}

const SOLO_LETRAS = /^[\p{L}\s'.-]+$/u

// Devuelve { campo: 'mensaje de error' } con lo que falta o está mal.
// Si devuelve {}, el formulario es válido y se puede enviar.
export function validarFormulario(f) {
  const errores = {}
  const queVe = f.queVe.trim()
  const direccion = f.direccion.trim()

  // 1. ¿Cuál es su emergencia?
  if (!f.grupo) errores.grupo = 'Elige qué tipo de emergencia es.'
  if (!queVe) errores.queVe = 'Describe lo que está pasando.'
  else if (queVe.length < 10) errores.queVe = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  if (Number(f.grupo) === 300) {
    for (const campo of ['sexo', 'edad', 'consciente', 'respira']) {
      if (!f[campo]) errores[campo] = 'Elige una opción (puedes marcar «No sé»).'
    }
  }

  // 2. ¿De qué número me llama?
  if (!f.telefono) errores.telefono = 'Escribe tu número de teléfono.'
  else if (!/^\d{10}$/.test(f.telefono)) {
    errores.telefono = `El teléfono debe tener 10 dígitos (llevas ${f.telefono.length}).`
  }

  // 3. ¿Dónde es su emergencia?
  if (!direccion) errores.direccion = 'Escribe la dirección.'
  else if (direccion.length < 5) errores.direccion = 'La dirección parece incompleta.'
  if (!f.barrio) errores.barrio = 'Elige el barrio de la lista.'
  if (!f.referencia.trim()) errores.referencia = 'Escribe un punto de referencia (un parque, una tienda, una iglesia…).'
  if (!f.edificioNoAplica && !f.edificio.trim()) {
    errores.edificio = 'Escribe el nombre del edificio o marca «No aplica».'
  }

  // 4. ¿Cuál es su nombre?
  validarNombre(f.nombres, 'nombres', errores)
  validarNombre(f.apellidos, 'apellidos', errores)

  return errores
}

function validarNombre(valor, campo, errores) {
  const texto = valor.trim()
  if (!texto) errores[campo] = `Escribe tus ${campo}.`
  else if (texto.length < 2) errores[campo] = 'Es muy corto.'
  else if (!SOLO_LETRAS.test(texto)) errores[campo] = 'Usa solo letras.'
}
