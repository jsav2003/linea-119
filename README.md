# Línea 119 · Bomberos Cali — canal digital

Prototipo web del canal digital de la línea de emergencias 119 del Benemérito Cuerpo de Bomberos
Voluntarios de Cali. El ciudadano reporta su emergencia con la ubicación y fotos, y el radio operador
la ve en un mapa real de Cali, la valida y despacha una unidad. El ciudadano sigue el estado de su
reporte en su pantalla.

Parcial final · Desarrollo Web 2026-2 · Universidad de San Buenaventura Cali.

- **Sitio desplegado:** https://linea-119.vercel.app
- **Repositorio:** https://github.com/jsav2003/linea-119

## Integrantes

| Nombre | Código |
| --- | --- |
| Juan Sebastián Arévalo | _pendiente_ |
| _pendiente_ | _pendiente_ |

## Cómo correrlo

Requisitos: Node 18 o superior y conexión a internet (el mapa descarga las teselas de OpenStreetMap).

```bash
npm install
npm run dev      # abre http://localhost:5173
npm test         # pruebas del protocolo de estados (node:test, sin librerías extra)
npm run build    # versión de producción en dist/
```

### Probar el flujo completo

1. **`/`** → «Reportar emergencia» (también sirve tocar una tarjeta de grupo o un pin de la escena 3D).
2. **`/reportar`** → llenar el formulario. «Enviar reporte» se activa solo cuando todos los campos
   obligatorios están completos; debajo dice qué falta. Al elegir el barrio aparece un mini mapa para
   tocar el punto exacto. Se pueden agregar hasta 3 fotos y un video.
3. **`/reportar/119-AAAAMMDD-NNNN`** → respuesta automática: radicado, hora y estado.
4. **`/operador`** (enlace «Acceso radio operador» en el pie de la landing) → elegir el reporte en la
   lista o en el mapa → Llamar → Marcar como validado → Despachar → Cerrar caso.
5. Volver a la pantalla del ciudadano: el estado cambió.

Para ver los cambios en vivo, en el detalle del operador está el enlace «Abrir la pantalla del
ciudadano en otra pestaña»: con las dos pestañas abiertas, cada cambio del operador aparece al
instante en la del ciudadano, sin recargar. Para el modo de emergencia masiva: «Simular 50 reportes».

## Qué hace cada pantalla

### Landing (`/`)
- Encabezado con la identidad de Bomberos Cali / Línea 119 y el llamado «¿Tienes una emergencia?».
- «Reportar emergencia» visible sin hacer scroll, también en celular, y «Llamar al 119» (`tel:119`).
- Escena 3D propia al lado del texto (debajo en celular), sin tapar el botón.
- «Cómo funciona» en tres pasos y las 7 tarjetas de grupos con código, nombre, color y ejemplos.
  Cada tarjeta abre el formulario con ese grupo ya elegido (`/reportar?grupo=100`).
- «Acceso radio operador» en el pie de página.

### Reporte del ciudadano (`/reportar`)
Cada pregunta del interrogatorio inicial del protocolo es un bloque del formulario:

| Pregunta del protocolo | Campos obligatorios |
| --- | --- |
| 1. «¿Cuál es su emergencia?» | Grupo (7 tarjetas) · ¿Qué ves? |
| 2. «¿De qué número me llama?» | Teléfono (10 dígitos, solo números: se borra lo que no sea número) |
| 3. «¿Dónde es su emergencia?» | Dirección · Barrio (lista con coordenadas) · Punto de referencia · Nombre del edificio (casilla «No aplica») |
| 4. «¿Cuál es su nombre?» | Nombres · Apellidos |

- Formulario controlado (`useState`). Se valida en cada render (`utils/validacion.js`) y cada campo
  muestra su mensaje de error cuando la persona sale de él.
- Fotos: `<input type="file" multiple accept="image/*">`, hasta 3, con miniaturas
  (`URL.createObjectURL`) y botón para quitar cada una.
