// Grupos de emergencia del protocolo de despacho de Bomberos Cali (Despacho V4).
// El color de cada grupo es el mismo en toda la app: tarjetas de la landing,
// formulario, lista del operador, pines del mapa y pines de la escena 3D.
export const GRUPOS = [
  {
    codigo: 100,
    nombre: 'Incendios',
    color: '#dc2626',
    ejemplos: 'Edificación, vehículo, vegetación, basuras',
    unidadSugerida: 'Máquina',
  },
  {
    codigo: 200,
    nombre: 'Explosión o ruptura sin incendio',
    color: '#ea580c',
    ejemplos: 'Explosión, ruptura de equipos',
    unidadSugerida: 'Máquina',
  },
  {
    codigo: 300,
    nombre: 'Rescates y emergencias médicas',
    color: '#2563eb',
    ejemplos: 'Accidente de tránsito, personas en ascensor, caída en río',
    unidadSugerida: 'Ambulancia',
  },
  {
    codigo: 400,
    nombre: 'Condiciones peligrosas sin incendio',
    color: '#ca8a04',
    ejemplos: 'Fuga u olor a gas, línea eléctrica caída, HazMat',
    unidadSugerida: 'HazMat',
  },
  {
    codigo: 500,
    nombre: 'Llamadas de servicio',
    color: '#16a34a',
    ejemplos: 'Solicitudes que no son emergencia inmediata',
    unidadSugerida: 'Rescate',
  },
  {
    codigo: 800,
    nombre: 'Clima severo y desastres naturales',
    color: '#0891b2',
    ejemplos: 'Inundación, vendaval, sismo',
    unidadSugerida: 'Rescate',
  },
  {
    codigo: 900,
    nombre: 'Tipo de incidente especial, no clasificado',
    color: '#7c3aed',
    ejemplos: 'Lo que no encaja en los demás',
    unidadSugerida: 'Máquina',
  },
]

// Busca un grupo por su código (acepta número o texto: 100 o '100')
export const grupoPorCodigo = (codigo) => GRUPOS.find((g) => g.codigo === Number(codigo))

export const colorDeGrupo = (codigo) => grupoPorCodigo(codigo)?.color ?? '#6b7280'
