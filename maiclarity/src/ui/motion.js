/**
 * motion — el movimiento de la interfaz, en un solo sitio.
 *
 * Tres reglas:
 *   1. El movimiento explica algo (de donde sale, adonde va, que cambio).
 *      Si no explica nada, no se anima.
 *   2. Nada dura mas de 260 ms salvo la entrada de la pagina.
 *   3. Si el sistema pide menos movimiento, no hay movimiento.
 */

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* ------------------------------------------------------------------ *
 *  Subrayado que se desliza entre pestanas
 * ------------------------------------------------------------------ */

/**
 * Sustituye el subrayado por pestana por uno compartido que viaja de una
 * a otra: el ojo sigue el trazo en lugar de verlo aparecer y desaparecer.
 */
export function trackTabs(container) {
  if (!container) return () => {};

  const ink = document.createElement('span');
  ink.className = 'tabs__ink';
  ink.setAttribute('aria-hidden', 'true');
  container.appendChild(ink);

  let ready = false;

  const update = () => {
    const active = container.querySelector('.tabs__btn.is-active');
    if (!active) {
      ink.style.opacity = '0';
      return;
    }
    const left = active.offsetLeft;
    const width = active.offsetWidth;
    if (!width) return;
    ink.style.opacity = '1';
    ink.style.transform = `translateX(${left}px)`;
    ink.style.width = `${width}px`;
    // El primer posicionamiento no se anima: no viene de ninguna parte.
    if (!ready) {
      ready = true;
      requestAnimationFrame(() => ink.classList.add('is-ready'));
    }
  };

  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.target.classList.contains('tabs__btn'))) update();
  });
  observer.observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });

  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(update).observe(container);
  }
  window.addEventListener('resize', update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update).catch(() => {});
  update();
  // Segunda pasada por si la tipografia cambia el ancho de las pestanas.
  setTimeout(update, 120);

  return update;
}

/* ------------------------------------------------------------------ *
 *  Aparicion al llegar con el scroll
 * ------------------------------------------------------------------ */

/**
 * Aparicion progresiva del contenido.
 *
 * Deliberadamente NO depende de IntersectionObserver ni de rAF: si el
 * navegador no los ejecuta (pestana en segundo plano, motor empotrado,
 * ahorro de energia), el contenido se quedaria invisible para siempre.
 * Aqui se comprueba la posicion directamente y, pase lo que pase, un
 * temporizador de seguridad lo muestra todo.
 */
export function setupReveals(root = document) {
  const nodes = [...root.querySelectorAll('[data-reveal]')];
  if (nodes.length === 0) return;

  const pending = new Set(nodes);
  const revealAll = () => {
    pending.forEach((node) => node.classList.add('is-revealed'));
    pending.clear();
    stop();
  };

  if (prefersReducedMotion()) {
    revealAll();
    return;
  }

  let last = 0;
  function check() {
    const limit = window.innerHeight * 0.92;
    for (const node of [...pending]) {
      const rect = node.getBoundingClientRect();
      if (rect.top < limit && rect.bottom > -80) {
        node.classList.add('is-revealed');
        pending.delete(node);
      }
    }
    if (pending.size === 0) stop();
  }

  function onScroll() {
    const now = Date.now();
    if (now - last < 80) return;
    last = now;
    check();
  }

  function stop() {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    clearTimeout(safety);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // Red de seguridad. Si el navegador no esta pintando (pestana en segundo
  // plano, motor empotrado, ahorro de energia) tampoco habra eventos de
  // scroll: en ese caso se muestra todo y nos ahorramos la animacion, que
  // nadie iba a ver. Si rAF responde, el entorno es sano y se deja que el
  // scroll haga su trabajo.
  let painting = false;
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      painting = true;
    });
  }
  const safety = setTimeout(() => {
    if (!painting) revealAll();
  }, 1200);

  check();
}

/* ------------------------------------------------------------------ *
 *  Transicion entre vistas del resultado
 * ------------------------------------------------------------------ */

/**
 * Usa la View Transitions API cuando existe; si no, hace el cambio y ya.
 * Nunca bloquea: el resultado es el mismo, con o sin animacion.
 */
let transitionInFlight = false;

export function withViewTransition(update) {
  if (
    transitionInFlight ||
    prefersReducedMotion() ||
    typeof document.startViewTransition !== 'function'
  ) {
    update();
    return;
  }
  try {
    transitionInFlight = true;
    const transition = document.startViewTransition(update);
    // Si el navegador aborta la transicion (otra encima, pestana oculta...)
    // rechaza sus promesas: se recogen aqui para no ensuciar la consola.
    const quiet = (promise) => {
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    };
    quiet(transition.ready);
    quiet(transition.updateCallbackDone);
    quiet(transition.finished);
    if (transition.finished && typeof transition.finished.finally === 'function') {
      transition.finished.finally(() => {
        transitionInFlight = false;
      });
    } else {
      transitionInFlight = false;
    }
  } catch (error) {
    transitionInFlight = false;
    update();
  }
}

/* ------------------------------------------------------------------ *
 *  Cabecera que se asienta al bajar
 * ------------------------------------------------------------------ */

export function setupHeaderScroll(header) {
  if (!header) return;
  // Alternar una clase es barato: no hace falta pasar por rAF, que ademas
  // no siempre se ejecuta.
  const apply = () => header.classList.toggle('is-scrolled', window.scrollY > 6);
  window.addEventListener('scroll', apply, { passive: true });
  apply();
}

/* ------------------------------------------------------------------ *
 *  Contenido recien llegado
 * ------------------------------------------------------------------ */

/** Marca un contenedor como "acabado de llegar" para que entre con calma. */
export function markFresh(node) {
  if (!node || prefersReducedMotion()) return;
  node.classList.remove('is-fresh');
  // Reinicia la animacion aunque el nodo ya la hubiera reproducido.
  void node.offsetWidth;
  node.classList.add('is-fresh');
}
