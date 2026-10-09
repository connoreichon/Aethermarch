import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/* Manrope servida desde el propio proyecto (SIL Open Font License
   1.1, vía @fontsource). Sin peticiones a terceros: una página de
   inicio no debería contarle a nadie cuándo la abres. */
import '@fontsource/manrope/latin-400.css'
import '@fontsource/manrope/latin-500.css'
import '@fontsource/manrope/latin-700.css'
import '@fontsource/manrope/latin-800.css'

/* El orden importa: shell.css va DESPUES de componentes.css porque sus
   @media tienen la misma especificidad y deben poder pisarlas. */
import './estilos/tokens.css'
import './estilos/base.css'
import './estilos/componentes.css'
import './estilos/shell.css'
import './estilos/movimiento.css'

import { App } from './App'

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
