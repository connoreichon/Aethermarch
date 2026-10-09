# Mi Punto

**Abre. Encuentra lo tuyo. Sigue.**

Página de inicio personal: tus accesos, lo que dejaste a medias, tus notas y
tus tareas. Funciona entera en el navegador. Sin cuenta, sin servidor y sin
rastreadores.

## Cómo abrirla

```bash
npm install
npm run dev
```

En `http://localhost:4460`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Comprueba tipos y genera `dist/` |
| `npm run preview` | Sirve `dist/` en el 4461 para revisar el build |
| `npm run fondos` | Regenera los fondos ambientales (necesita Python con Pillow) |

## Cómo desplegarla

Es una web estática: `dist/` se sube tal cual a cualquier hosting de ficheros
(Netlify, Cloudflare Pages, GitHub Pages, un `nginx`). No hay backend, ni
variables de entorno, ni secretos.

Lo único a tener en cuenta: si no se sirve desde la raíz de un dominio, hay que
poner `base: '/ruta/'` en `vite.config.ts` antes de construir.

**No está publicada.** El build está listo y revisado en local; falta destino y
autorización para subirlo.

## Alcance de esta versión

**Hace:** accesos con grupos, favoritos y orden; enlaces guardados para retomar
con nota y marca de terminado; notas con guardado automático; tareas con hasta
tres prioridades; búsqueda interna; calculadora y porcentajes; copia de
seguridad y restauración; primera visita con accesos sugeridos; fondo y nivel de
efectos configurables.

**No hace, y no lo aparenta:** inicio de sesión, sincronización, lectura de
correo o calendario, acceso al historial o a las pestañas, avisos con la web
cerrada, cobros, publicidad ni asistente.

Un acceso a un correo abre ese correo. No hay ninguna cuenta conectada.

## Estructura

```
src/
  config/      tokens de configuración y TODO el texto visible (textos.ts)
  datos/       modelo, validación, almacén, importación y exportación
  componentes/ piezas reutilizables (botón, campo, diálogo, ficha de sitio…)
  secciones/   una vista por archivo
  estilos/     tokens · base · componentes · shell · movimiento
scripts/       generador de los fondos (Python + Pillow)
revision/      capturas y archivos de prueba de importación
```

El orden de importación de los CSS en `main.tsx` importa: `shell.css` va después
de `componentes.css` porque sus `@media` tienen la misma especificidad y deben
poder pisarlas.

## Datos

Todo vive en `localStorage`, clave `mi-punto.datos`, con `version` en el propio
objeto. Lo que entra de fuera —disco o archivo importado— pasa siempre por
`sanear()`, que comprueba estructura, tipos y límites, descarta lo que no
entiende y **solo admite direcciones http y https**. Nunca se ejecuta nada de lo
que venga en un archivo.

Si `localStorage` falla (ventana privada, sin espacio) la interfaz lo dice y
**no muestra «Guardado»**.

### Migraciones

`version: 2` es el esquema actual. Al arrancar, si no existe `mi-punto.datos` se
busca la clave antigua `mi-punto.datos.v1` y se migra: la nota única que tenía
la v1 se convierte en la primera nota de la lista. La clave vieja se deja
intacta por si hiciera falta volver atrás. Probado en navegador.

### Preparado para una cuenta (todavía no existe)

No hay Firebase ni nada que inicie sesión. Lo que sí hay es la costura:

- `src/datos/almacenes/puerto.ts` — interfaz `AlmacenDatos`, asíncrona.
- `src/datos/almacenes/local.ts` — única implementación de hoy.
- `src/hooks/useDatos.ts` — único punto que escribe; recibe el almacén como
  argumento, así que cambiar de medio no obliga a tocar ningún componente.
- `Datos.propietario` (`invitado` hoy) y `Datos.actualizado`, que es lo que hará
  falta para no mezclar escritorios y para decidir qué copia manda.
- Identificadores estables desde que se crean: lo local puede subirse tal cual.

Autenticarse con Google no es lo mismo que autorizar acceso a Gmail. Cualquier
integración con correo sería una fase aparte.

## Documentos

- [DISENO.md](DISENO.md) — tokens, composición, tipografía, estados y referencias.
- [ASSETS.md](ASSETS.md) — origen y licencia de cada recurso.
- [QA.md](QA.md) — qué se ha probado, con qué resultado, y qué queda fuera.
