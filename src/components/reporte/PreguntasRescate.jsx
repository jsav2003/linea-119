import { Opciones } from './Campo.jsx'
import { OPCIONES_EDAD, OPCIONES_SEXO, OPCIONES_SI_NO } from '../../data/preguntasRescate.js'

// Preguntas de continuación del grupo 300: aparecen solo si se elige ese grupo.
export default function PreguntasRescate({ form, onCambiar, errorDe }) {
  const critico = form.respira === 'No' || form.consciente === 'No'

  return (
    <div className="preguntas-rescate">
      <p className="preguntas-rescate__titulo">Sobre la persona afectada</p>
      <Opciones
        nombre="sexo"
        etiqueta="Sexo"
        opciones={OPCIONES_SEXO}
        valor={form.sexo}
        onCambiar={(valor) => onCambiar('sexo', valor)}
        error={errorDe('sexo')}
      />
      <Opciones
        nombre="edad"
        etiqueta="Edad aproximada"
        opciones={OPCIONES_EDAD}
        valor={form.edad}
        onCambiar={(valor) => onCambiar('edad', valor)}
        error={errorDe('edad')}
      />
      <Opciones
        nombre="consciente"
        etiqueta="¿Está consciente?"
        opciones={OPCIONES_SI_NO}
        valor={form.consciente}
        onCambiar={(valor) => onCambiar('consciente', valor)}
        error={errorDe('consciente')}
      />
      <Opciones
        nombre="respira"
        etiqueta="¿Respira?"
        opciones={OPCIONES_SI_NO}
        valor={form.respira}
        onCambiar={(valor) => onCambiar('respira', valor)}
        error={errorDe('respira')}
      />

      {critico && (
        <div className="alerta-urgente" role="alert">
          <p>
            <strong>Llama ya al 119.</strong> Si la persona no respira o no responde, el radio operador te
            guía por teléfono mientras llega la unidad. Puedes terminar este reporte después.
          </p>
          <a href="tel:119" className="boton boton--primario">
            Llamar al 119
          </a>
        </div>
      )}
    </div>
  )
}