- Al enviar, pasa a la confirmación: número de radicado, hora, mensaje automático y el estado actual
  con su línea de tiempo. El estado cambia solo cuando el operador lo actualiza.

### Tablero del radio operador (`/operador`)
- Mapa real de Cali con los reportes del estado global (ya no usa los de prueba).
- Lista con el color y el código del grupo, hora («hace 3 min»), barrio y estado. Al hacer clic, el mapa
  vuela al reporte, abre su popup y se muestra el detalle.
- Detalle: qué ve, fotos (se amplían), datos del ciudadano y de la ubicación, enlace
  «Ver en Google Maps» (`https://www.google.com/maps?q=LAT,LNG`) e historial.
- Atención del caso en 4 pasos: **Llamar** (`tel:`) → **Validar** (puede corregir el grupo) o
  **Descartar** (falso o duplicado, con confirmación) → **Despachar** (Máquina, Rescate, Ambulancia o
  HazMat; el botón solo se activa en casos validados) → **Cerrar caso**.
- Contadores por estado arriba; un clic filtra la lista.
- Diseño en 3 columnas en pantallas grandes, 2 en medianas y mapa arriba con lista o detalle abajo en
  celular.

### Mapa (los TODO del código base)
- `Operador.jsx` usa los reportes del estado global en lugar de `REPORTES_DEMO`.
- `pin--pulso` en los reportes Recibido y la clase nueva `pin--apagado` (gris, opacidad baja) en Cerrado
  y Descartado. Además, Validado tiene borde doble y Unidad despachada el centro oscuro: cada cambio de
  estado se ve en el pin.
- El popup muestra nombre, qué ve y estado (también el grupo, el barrio y la hora).
- `iconos.js` guarda los íconos en caché: si el pin no cambia, React-Leaflet no lo redibuja y el pulso no
  se reinicia en cada render. También se corrigió el ancla para que la punta del pin quede sobre la
  coordenada.

### Escena 3D (`src/three/`)
Un camión de bomberos armado solo con cajas y cilindros (sin modelos externos), en una calle con
edificios, rodeado por los 7 grupos de emergencia como pines del mapa, con los mismos colores de
`data/grupos.js`.

- **Estilo de cómic (`estilo.jsx`):** `MeshToonMaterial` con una rampa de 3 tonos (colores planos, sin
  degradados), contorno negro en cada pieza (`<Outlines>` de drei), sombras duras y fondo gris papel,
  igual que el resto del sitio.
- **El camión:** cabina con vidrios, reflejos, puertas, estribos, espejos, parrilla, faros y
  direccionales; barra de luces de 5 segmentos; carrocería con persianas de compartimentos y rótulo;
  guardabarros, luces traseras, carrete de manguera, tubo de escape, rines con rayos, escalera de dos
  tramos y un cañón de agua en el techo.
- **El entorno (`Carretera.jsx`, `Entorno.jsx`):** vía, andenes, una manzana de edificios con ventanas
  (una textura de una ventana que cada fachada repite), postes de luz, un hidrante y conos.
- **Luces:** ambiental, una direccional con sombras y dos `pointLight` en la sirena.
- **`useFrame`:** el camión entra al cargar y frena; sirena roja y azul que alterna; escalera que se
  levanta y se extiende; ruedas que giran según lo que avanza; vibración del motor; la calle y los
  edificios se mueven hacia atrás; humo del escape; chorro de agua; pines que flotan y giran; y la
  cámara que sigue al mouse.
- **Partículas (`ChorroAgua.jsx`, `Humo.jsx`):** cada efecto es una sola `InstancedMesh` (un solo dibujo
  para todas las gotas o bocanadas), que reutiliza las partículas que ya terminaron.
- **Mouse y toque:** `onPointerOver` sobre el camión enciende la sirena; `onClick` lo hace «salir a la
  emergencia»; tocar el cañón lanza agua. Al pasar el mouse por un pin aparece su grupo (`<Html>` de
  drei) y al hacer clic abre el reporte con ese grupo ya elegido. Con mouse se puede arrastrar para girar
  la maqueta (`<PresentationControls>`); en celular no, para que el dedo pueda hacer scroll.
