import { Link } from 'react-router-dom'
import Encabezado from '../components/Encabezado.jsx'
import { useTitulo } from '../hooks/useTitulo.js'

export default function NoEncontrada() {
  useTitulo('Página no encontrada')
  return (
    <>
      <Encabezado />
      <main className="contenedor pagina-simple">
        <h1>Página no encontrada</h1>
        <p>La dirección que abriste no existe.</p>
        <Link className="boton boton--primario" to="/">
          Volver al inicio
        </Link>
      </main>
    </>
  )
}
