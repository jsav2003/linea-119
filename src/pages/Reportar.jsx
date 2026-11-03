import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import { CampoSelect, CampoTexto } from '../components/reporte/Campo.jsx'
import SelectorGrupo from '../components/reporte/SelectorGrupo.jsx'
import PreguntasRescate from '../components/reporte/PreguntasRescate.jsx'
import SelectorArchivos from '../components/reporte/SelectorArchivos.jsx'
import { InsigniaEstado } from '../components/Insignias.jsx'
import MapaUbicacion from '../mapa/MapaUbicacion.jsx'
import { useReportes } from '../estado/ReportesContext.jsx'
import { estaTerminado } from '../estado/estados.js'
import { BARRIOS } from '../data/barrios.js'
import { colorDeGrupo, grupoPorCodigo } from '../data/grupos.js'
import { useTitulo } from '../hooks/useTitulo.js'
import { ETIQUETAS, FORMULARIO_INICIAL, validarFormulario } from '../utils/validacion.js'
import { comprimirImagen } from '../utils/imagenes.js'
import { coordenadas } from '../utils/formato.js'
import './Reportar.css'

const BARRIOS_ORDENADOS = [...BARRIOS].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

// Si se llega desde la landing con ?grupo=100, ese grupo ya queda elegido
const grupoInicial = (valor) => (grupoPorCodigo(valor) ? Number(valor) : '')