- El rótulo «BOMBEROS 119» se dibuja en un `<canvas>` 2D y se usa como textura (`CanvasTexture`).
- Se carga con `React.lazy` después de mostrar la landing, así Three.js no retrasa el botón de reporte.
  Si el navegador no tiene WebGL, un `ErrorBoundary` muestra un mensaje en lugar de romper la página.
- Respeta `prefers-reduced-motion`: el camión ya está en su lugar, sin destellos ni movimientos, y el
  chorro de agua aparece quieto.

### Diseño y movimiento
Estilo «editorial brutalista»: base monocromática (negro, blanco, gris papel) con un solo acento rojo,
bordes gruesos y sombras duras en botones, tarjetas y campos. Títulos en Archivo (ancha, en mayúsculas)
y texto en Inter Tight. Los colores de los 7 grupos son los mismos de `data/grupos.js` y solo aparecen
en las tarjetas de grupo, los pines y las insignias.

- **Landing:** titular gigante que sube por líneas al cargar; navegación tipo píldora con un fondo que se
  desliza al enlace bajo el mouse (`NavPildora.jsx`); una frase cuyas palabras pasan de gris a blanco con
  el scroll (`FraseQueSeLlena.jsx`); cifras que cuentan al aparecer (`Cifra.jsx`, solo datos del
  proyecto); tarjetas que aparecen escalonadas (`useAlAparecer.js`, con `IntersectionObserver`) y
  parallax suave en la escena 3D.
- **Formulario y confirmación:** sobrios, solo transiciones cortas (errores, preguntas del grupo 300,
  miniaturas). El botón de enviar se «hunde» al presionarlo. En la confirmación el estado entra con una
  animación y la línea de tiempo se llena tramo por tramo.
- **Tablero del operador:** se mantiene oscuro y sobrio; los contadores cuentan al cambiar
  (`NumeroAnimado.jsx`), los reportes nuevos y los cambios de estado entran con una transición y el
  detalle tiene títulos de sección más claros.
- Sin librerías de animación: animaciones CSS, `requestAnimationFrame` e `IntersectionObserver`.
- Accesibilidad: contraste AA, foco visible en todos los controles, áreas táctiles de 44 px y, con
  `prefers-reduced-motion`, todo aparece ya en su lugar (frase llena, cifras contadas, sin desplazamientos).

## Arquitectura

```
src/
├── App.jsx                  Rutas + <ReportesProvider> envolviéndolas
├── estado/                  ESTADO GLOBAL
│   ├── ReportesContext.jsx  Context + useReducer + localStorage + evento storage
│   ├── reportesReducer.js   Cómo cambia la lista con cada acción (función pura)
│   ├── estados.js           Estados del reporte y qué cambios permite el protocolo
│   ├── nuevoReporte.js      Arma un reporte y su número de radicado
│   ├── almacenamiento.js    Leer y guardar en localStorage
│   ├── simulacion.js        50 reportes ficticios para la emergencia masiva
│   └── reportesReducer.test.js
├── pages/                   Landing, Reportar, Confirmacion, Operador, NoEncontrada (+ su CSS)
├── components/              Reutilizables: Encabezado, Modal, Insignias, Historial, GaleriaFotos…
│   ├── reporte/             Piezas del formulario del ciudadano
│   └── operador/            Piezas del tablero: lista, filtros, detalle, acciones…
├── mapa/                    MapaOperador, MapaUbicacion (mini mapa), íconos y agrupación
├── three/                   Escena 3D: camión, vía, pines y cámara
├── data/                    Grupos, barrios, unidades, consejos y opciones del grupo 300
├── hooks/                   useAhora, useTitulo, useMenosMovimiento
└── utils/                   Validación, formatos, distancias y compresión de fotos
```

### Cómo se comparte el estado entre las pantallas

