// Qué hacer mientras llega la unidad, según el grupo de emergencia.
// Son recomendaciones generales de seguridad: no reemplazan las indicaciones del radio operador.
export const CONSEJOS_POR_GRUPO = {
  100: [
    'Sal del lugar y no regreses por tus pertenencias.',
    'Si hay humo, desplázate agachado, cerca del piso.',
    'No uses ascensores.',
  ],
  200: [
    'Aléjate del lugar: puede haber otra explosión.',
    'No te acerques a estructuras dañadas ni a vidrios rotos.',
    'Si huele a gas, no enciendas ni apagues interruptores.',
  ],
  300: [
    'No muevas a la persona herida, salvo que esté en peligro inmediato.',
    'Si es seguro, quédate cerca y háblale para mantenerla tranquila.',
    'Deja libre el acceso para que la unidad llegue rápido.',
  ],
  400: [
    'Si huele a gas: no prendas fuego ni uses interruptores; abre puertas y ventanas y sal.',
    'Si hay un cable caído, no lo toques y mantén a las personas lejos.',
    'Espera a la unidad en un lugar seguro.',
  ],
  500: [
    'Mantén tu teléfono disponible: el radio operador puede llamarte.',
    'Si la situación empeora, llama al 119.',
  ],
  800: [
    'Aléjate de ríos, quebradas, canales y árboles grandes.',
    'Si tiembla, protégete y evacúa cuando pase el movimiento.',
    'No cruces calles inundadas, ni a pie ni en vehículo.',
  ],
  900: [
    'Aléjate de lo que te parezca peligroso.',
    'Mantén tu teléfono disponible: el radio operador puede llamarte.',
  ],
}

// Recomendaciones para tomar fotos y videos (ventana flotante de /reportar)
export const RECOMENDACIONES_FOTOS = [
  {
    titulo: 'Tu seguridad primero',
    texto: 'No te acerques al fuego, al humo, a cables caídos ni a una fuga de gas para tomar la foto. Si estás en peligro, guarda el celular y ponte a salvo.',
  },
  {
    titulo: 'Primero, el panorama',
    texto: 'Una foto de lejos con el lugar completo (la casa, el edificio, la vía) ayuda a medir el tamaño de la emergencia.',
  },
  {
    titulo: 'Incluye una referencia',
    texto: 'La fachada, el número de la casa, un aviso o un negocio conocido ayudan a ubicar el sitio sin tener que preguntarte.',
  },
  {
    titulo: 'Luego, el detalle',
    texto: 'Una segunda foto más cerca: el tipo de humo, el vehículo, dónde está la persona atrapada. Siempre sin ponerte en riesgo.',
  },
  {
    titulo: 'Celular horizontal y quieto',
    texto: 'Evita el zoom digital y las fotos movidas. De noche, no uses el flash contra el humo: la foto sale blanca.',
  },
  {
    titulo: 'Video corto y narrado',
    texto: 'Entre 10 y 30 segundos. Cuenta lo que ves: «hay dos personas en el segundo piso», «el humo es negro».',
  },
  {
    titulo: 'Respeta a los heridos',
    texto: 'No grabes de cerca a personas heridas: muestra la situación, no a las personas.',
  },
]
