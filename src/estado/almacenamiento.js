// Guardar y leer los reportes en localStorage (no hay backend).
export const CLAVE_REPORTES = 'linea119:reportes'

// Convierte el texto guardado en una lista (o [] si no hay nada o está dañado)
export function aLista(texto) {
  try {
    const datos = JSON.parse(texto)
    return Array.isArray(datos) ? datos : []
  } catch {
    return []
  }
}

// Lectura inicial al abrir la app.
// Un video se guarda como URL temporal (blob:) que deja de existir al recargar la página,
// así que al cargar se marca como no disponible.
export function cargarReportes() {
  try {
    return aLista(localStorage.getItem(CLAVE_REPORTES)).map((r) =>
      r.video ? { ...r, video: { ...r.video, url: null } } : r,
    )
  } catch {
    return []
  }
}

// localStorage guarda unos 5 MB. Si las fotos lo llenan, se guardan los reportes sin fotos
// (en la pestaña actual se siguen viendo porque viven en el estado de React).
export function guardarReportes(reportes, texto = JSON.stringify(reportes)) {
  try {
    localStorage.setItem(CLAVE_REPORTES, texto)
  } catch {
    try {
      const sinFotos = reportes.map((r) =>
        r.fotos?.length ? { ...r, fotos: [], fotosSinGuardar: r.fotos.length } : r,
      )
      localStorage.setItem(CLAVE_REPORTES, JSON.stringify(sinFotos))
    } catch {
      // Ni siquiera cabe el texto: la app sigue funcionando en memoria
    }
  }
}
