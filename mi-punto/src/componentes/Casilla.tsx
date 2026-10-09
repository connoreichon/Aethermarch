import { MarcaCheck } from './Iconos'

interface Props {
  marcada: boolean
  etiqueta: string
  alCambiar: () => void
}

export const Casilla = ({ marcada, etiqueta, alCambiar }: Props) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={marcada}
    aria-label={etiqueta}
    title={etiqueta}
    className="casilla"
    onClick={alCambiar}
  >
    <MarcaCheck />
  </button>
)
