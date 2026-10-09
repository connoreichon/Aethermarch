/** Familia funcional: 20x20, trazo de 1,6, remates redondos.
 *  Es deliberadamente mas simple que los objetos ilustrados: un
 *  boton de cerrar no necesita volumen. */
const TRAZOS: Record<string, string> = {
  buscar: 'M8.6 3.2a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8M12.6 12.6 17 17',
  mas: 'M10 4.6v10.8M4.6 10h10.8',
  lapiz: 'M3.8 16.2l.7-3.6L13 4.1l2.9 2.9-8.5 8.5zM11.5 5.6l2.9 2.9',
  cruz: 'M5.6 5.6l8.8 8.8M14.4 5.6l-8.8 8.8',
  papelera: 'M4.4 5.9h11.2M7.9 5.9V4.3c0-.5.4-.8.8-.8h2.6c.5 0 .8.3.8.8v1.6M6.2 5.9l.8 10.2c0 .5.4.9.9.9h4.2c.5 0 .9-.4.9-.9l.8-10.2',
  externo: 'M11.2 3.6H16.4V8.8M16.4 3.6 9.6 10.4M13.8 11.4v3.8c0 .9-.6 1.5-1.5 1.5H5.1c-.9 0-1.5-.6-1.5-1.5V8c0-.9.6-1.5 1.5-1.5h3.7',
  marcador: 'M5.6 3.6h8.8v12.8L10 12.6l-4.4 3.8z',
  bandera: 'M5.4 3.4v13.2M5.4 4.4h9.8l-2.4 3.6 2.4 3.6H5.4',
  arriba: 'M10 15.6V4.8M5.6 9.2 10 4.8l4.4 4.4',
  abajo: 'M10 4.4v10.8M5.6 10.8 10 15.2l4.4-4.4',
  ajustes: 'M3.4 6.2h3.1M9.9 6.2h6.7M3.4 13.8h6.7M13.5 13.8h3.1M8.2 6.2a1.7 1.7 0 1 0 0 .02M11.8 13.8a1.7 1.7 0 1 0 0 .02',
  check: 'M4.4 10.3 8.3 14.3 15.6 5.9',
  descargar: 'M10 3.4v9M6.2 8.8 10 12.6l3.8-3.8M3.8 16.4h12.4',
  subir: 'M10 12.6v-9M6.2 7.2 10 3.4l3.8 3.8M3.8 16.4h12.4',
  calculadora: 'M5.4 2.9h9.2c.8 0 1.4.6 1.4 1.4v11.4c0 .8-.6 1.4-1.4 1.4H5.4c-.8 0-1.4-.6-1.4-1.4V4.3c0-.8.6-1.4 1.4-1.4zM6.8 6.4h6.4M7.2 10.2h.1M10 10.2h.1M12.8 10.2h.1M7.2 13.4h.1M10 13.4h.1M12.8 13.4h.1',
  aviso: 'M10 3.4 17 16.2H3zM10 8.3v3.3M10 14h.1',
  reloj: 'M10 3.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M10 6.2V10l2.7 1.6',
  volver: 'M16 10H4.4M9 4.6 3.6 10 9 15.4',
  casa: 'M3.4 9.1 10 3.6l6.6 5.5v6.8c0 .6-.4 1-1 1H4.4c-.6 0-1-.4-1-1zM8.1 16.9v-4.6h3.8v4.6',
  documento: 'M5.4 2.8h5.6l3.6 3.6v10.8c0 .5-.4.9-.9.9H5.4c-.5 0-.9-.4-.9-.9V3.7c0-.5.4-.9.9-.9zM10.9 2.9v3.6h3.6',
  rejilla: 'M3.6 4.4h4.6v4.6H3.6zM11.8 4.4h4.6v4.6h-4.6zM3.6 11.6h4.6v4.6H3.6zM11.8 11.6h4.6v4.6h-4.6z',
  pantalla: 'M4 4.4h12c.6 0 1 .4 1 1v6.8c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V5.4c0-.6.4-1 1-1zM7.2 16.6h5.6M10 13.2v3.4',
  estrella: 'M10 2.9l2.26 4.58 5.05.73-3.65 3.56.86 5.03L10 14.43l-4.52 2.37.86-5.03L2.69 8.21l5.05-.73z',
  carpeta: 'M2.9 5.6c0-.8.6-1.4 1.4-1.4h3.5l1.9 2.4h5.9c.8 0 1.4.6 1.4 1.4v6.4c0 .8-.6 1.4-1.4 1.4H4.3c-.8 0-1.4-.6-1.4-1.4z',
  info: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M10 9.2v4.4M10 6.6h.01',
  ayuda: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M8 7.9c.2-1 1-1.7 2-1.7 1.2 0 2.1.8 2.1 1.9 0 1.6-2.1 1.6-2.1 3.1M10 14.2h.01',
  mundo: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M3.2 10h13.6M10 3c1.9 2 2.9 4.4 2.9 7s-1 5-2.9 7c-1.9-2-2.9-4.4-2.9-7s1-5 2.9-7',
  guardar: 'M4.6 3.4h8l3 3v10.2c0 .5-.4.9-.9.9H4.6c-.5 0-.9-.4-.9-.9V4.3c0-.5.4-.9.9-.9zM6.8 3.4v4.2h5.4V3.4M6.8 17.5v-5.2h6.4v5.2',
}

/** Dibujo del tic de la casilla: va aparte porque se anima. */
export const MarcaCheck = () => (
  <svg className="marca-check" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
    <path
      d={TRAZOS.check}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

interface Props {
  nombre: keyof typeof TRAZOS | string
  tamano?: number
  grosor?: number
}

export const Icono = ({ nombre, tamano = 18, grosor = 1.6 }: Props) => {
  const d = TRAZOS[nombre]
  if (!d) return null
  return (
    <svg
      viewBox="0 0 20 20"
      width={tamano}
      height={tamano}
      fill="none"
      stroke="currentColor"
      strokeWidth={grosor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  )
}
