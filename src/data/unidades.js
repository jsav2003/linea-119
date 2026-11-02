// Unidades que el radio operador puede despachar a un caso validado.
export const UNIDADES = [
  { nombre: 'Máquina', icono: '🚒', descripcion: 'Camión con agua y escalera' },
  { nombre: 'Rescate', icono: '🛟', descripcion: 'Rescate vehicular, en alturas y acuático' },
  { nombre: 'Ambulancia', icono: '🚑', descripcion: 'Atención prehospitalaria' },
  { nombre: 'HazMat', icono: '☣️', descripcion: 'Gas, químicos y materiales peligrosos' },
]

export const esUnidadValida = (nombre) => UNIDADES.some((u) => u.nombre === nombre)