```
 /reportar ──crearReporte()──┐
                             ▼
/operador ──validar()───► ReportesContext ──(useReducer)──► lista de reportes
          ──despachar()──►   (App.jsx)                          │
                                                                ├──► localStorage (sobrevive a recargar)
 /reportar/:radicado ◄──────── useReportes() ◄──────────────────┤
                                                                └──► evento "storage" ──► otras pestañas
```

- Hay **una sola** lista de reportes, en `ReportesContext.jsx`. Las pantallas la leen con el hook
  `useReportes()` y la cambian con acciones (`crearReporte`, `validar`, `despachar`…). Ningún componente
  guarda su propia copia.
- El reducer es una función pura: recibe la lista y una acción y devuelve la lista nueva. Ahí vive la
  regla del protocolo: si llega «despachar» para un caso que no está validado, la lista no cambia. Por
  eso la regla se cumple aunque alguien saltara la interfaz (ver `npm test`).
- Cada vez que la lista cambia, un `useEffect` la guarda en localStorage. Otro `useEffect` escucha el
  evento `storage`, que el navegador dispara en las **otras** pestañas, y trae esa versión.

### Estados del reporte

```
Recibido ──► Validado ──► Unidad despachada ──► Cerrado
    │
    └──► Descartado (falso o duplicado)
```

## Extras opcionales implementados

1. **Videos y ventana flotante de recomendaciones:** un video corto además de las fotos, y un `<dialog>`
   con 7 recomendaciones para tomarlos.
2. **«Solicitar más información»:** el operador escribe una pregunta (o elige una sugerida). Al
   ciudadano le aparece un aviso en su pantalla y puede responder; la respuesta llega al operador.
3. **Modo emergencia masiva:** «Simular 50 reportes» (el 40 % son del mismo incendio), filtros por grupo
   y estado, agrupación de pines cercanos en el mapa (círculos con el total y un anillo con los colores de
   sus grupos, que se separan al hacer zoom) y lista de **posibles duplicados** (a menos de 500 m y
   1 hora) en el detalle.
4. **Preguntas de continuación del grupo 300:** sexo, edad aproximada, ¿consciente?, ¿respira?. Si la
   persona no respira o no responde, aparece una alerta para llamar al 119 y el reporte llega marcado
   como **crítico**.
5. **Mini mapa en `/reportar`:** tocar el mapa (`useMapEvents`) o arrastrar el pin para marcar el punto
   exacto.
6. **Sincronización de dos pestañas** con el evento `storage`.

## Respuestas a las 5 preguntas de Bomberos

**1. ¿Puede llegarle al radio operador un mapa con la ubicación exacta a partir de las coordenadas del ciudadano?**
- *Qué se hizo:* sí. El barrio trae coordenadas y, además, el ciudadano puede marcar el punto exacto en el
  mini mapa. El reporte guarda la latitud, la longitud y si la ubicación es exacta o aproximada. El
  operador la ve en un mapa real (Leaflet + OpenStreetMap), con vuelo automático, popup y
  «Ver en Google Maps».
- *Qué faltaría para producción:* tomar la ubicación del GPS con la API de geolocalización del navegador,
  con permiso de la persona (quedó fuera porque el parcial excluye las APIs del dispositivo); convertir la
  dirección escrita en coordenadas (geocodificación); cargar todos los barrios de Cali, no 19
  aproximados; y ver en el mapa dónde están las unidades.

**2. ¿Puede el ciudadano recibir una respuesta automática para saber que su reporte fue recibido?**
- *Qué se hizo:* sí. Al enviar, ve el número de radicado, la hora, un mensaje automático y el estado, que
  se actualiza solo cuando el operador lo cambia, con una línea de tiempo y la unidad asignada.
- *Qué faltaría:* enviar la confirmación por SMS o WhatsApp y notificaciones push, porque hoy solo la ve
  si mantiene la página abierta. Eso necesita un servidor.

**3. ¿Qué pasa si hay una emergencia de gran magnitud y llegan reportes masivos?**
- *Qué se hizo:* el modo de emergencia masiva: simulación de 50 reportes, filtros, contadores, agrupación
  en el mapa y posibles duplicados para descartarlos rápido.
