import { Panel, Vista } from '../componentes/Marco'
import { T } from '../config/textos'

/** Ayuda y privacidad. Lo que dice aquí tiene que ser verdad: si el
 *  comportamiento cambia, cambia también este texto. */
export const Ayuda = () => (
  <Vista titulo={T.ayuda.titulo} descripcion={T.ayuda.subtitulo}>
    <Panel titulo="Cómo se usa" id="t-como">
      <dl style={{ display: 'grid', gap: 'var(--e4)', margin: 0 }}>
        <div>
          <dt style={{ fontWeight: 800 }}>Añadir un acceso</dt>
          <dd style={{ margin: '4px 0 0', color: 'var(--txt-2)' }}>
            En el inicio, pulsa el recuadro con el signo <strong>+</strong> al final de tus accesos. Escribe la
            dirección y el nombre con el que quieras verlo. Desde <strong>Colecciones</strong> puedes editarlos,
            ordenarlos, repartirlos en grupos y decidir cuáles salen en el inicio.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 800 }}>Hacer cosas desde la barra</dt>
          <dd style={{ margin: '4px 0 0', color: 'var(--txt-2)' }}>
            La barra no solo busca: también <strong>hace</strong>. Escribe un correo y te ofrece
            escribirle; un teléfono y te ofrece el WhatsApp; una dirección y te la abre; cualquier
            otra cosa y te ofrece buscarla en tu correo, en tu Drive o en Google. Solo salen los
            servicios que tú tienes guardados.
            <br />
            <br />
            ¿Un sitio que no conoce? En <strong>Colecciones → editar el acceso → Acciones</strong>{' '}
            creas la tuya: le pones nombre y la dirección con <code>{'{q}'}</code> donde quieras que
            vaya lo que escribas. Por ejemplo{' '}
            <code>https://www.milanuncios.com/anuncios/?s={'{q}'}</code>.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 800 }}>Guardar algo para retomar</dt>
          <dd style={{ margin: '4px 0 0', color: 'var(--txt-2)' }}>
            En Colecciones, <strong>Guardar enlace</strong>. Pega la dirección y escribe por dónde ibas. Cuando lo
            termines, márcalo con el tic y deja de aparecer en el inicio.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 800 }}>Descargar una copia</dt>
          <dd style={{ margin: '4px 0 0', color: 'var(--txt-2)' }}>
            En <strong>Ajustes → Tus datos → Descargar una copia</strong>. Se baja un archivo JSON con todo. Para
            volver a cargarlo, <strong>Restaurar desde un archivo</strong>: verás un resumen y tendrás que
            confirmar antes de que sustituya nada.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 800 }}>Ponerlo como página de inicio</dt>
          <dd style={{ margin: '4px 0 0', color: 'var(--txt-2)' }}>
            Mi Punto no puede cambiar la configuración de tu navegador. Tienes que hacerlo tú, en los ajustes de
            inicio o de nueva pestaña de tu navegador, pegando la dirección de esta página.
          </dd>
        </div>
      </dl>
    </Panel>

    <Panel titulo={T.ayuda.privacidad} id="t-privacidad">
      <div style={{ display: 'grid', gap: 'var(--e3)', color: 'var(--txt-2)' }}>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Dónde se guarda.</strong> Todo lo que escribes —accesos, enlaces,
          notas, tareas y tu nombre— se guarda en el almacenamiento local de este navegador, en este dispositivo.
          No hay cuenta, no hay servidor y no se sincroniza con nada.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Si borras los datos del navegador</strong> (historial, cookies y
          datos de sitios), se borra también lo de Mi Punto. Por eso conviene descargar una copia de vez en cuando.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>La búsqueda es interna.</strong> Lo que escribes en el buscador
          solo se compara con tus propios datos. No se envía a ningún sitio.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Los iconos de los accesos</strong> se piden al propio sitio
          (<code>dominio/favicon.ico</code>), no a un servicio de favicons que recibiría tu lista entera. Aun así es
          una petición real: la primera vez que se dibuja un acceso, ese dominio puede deducir que lo tienes
          guardado. Si prefieres evitarlo, cuando un sitio no responde se usa su inicial y no se vuelve a pedir.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Sin terceros.</strong> La tipografía y las imágenes de fondo se
          sirven desde la propia web. No hay analítica, ni publicidad, ni rastreadores.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Enlaces, no cuentas.</strong> Un acceso a un correo abre ese
          correo en una pestaña nueva. Mi Punto no entra en ninguna cuenta ni lee nada de esos servicios.
        </p>
      </div>
    </Panel>

    <Panel titulo={T.ayuda.producto} id="t-producto">
      <div style={{ display: 'grid', gap: 'var(--e3)', color: 'var(--txt-2)' }}>
        <p>
          Mi Punto es una página de inicio personal. Esta primera versión funciona entera en tu navegador.
        </p>
        <p>
          <strong style={{ color: 'var(--txt)' }}>Lo que todavía no hace:</strong> no hay inicio de sesión, ni
          sincronización entre dispositivos, ni lectura de correo o calendario, ni acceso al historial o a tus
          pestañas, ni avisos con la web cerrada.
        </p>
      </div>
    </Panel>
  </Vista>
)
