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
import { CONSEJOS_POR_GRUPO } from '../data/consejos.js'
import { useTitulo } from '../hooks/useTitulo.js'
import { ETIQUETAS, FORMULARIO_INICIAL, validarFormulario } from '../utils/validacion.js'
import { comprimirImagen } from '../utils/imagenes.js'
import { coordenadas } from '../utils/formato.js'
import './Reportar.css'

const BARRIOS_ORDENADOS = [...BARRIOS].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

// Pasos obligatorios del panel "Tu reporte" y los campos que tiene cada uno
const PASOS_RESUMEN = [
  { numero: 1, titulo: 'Emergencia', campos: ['grupo', 'queVe', 'sexo', 'edad', 'consciente', 'respira'] },
  { numero: 2, titulo: 'Teléfono', campos: ['telefono'] },
  { numero: 3, titulo: 'Ubicación', campos: ['direccion', 'barrio', 'referencia', 'edificio'] },
  { numero: 4, titulo: 'Nombre', campos: ['nombres', 'apellidos'] },
]

// Guía lateral: consejos mientras no se ha elegido el tipo de emergencia, y qué tener a mano
const CONSEJOS_GENERALES = [
  'Ponte a salvo antes de escribir.',
  'Si hay fuego o humo cerca, sal primero y reporta desde afuera.',
  'Responde lo que sepas: el radio operador te llama si falta algo.',
]
const TENER_A_MANO = [
  'La dirección o un punto de referencia cercano',
  'Un teléfono donde te puedan llamar',
  'Si es seguro, una foto del lugar',
]

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

  // Desde el panel "Tu reporte": muestra los errores del paso y lleva a su primer campo pendiente
  function irAlPaso(paso) {
    const pendientes = paso.campos.filter((campo) => errores[campo])
    if (pendientes.length === 0) {
      document.getElementById(`bloque-${paso.numero}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    pendientes.forEach(tocar)
    irAlCampo(pendientes[0])
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
      <Encabezado ancho="contenedor--formulario" />
      <main className="contenedor contenedor--formulario reportar">
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

        <div className="reportar__cuerpo">
          <GuiaLateral grupo={form.grupo} />

          <form className="formulario" onSubmit={enviar} noValidate>
            <div className="formulario__bloques">
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
                <div className="campo-corto">
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
                </div>
              </Bloque>

              <Bloque numero={3} titulo="¿Dónde es tu emergencia?">
                <div className="fila-2">
                  <CampoTexto
                    id="campo-direccion"
                    etiqueta="Dirección"
                    ayuda="Calle o carrera con el número."
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
                    ayuda="Con él la ubicamos en el mapa del operador."
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
                </div>

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

                <div className="fila-2">
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
                </div>
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
            </div>

            {/* Panel lateral (fijo al bajar en pantallas anchas): avance por pasos y botón de enviar */}
            <aside className="envio" aria-label="Tu reporte">
              <ResumenPasos errores={errores} fotos={fotos} video={video} onIrAlPaso={irAlPaso} />
              {!listo && (
                <p className="envio__faltan" id="envio-faltan">
                  Para enviar, completa los pasos sin ✓ ({faltantes.length === 1 ? 'falta 1 campo' : `faltan ${faltantes.length} campos`}).
                  Toca un paso para ir a lo que falta.
                </p>
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
            </aside>
          </form>
        </div>
      </main>
    </div>
  )
}

// Guía de la columna izquierda (solo en pantallas muy anchas): llamar al 119, consejos de seguridad
// según el tipo de emergencia elegido y lo que conviene tener a mano.
function GuiaLateral({ grupo }) {
  const elegido = grupoPorCodigo(grupo)
  const consejos = elegido ? CONSEJOS_POR_GRUPO[elegido.codigo] : CONSEJOS_GENERALES

  return (
    <aside className="guia" aria-label="Mientras reportas">
      <div className="guia__llamar">
        <p className="rotulo guia__rotulo">¿Hay personas en peligro inmediato?</p>
        <a href="tel:119" className="boton boton--primario boton--bloque">
          Llamar al 119
        </a>
        <p className="guia__nota">El reporte web no reemplaza la llamada.</p>
      </div>

      {/* key: al cambiar de grupo, los consejos entran con una transición corta */}
      <section
        key={elegido?.codigo ?? 'general'}
        className="guia__bloque guia__bloque--consejos"
        style={{ '--color': elegido?.color ?? 'var(--negro-2)' }}
        aria-live="polite"
      >
        <h2 className="rotulo guia__rotulo">{elegido ? 'Mientras tanto, por tu seguridad' : 'Antes de empezar'}</h2>
        {elegido && (
          <p className="guia__grupo">
            <span className="guia__codigo">{elegido.codigo}</span> {elegido.nombre}
          </p>
        )}
        <ul className="guia__lista">
          {consejos.map((consejo) => (
            <li key={consejo}>{consejo}</li>
          ))}
        </ul>
      </section>

      <section className="guia__bloque">
        <h2 className="rotulo guia__rotulo">Ten a mano</h2>
        <ul className="guia__lista guia__lista--marcas">
          {TENER_A_MANO.map((cosa) => (
            <li key={cosa}>{cosa}</li>
          ))}
        </ul>
      </section>
    </aside>
  )
}

// Avance del reporte: un renglón por paso con ✓ o lo que le falta. Tocar un paso lleva a él.
function ResumenPasos({ errores, fotos, video, onIrAlPaso }) {
  const pasos = PASOS_RESUMEN.map((paso) => ({ ...paso, faltan: paso.campos.filter((campo) => errores[campo]) }))
  const hechos = pasos.filter((paso) => paso.faltan.length === 0).length
  const archivos = [fotos.length > 0 && `${fotos.length} foto${fotos.length > 1 ? 's' : ''}`, video && 'video']
    .filter(Boolean)
    .join(' y ')

  return (
    <div className="resumen">
      <div className="resumen__cabeza">
        <p className="rotulo resumen__titulo">Tu reporte</p>
        <p className="resumen__conteo">
          <strong>{hechos}</strong> de {pasos.length} pasos listos
        </p>
      </div>
      <div className="resumen__barra" aria-hidden="true">
        {pasos.map((paso) => (
          <span key={paso.numero} className={paso.faltan.length === 0 ? 'resumen__tramo--lleno' : undefined} />
        ))}
      </div>
      <ol className="resumen__lista">
        {pasos.map((paso) => {
          const completo = paso.faltan.length === 0
          return (
            <li key={paso.numero}>
              <button
                type="button"
                className={`resumen__paso${completo ? ' resumen__paso--listo' : ''}`}
                onClick={() => onIrAlPaso(paso)}
              >
                <span className="resumen__numero" aria-hidden="true">
                  {completo ? '✓' : paso.numero}
                </span>
                <span className="resumen__texto">
                  <strong>
                    <span className="visualmente-oculto">Paso {paso.numero}: </span>
                    {paso.titulo}
                  </strong>
                  <small>{completo ? 'Listo' : `Falta: ${paso.faltan.map((campo) => ETIQUETAS[campo]).join(', ')}`}</small>
                </span>
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            className="resumen__paso resumen__paso--opcional"
            onClick={() => onIrAlPaso({ numero: 5, campos: [] })}
          >
            <span className="resumen__numero" aria-hidden="true">
              5
            </span>
            <span className="resumen__texto">
              <strong>
                <span className="visualmente-oculto">Paso 5: </span>
                Fotos o video
              </strong>
              <small>{archivos ? `${archivos[0].toUpperCase()}${archivos.slice(1)} adjuntos` : 'Opcional, pero ayuda mucho'}</small>
            </span>
          </button>
        </li>
      </ol>
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
