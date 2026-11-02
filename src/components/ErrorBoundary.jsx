import { Component } from 'react'

// Si algo adentro falla (p. ej. el navegador no soporta WebGL para la escena 3D),
// muestra `fallback` en lugar de dejar la página en blanco.
// Los error boundaries de React solo se pueden escribir como componentes de clase.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children
  }
}