- *Qué faltaría:* un servidor que reciba los reportes en cola y los reparta entre varios operadores; que
  agrupe automáticamente los duplicados en un solo incidente; priorizar por gravedad; protegerse del
  abuso (límite de envíos por número, captcha); y que la infraestructura aguante picos de tráfico.

**4. ¿Puede el radio operador, si lo decide, hacer una videollamada al ciudadano?**
- *Qué se hizo:* la videollamada está fuera del alcance del parcial. El prototipo tiene el botón «Llamar»
  (`tel:`) y «Solicitar más información», que pregunta por escrito y recibe la respuesta en el tablero.
- *Qué faltaría:* videollamada desde el navegador con WebRTC (por ejemplo Jitsi, Twilio Video o Daily): el
  operador genera un enlace y el ciudadano lo abre sin instalar nada. Necesita un servidor de
  señalización y servidores TURN, y pedir el consentimiento de la persona.

**5. ¿Se pueden enviar varias fotos o videos, con recomendaciones de cómo tomarlos?**
- *Qué se hizo:* sí. Hasta 3 fotos con miniaturas y un video corto, con una ventana de recomendaciones
  (seguridad primero, foto de panorama, referencia visible, detalle, video corto y narrado). Las fotos se
  reducen a 720 px en JPEG para que quepan en localStorage, y el operador las ve y amplía en el detalle.
- *Qué faltaría:* subir los archivos a un almacenamiento en la nube. Hoy el video solo se ve en la sesión
  en que se envió, porque sin servidor no hay dónde guardarlo. También faltan límites de tamaño, revisión
  del contenido y conservar la hora y el lugar de la foto (metadatos).

## Pregunta de diseño: ¿qué preguntas se pueden omitir con foto, video o videollamada?

1. **El detalle de «¿qué ve?» y la clasificación del grupo.** Una foto muestra qué se quema (casa,
   vehículo, vegetación), el color del humo y cuántos pisos están afectados. El operador confirma o
   corrige el grupo mirando, en lugar de hacer cinco preguntas. Por eso el operador puede corregir el
   grupo al validar.
2. **El punto de referencia y el nombre del edificio.** Con el punto marcado en el mapa y una foto de la
   fachada, el operador ve dónde es y qué edificio es, sin pedir señas.
3. **«¿Está consciente?» y «¿respira?» (grupo 300).** En una videollamada el operador lo ve directamente y
   puede guiar a la persona mientras llega la unidad.
4. **«¿Hay personas atrapadas?»** Un video corto lo muestra.

Lo que no se puede omitir: el **teléfono**, para devolver la llamada, y el **nombre**, que hace al
ciudadano responsable del reporte y ayuda a descartar bromas.

## Decisiones y limitaciones

- **Sin backend:** el estado vive en el Context y se guarda en localStorage. Los reportes solo existen
  en el navegador donde se enviaron.
- **Fotos:** las miniaturas usan `URL.createObjectURL`. Al enviar, cada foto se reduce y se guarda como
  texto (data URL) para que el operador la vea incluso después de recargar. Si localStorage (unos 5 MB)
  se llena, se guardan los reportes sin fotos.
- **Video:** se guarda como URL temporal (`blob:`), que deja de existir al recargar la página.
- **Barrios:** los 19 del código base, con coordenadas aproximadas (centro del barrio).
- **Datos ficticios:** los reportes simulados usan nombres como «Ana Prueba» y teléfonos que empiezan por
  000, que no existen en Colombia.
- **Despliegue:** `vercel.json` redirige todas las rutas a `index.html`, para que `/operador` y
  `/reportar/...` funcionen al abrirlas directamente o recargar.

## Créditos

- Mapa: © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright); capa oscura ©
  [CARTO](https://carto.com/).
- Escena 3D: modelo propio hecho con geometrías de Three.js (no usa modelos externos).
- Librerías: React, React Router, Leaflet, React-Leaflet, Three.js, React Three Fiber, drei y Vite.
- Punto de partida: código base `parcial-119-base` del curso.