// Pantalla 2 (/reportar): el interrogatorio inicial del protocolo convertido en formulario controlado.
export default function Reportar() {
  useTitulo('Reportar emergencia')
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const { reportes, crearReporte } = useReportes()

  const [form, setForm] = useState(() => ({ ...FORMULARIO_INICIAL, grupo: grupoInicial(parametros.get('grupo')) }))
  const [tocados, setTocados] = useState({}) // campos que la persona ya visitó (para mostrar su error)
  const [fotos, setFotos] = useState([]) // [{ id, archivo, url }]
  const [video, setVideo] = useState(null) // { archivo, url }
  const [enviando, setEnviando] = useState(false)

  // Se valida en cada render: el botón de enviar se activa solo si no hay errores
  const errores = validarFormulario(form)
  const faltantes = Object.keys(errores)
  const listo = faltantes.length === 0
  const errorDe = (campo) => (tocados[campo] ? errores[campo] : undefined)

  // Al salir de la pantalla se libera la memoria de las vistas previas (URL.createObjectURL)
  const archivos = useRef({ fotos: [], video: null, enviado: false })
  useEffect(() => {
    archivos.current = { ...archivos.current, fotos, video }
  }, [fotos, video])
  useEffect(
    () => () => {
      const actuales = archivos.current
      actuales.fotos.forEach((f) => URL.revokeObjectURL(f.url))
      if (actuales.video && !actuales.enviado) URL.revokeObjectURL(actuales.video.url) // si se envió, el reporte lo usa
    },
    [],
  )

  function cambiar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function tocar(campo) {
    setTocados((t) => (t[campo] ? t : { ...t, [campo]: true }))
  }

  function elegirBarrio(nombre) {
    const barrio = BARRIOS.find((b) => b.nombre === nombre)
    // El barrio trae sus coordenadas: con eso el reporte ya se puede ubicar en el mapa
    setForm((f) => ({ ...f, barrio: nombre, lat: barrio?.lat ?? null, lng: barrio?.lng ?? null, ubicacionExacta: false }))
  }

  function marcarPunto(lat, lng) {
    setForm((f) => ({ ...f, lat, lng, ubicacionExacta: true }))
  }

  function cambiarNoAplica(marcado) {
    setForm((f) => ({ ...f, edificioNoAplica: marcado, edificio: marcado ? '' : f.edificio }))
    tocar('edificio')
  }

  // Desde la lista de "lo que falta": lleva al campo y muestra su mensaje de error
  function irAlCampo(campo) {
    tocar(campo)
    const elemento = document.getElementById(`campo-${campo}`)
    elemento?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    elemento?.focus({ preventScroll: true })
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (!listo || enviando) return
    setEnviando(true)

    // Las fotos se reducen y se guardan como texto (data URL) para que el operador las vea
    const fotosGuardadas = []
    for (const foto of fotos) {
      try {
        fotosGuardadas.push(await comprimirImagen(foto.archivo))
      } catch {
        // Si el navegador no puede leer una foto (p. ej. formato HEIC), se omite esa foto
      }
    }

    const id = crearReporte({
      grupo: form.grupo,
      queVe: form.queVe.trim(),
      continuacion:
        form.grupo === 300
          ? { sexo: form.sexo, edad: form.edad, consciente: form.consciente, respira: form.respira }
          : null,
      telefono: form.telefono,
      direccion: form.direccion.trim(),
      barrio: form.barrio,
      lat: form.lat,
      lng: form.lng,
      ubicacionExacta: form.ubicacionExacta,
      referencia: form.referencia.trim(),
      edificio: form.edificioNoAplica ? '' : form.edificio.trim(),
      edificioNoAplica: form.edificioNoAplica,
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      fotos: fotosGuardadas,
      video: video ? { url: video.url, nombre: video.archivo.name } : null,
    })
    archivos.current.enviado = true
    navigate(`/reportar/${id}`) // pantalla de confirmación (respuesta automática)
  }

  const enCurso = reportes.filter((r) => !r.simulado && !estaTerminado(r.estado)).slice(0, 3)
  const barrio = BARRIOS.find((b) => b.nombre === form.barrio)

  return (
    <div className="pagina-ciudadano">
      <Encabezado />
      <main className="contenedor contenedor--estrecho reportar">
        <Link to="/" className="volver">
          ← Volver al inicio
        </Link>
        <h1>Reportar emergencia</h1>
        <p className="reportar__intro">
          Son las mismas preguntas que te haría el radio operador por teléfono. Los campos con{' '}
          <span className="campo__obligatorio">*</span> son obligatorios.
        </p>

        {enCurso.length > 0 && (
          <aside className="en-curso" aria-label="Tus reportes en curso">
            <p className="en-curso__titulo">Tus reportes en curso</p>
            <ul>
              {enCurso.map((r) => (
                <li key={r.id}>
                  <Link to={`/reportar/${r.id}`}>{r.id}</Link> <InsigniaEstado estado={r.estado} />
                </li>
              ))}
            </ul>
          </aside>
        )}

        <form className="formulario" onSubmit={enviar} noValidate>
          <Bloque numero={1} titulo="¿Cuál es tu emergencia?">
            <SelectorGrupo
              valor={form.grupo}
              onCambiar={(codigo) => {
                cambiar('grupo', codigo)
                tocar('grupo')
              }}
              error={errorDe('grupo')}
            />
            <CampoTexto
              id="campo-queVe"
              multilinea
              rows={4}
              maxLength={500}
              etiqueta="¿Qué ves?"
              ayuda="Qué se quema, si hay personas atrapadas o heridas, si hay humo, cables caídos…"
              error={errorDe('queVe')}
              value={form.queVe}
              onChange={(e) => cambiar('queVe', e.target.value)}
              onBlur={() => tocar('queVe')}
            />
            {form.grupo === 300 && (
              <PreguntasRescate
                form={form}
                onCambiar={(campo, valor) => {
                  cambiar(campo, valor)
                  tocar(campo)
                }}
                errorDe={errorDe}
              />
            )}
          </Bloque>

          <Bloque numero={2} titulo="¿A qué número te llamamos?">
            <CampoTexto
              id="campo-telefono"
              etiqueta="Teléfono"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              placeholder="3001234567"
              ayuda="10 dígitos, solo números. El radio operador puede llamarte para confirmar."
              error={errorDe('telefono')}
              value={form.telefono}
              onChange={(e) => cambiar('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => tocar('telefono')}
            />
          </Bloque>

          <Bloque numero={3} titulo="¿Dónde es tu emergencia?">
            <CampoTexto
              id="campo-direccion"
              etiqueta="Dirección"
              placeholder="Ej.: Calle 5 # 38-25"
              autoComplete="street-address"
              maxLength={120}
              error={errorDe('direccion')}
              value={form.direccion}
              onChange={(e) => cambiar('direccion', e.target.value)}
              onBlur={() => tocar('direccion')}
            />
            <CampoSelect
              id="campo-barrio"
              etiqueta="Barrio"
              ayuda="Con el barrio ubicamos la emergencia en el mapa del radio operador."
              error={errorDe('barrio')}
              value={form.barrio}
              onChange={(e) => elegirBarrio(e.target.value)}
              onBlur={() => tocar('barrio')}
            >
              <option value="">Elige el barrio…</option>
              {BARRIOS_ORDENADOS.map((b) => (
                <option key={b.nombre} value={b.nombre}>
                  {b.nombre}
                </option>
              ))}
            </CampoSelect>

            {barrio && (
              <div className="ubicacion">
                <p className="campo__etiqueta">
                  Punto exacto <span className="campo__opcional">(opcional)</span>
                </p>
                <p className="campo__ayuda">
                  Toca el mapa o arrastra el pin hasta el sitio de la emergencia. Si no, usamos el centro del barrio.
                </p>
                <MapaUbicacion
                  centro={[barrio.lat, barrio.lng]}
                  punto={[form.lat, form.lng]}
                  color={colorDeGrupo(form.grupo || 100)}
                  onElegir={marcarPunto}
                />
                <p className="ubicacion__estado">
                  {form.ubicacionExacta ? '📍 Punto exacto marcado' : 'Ubicación aproximada (centro del barrio)'} ·{' '}
                  {coordenadas(form.lat, form.lng)}
                </p>
              </div>
            )}

            <CampoTexto
              id="campo-referencia"
              etiqueta="Punto de referencia"
              placeholder="Ej.: frente al parque, al lado de la iglesia"
              maxLength={120}
              error={errorDe('referencia')}
              value={form.referencia}
              onChange={(e) => cambiar('referencia', e.target.value)}
              onBlur={() => tocar('referencia')}
            />
            <CampoTexto
              id="campo-edificio"
              etiqueta="Nombre del edificio"
              placeholder="Ej.: Edificio Los Almendros"
              maxLength={80}
              error={errorDe('edificio')}
              value={form.edificio}
              disabled={form.edificioNoAplica}
              onChange={(e) => cambiar('edificio', e.target.value)}
              onBlur={() => tocar('edificio')}
              despues={
                <label className="casilla">
                  <input
                    type="checkbox"
                    checked={form.edificioNoAplica}
                    onChange={(e) => cambiarNoAplica(e.target.checked)}
                  />
                  No aplica (casa, vía pública, lote…)
                </label>
              }
            />
          </Bloque>

          <Bloque numero={4} titulo="¿Cuál es tu nombre?">
            <div className="fila-2">
              <CampoTexto
                id="campo-nombres"
                etiqueta="Nombres"
                autoComplete="given-name"
                maxLength={60}
                error={errorDe('nombres')}
                value={form.nombres}
                onChange={(e) => cambiar('nombres', e.target.value)}
                onBlur={() => tocar('nombres')}
              />
              <CampoTexto
                id="campo-apellidos"
                etiqueta="Apellidos"
                autoComplete="family-name"
                maxLength={60}
                error={errorDe('apellidos')}
                value={form.apellidos}
                onChange={(e) => cambiar('apellidos', e.target.value)}
                onBlur={() => tocar('apellidos')}
              />
            </div>
          </Bloque>

          <Bloque numero={5} titulo="Muéstranos qué pasa" opcional>
            <SelectorArchivos fotos={fotos} onFotos={setFotos} video={video} onVideo={setVideo} />
          </Bloque>

          <div className="envio">
            {!listo && (
              <div className="envio__faltan" id="envio-faltan">
                <p>
                  Para enviar, completa {faltantes.length === 1 ? 'este campo' : `estos ${faltantes.length} campos`}:
                </p>
                <ul>
                  {faltantes.map((campo) => (
                    <li key={campo}>
                      <button type="button" className="enlace" onClick={() => irAlCampo(campo)}>
                        {ETIQUETAS[campo]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="submit"
              className="boton boton--primario boton--grande boton--bloque boton--enviar"
              disabled={!listo || enviando}
              aria-describedby={listo ? undefined : 'envio-faltan'}
            >
              {enviando ? 'Enviando…' : 'Enviar reporte'}
            </button>
            <p className="envio__nota">Prototipo académico: el reporte se guarda solo en este navegador (no hay servidor).</p>
          </div>
        </form>
      </main>
    </div>
  )
}

// Cada bloque es una pregunta del interrogatorio inicial del protocolo
function Bloque({ numero, titulo, opcional = false, children }) {
  const id = `bloque-${numero}`
  return (
    <section className="bloque" aria-labelledby={id}>
      <h2 className="bloque__titulo" id={id}>
        <span className="bloque__numero" aria-hidden="true">
          {numero}
        </span>
        {titulo}
        {opcional && <span className="campo__opcional"> (opcional)</span>}
      </h2>
      {children}
    </section>
  )
}
