/**
 * main — controlador de la aplicacion.
 *
 * Reparto de responsabilidades:
 *   modules/  logica pura (limpieza, analisis, estilo, export)
 *   ui/       pintado seguro en el DOM
 *   main.js   escucha eventos, decide QUE hay que recalcular y pinta
 *
 * Regla de oro del rendimiento: cambiar un color no vuelve a limpiar el
 * texto, y cambiar el tamano de letra ni siquiera reconstruye los bloques.
 */
import './styles/main.css';

import { brand } from './config/brand.js';
import { createI18n, detectUiLang } from './modules/i18n.js';
import { createTheme, THEMES } from './modules/theme.js';
import { cleanText as runCleaner, CLEAN_STAT_KEYS } from './modules/textCleaner.js';
import { analyzeText } from './modules/analysis.js';
import { ENTITY_KINDS } from './modules/entityFinder.js';
import {
  DEFAULT_STYLE_CONFIG,
  HIGHLIGHT_COLORS,
  FONT_STACKS,
  PRESETS,
  applyPreset,
  buildStyledBlocks,
  resolveColor,
} from './modules/styleEngine.js';
import {
  blocksToHtml,
  buildStandaloneHtml,
  copyPlainText,
  copyRichText,
  downloadHtml,
  downloadText,
  exportFileName,
} from './modules/exporter.js';
import { loadFile, ACCEPT_ATTRIBUTE, FileLoadError } from './modules/fileLoader.js';
import { getExample, getDemoSnippet } from './data/examples.js';
import { createStore, cloneStyleConfig } from './state/store.js';
import { $, el, icon, debounce, formatNumber } from './ui/dom.js';
import { createToaster } from './ui/toast.js';
import { renderStyledBlocks, applyContainerStyle, colorToCss } from './ui/renderer.js';
import {
  trackTabs,
  trackSelection,
  setupReveals,
  setupHeaderScroll,
  withViewTransition,
  markFresh,
  pulse,
} from './ui/motion.js';

/* ------------------------------------------------------------------ *
 *  Arranque
 * ------------------------------------------------------------------ */

const i18n = createI18n(detectUiLang());
const theme = createTheme();
const store = createStore();
const toaster = createToaster($('#toaster'));

const dom = {
  workspace: $('#workspace'),
  sourcePanel: $('#panel-source'),
  sourceInput: $('#source-input'),
  dropzone: $('#dropzone'),
  fileInput: $('#file-input'),
  fileBadge: $('#file-badge'),
  chooseFile: $('#choose-file'),
  loadExample: $('#load-example'),
  toggleSource: $('#toggle-source'),
  cleanOutput: $('#clean-output'),
  styledOutput: $('#styled-output'),
  panelHint: $('#panel-hint'),
  status: $('#status'),
  inspector: $('#inspector'),
  inspectorBackdrop: $('#inspector-backdrop'),
  openInspector: $('#open-inspector'),
  closeInspector: $('#close-inspector'),
  keywordSwatches: $('#keyword-swatches'),
  entitiesEnabled: $('#entities-enabled'),
  entityControls: $('#entity-controls'),
  entitySwatches: $('#entity-swatches'),
  entityList: $('#entity-list'),
  keywordList: $('#keyword-list'),
  keywordControls: $('#keyword-controls'),
  keywordsEnabled: $('#keywords-enabled'),
  focusEnabled: $('#focus-enabled'),
  focusControls: $('#focus-controls'),
  customForm: $('#custom-form'),
  customInput: $('#custom-input'),
  customRules: $('#custom-rules'),
  fontSelect: $('#font-select'),
  sizeRange: $('#size-range'),
  sizeValue: $('#size-value'),
  langSelect: $('#lang-select'),
  stats: $('#stats'),
  repetitions: $('#repetitions'),
  fillers: $('#fillers'),
  undoButton: $('#undo-edit'),
  emptyExample: $('#empty-example'),
  emptyChoose: $('#empty-choose'),
  fixesPopover: $('#fixes-popover'),
  fixesList: $('#fixes-list'),
  presetDesc: $('#preset-desc'),
  keywordsHint: $('#keywords-hint'),
  metaStats: $('#meta-stats'),
  styledDot: $('#styled-dot'),
  demoRaw: $('#demo-raw'),
  demoClean: $('#demo-clean'),
  header: $('.site-header'),
  outputPanel: $('.panel--output'),
  viewTabs: $('.panel--output .tabs'),
  inspectorTabs: $('.tabs--inspector'),
  styleDot: $('#style-dot'),
};

/** Hoja de estilo minuscula para encender las apariciones al pasar el raton. */
const hoverStyle = document.createElement('style');
document.head.appendChild(hoverStyle);

/** Abre o cierra el panel lateral. Se define al cablear los eventos. */
let openInspector = () => {};
/** El panel de estilo solo se presenta una vez por sesion. */
let stylePanelIntroduced = false;
/** El aviso de donde se ven los estilos tambien se da una sola vez. */
let styledJumpAnnounced = false;

/** Cache del ultimo analisis para reutilizar la tokenizacion. */
let analysisCache = null;
/** Marca si el usuario esta escribiendo en el resultado limpio. */
let editingClean = false;

function boot() {
  document.documentElement.lang = i18n.lang;
  document.title = `${brand.productName} — ${i18n.t('meta.title')}`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute('content', brand.description[i18n.lang]);

  const [first, second] = brand.nameParts;
  $('#brand-part-a').textContent = first;
  $('#brand-part-b').textContent = second || '';

  dom.fileInput.setAttribute('accept', ACCEPT_ATTRIBUTE);
  dom.sizeRange.value = String(store.state.styleConfig.size);

  theme.apply();
  i18n.apply();
  setupHeaderScroll(dom.header);
  setupReveals();
  trackTabs(dom.viewTabs);
  trackTabs(dom.inspectorTabs);
  document
    .querySelectorAll('.segmented')
    .forEach((group) => trackSelection(group, { item: '.segmented__btn', ink: 'segmented__ink' }));
  buildSwatches();
  injectFaqSchema();
  wireEvents();

  syncStyleControls();
  renderDemo();
  renderKeywords();
  renderEntities();
  renderCustomRules();
  renderInsights();
  renderOutput();
  updateStatus();
}

/* ------------------------------------------------------------------ *
 *  Documento: limpiar, analizar, pintar
 * ------------------------------------------------------------------ */

function processRawText(raw, source = null) {
  const result = runCleaner(raw);
  const analysis = analyze(result.text, null);

  store.set(
    {
      rawText: raw,
      cleanText: result.text,
      cleanStats: result.stats,
      totalFixes: result.totalFixes,
      manualEdit: false,
      source,
      analysis,
      locatedTerm: null,
      status: raw.trim()
        ? { kind: 'cleaned', params: { fixes: result.totalFixes } }
        : { kind: 'idle', params: null },
    },
    'document'
  );
}

function analyze(text, previous) {
  const analysis = analyzeText(text, {
    langSetting: store.state.analysisLang || 'auto',
    amount: store.state.styleConfig.keywords.amount,
    previous,
  });
  analysisCache = analysis;
  return analysis;
}

const scheduleClean = debounce((value) => {
  processRawText(value);
}, 300);

/** El pegado no espera al debounce: se nota inmediato. */
function processNow(value) {
  scheduleClean.cancel();
  processRawText(value);
}

/* ------------------------------------------------------------------ *
 *  Pintado
 * ------------------------------------------------------------------ */

/** El estado vacio del panel de origen se apaga en cuanto hay una letra. */
function syncEmptyState() {
  const hasText = Boolean(dom.sourceInput.value.trim());
  dom.dropzone.classList.toggle('is-empty', !hasText);
}

function renderOutput() {
  syncEmptyState();
  const { cleanText, view } = store.state;
  const isStyled = view === 'styled';

  dom.cleanOutput.hidden = isStyled;
  dom.styledOutput.hidden = !isStyled;
  dom.panelHint.textContent = i18n.t(isStyled ? 'output.styledHint' : 'output.editableHint');

  if (!editingClean) dom.cleanOutput.value = cleanText;
  dom.cleanOutput.placeholder = i18n.t('output.empty');

  if (isStyled) renderStyled();
}

function renderStyled() {
  const { cleanText, styleConfig, analysis, locatedTerm } = store.state;
  if (!cleanText) {
    dom.styledOutput.replaceChildren(
      el('p', { class: 'empty-note' }, [i18n.t('output.empty')])
    );
    applyContainerStyle(dom.styledOutput, styleConfig);
    return;
  }

  const config = locatedTerm
    ? {
        ...styleConfig,
        customRules: [
          { id: '__locate', text: locatedTerm, kind: 'locate', locate: true },
          ...styleConfig.customRules,
        ],
      }
    : styleConfig;

  const keywords = analysis ? analysis.keywords : [];
  const entities = analysis ? analysis.entities || [] : [];
  const blocks = buildStyledBlocks(cleanText, config, keywords, entities);
  if (locatedTerm) {
    // La regla temporal de localizacion se pinta con su propia clase.
    for (const block of blocks) {
      for (const line of block.lines) {
        for (const segment of line) {
          if (segment.mark && segment.mark.ruleId === '__locate') segment.mark.kind = 'locate';
        }
      }
    }
  }
  renderStyledBlocks(dom.styledOutput, blocks, styleConfig);

  if (locatedTerm) {
    const first = dom.styledOutput.querySelector('.mc-locate');
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

function updateStatus() {
  updateStatusText();
  syncFixesButton();
  const kind = store.state.status.kind;
  dom.outputPanel.classList.toggle('is-working', kind === 'processing' || kind === 'pdf');
}

/** Marca como recien llegada la vista que se este mirando. */
function freshResult() {
  markFresh(store.state.view === 'styled' ? dom.styledOutput : dom.cleanOutput);
}

function updateStatusText() {
  const { status, cleanStats, totalFixes, manualEdit } = store.state;
  const node = dom.status;
  node.className = 'status';
  node.removeAttribute('title');

  if (status.kind === 'idle') {
    node.textContent = i18n.t('status.idle');
    return;
  }
  if (status.kind === 'processing') {
    node.classList.add('is-busy');
    node.textContent = i18n.t('status.processing');
    return;
  }
  if (status.kind === 'pdf') {
    node.classList.add('is-busy');
    node.textContent = i18n.t('status.pdf', status.params);
    return;
  }
  if (status.kind === 'scanned') {
    node.classList.add('is-warn');
    node.textContent = i18n.t('status.scanned');
    return;
  }
  if (status.kind === 'error') {
    node.classList.add('is-warn');
    node.textContent = i18n.t(status.params.key);
    return;
  }
  if (manualEdit) {
    node.textContent = i18n.t('status.edited');
    return;
  }

  node.classList.add('is-ok');
  if (!totalFixes) {
    node.textContent = i18n.t('status.noFixes');
    return;
  }
  node.textContent = i18n.tn('status.fixes', totalFixes);
}

/* --- Que se ha arreglado exactamente --- */

/** El estado solo es pulsable cuando hay un desglose que ensenar. */
function syncFixesButton() {
  const { cleanStats, totalFixes, manualEdit, status } = store.state;
  const hasDetail = Boolean(
    status.kind === 'cleaned' && !manualEdit && totalFixes > 0 && cleanStats
  );
  dom.status.setAttribute('aria-disabled', hasDetail ? 'false' : 'true');
  dom.status.classList.toggle('is-clickable', hasDetail);
  if (hasDetail) {
    dom.status.setAttribute('title', i18n.t('fixes.open'));
  } else {
    dom.status.removeAttribute('title');
    closeFixes();
  }
}

function closeFixes() {
  if (!dom.fixesPopover) return;
  dom.fixesPopover.hidden = true;
  dom.status.setAttribute('aria-expanded', 'false');
}

function toggleFixes() {
  if (dom.status.getAttribute('aria-disabled') === 'true') return;
  const opening = dom.fixesPopover.hidden;
  if (opening) {
    const { cleanStats } = store.state;
    dom.fixesList.replaceChildren();
    for (const key of CLEAN_STAT_KEYS) {
      if (!cleanStats || !cleanStats[key]) continue;
      dom.fixesList.appendChild(
        el('li', { class: 'fixes-list__item' }, [
          el('span', { class: 'fixes-list__n', text: String(cleanStats[key]) }),
          el('span', { text: i18n.tn(`fix.${key}`, cleanStats[key]) }),
        ])
      );
    }
  }
  dom.fixesPopover.hidden = !opening;
  dom.status.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

/** Cifras del documento siempre a la vista, sin abrir ningun panel. */
function updateMetaStats() {
  const { analysis } = store.state;
  const has = Boolean(analysis && analysis.stats.words > 0);
  dom.metaStats.hidden = !has;
  if (has) {
    dom.metaStats.textContent = i18n.t('meta.words', {
      words: formatNumber(analysis.stats.words, i18n.lang),
      min: analysis.stats.minutes,
    });
  }
}

/** La demostracion de la pagina la limpia la herramienta de verdad. */
function renderDemo() {
  if (!dom.demoRaw || !dom.demoClean) return;
  const raw = getDemoSnippet(i18n.lang);
  dom.demoRaw.textContent = raw;
  dom.demoClean.textContent = runCleaner(raw).text;
}

function renderSourceMeta() {
  const { source } = store.state;
  if (!source) {
    dom.fileBadge.hidden = true;
    dom.fileBadge.replaceChildren();
    return;
  }
  const label = source.pages
    ? `${source.name} · ${i18n.tn('source.pages', source.pages)}`
    : source.name;
  dom.fileBadge.hidden = false;
  dom.fileBadge.replaceChildren(icon('file', 13), el('span', { text: label }));
  dom.fileBadge.setAttribute('title', i18n.t('source.file', { name: source.name }));
}

/* ------------------------------------------------------------------ *
 *  Inspector: terminos clave
 * ------------------------------------------------------------------ */

function buildSwatchRow(container, onPick, customDefault) {
  container.replaceChildren();
  for (const color of HIGHLIGHT_COLORS) {
    const button = el('button', {
      type: 'button',
      class: 'swatch',
      'data-color': color.id,
      'aria-label': color.id,
      title: color.id,
    });
    button.style.background = `var(--hl-${color.id})`;
    button.addEventListener('click', () => onPick(color.id));
    container.appendChild(button);
  }

  const wrapper = el('span', {
    class: 'swatch swatch--custom',
    title: i18n.t('keywords.customColor'),
  });
  const input = el('input', {
    type: 'color',
    value: customDefault,
    'aria-label': i18n.t('keywords.customColor'),
  });
  input.addEventListener('input', (event) => onPick(event.target.value));
  wrapper.appendChild(input);
  container.appendChild(wrapper);
}

function buildSwatches() {
  buildSwatchRow(dom.keywordSwatches, (color) => setKeywordStyle({ color }), '#7c5cff');
  buildSwatchRow(dom.entitySwatches, (color) => setEntityStyle({ color }), '#b4541f');
}

function renderKeywords() {
  const { analysis, styleConfig, locatedTerm } = store.state;
  const container = dom.keywordList;
  container.replaceChildren();

  const hasKeywords = Boolean(analysis && analysis.keywords.length > 0);
  dom.keywordsHint.hidden = !hasKeywords;
  dom.keywordsHint.textContent = i18n.t(
    styleConfig.keywords.enabled ? 'keywords.locateHint' : 'keywords.needsEnable'
  );

  if (!hasKeywords) {
    container.appendChild(el('p', { class: 'empty-note' }, [i18n.t('keywords.empty')]));
    return;
  }

  container.appendChild(
    el('p', { class: 'keyword-list__title' }, [i18n.t('keywords.detected')])
  );

  analysis.keywords.forEach((keyword, index) => {
    const button = el('button', {
      type: 'button',
      class: `keyword${locatedTerm === keyword.term ? ' is-located' : ''}`,
      title: i18n.t('keywords.locate', { term: keyword.display }),
    });
    button.style.setProperty('--weight', String(Math.max(0.08, keyword.weight)));
    button.style.setProperty('--i', String(index));
    button.append(
      el('span', { class: 'keyword__term', text: keyword.display }),
      el('span', { class: 'keyword__count', text: i18n.t('keywords.count', { n: keyword.count }) })
    );
    button.addEventListener('click', () => locateTerm(keyword.term));
    button.addEventListener('mouseenter', () => previewTerm(keyword.term));
    button.addEventListener('mouseleave', () => previewTerm(null));
    button.addEventListener('focus', () => previewTerm(keyword.term));
    button.addEventListener('blur', () => previewTerm(null));
    container.appendChild(button);
  });

  dom.keywordControls.classList.toggle('is-disabled', !styleConfig.keywords.enabled);
}

/**
 * "Con estilo" no sirve de nada si no ves con que jugar: la primera vez
 * se abre el panel (en pantallas estrechas) o se subraya (en anchas).
 */
function revealStyleTools() {
  const styleTab = document.querySelector('[data-inspector="style"]');
  if (styleTab && !styleTab.classList.contains('is-active')) styleTab.click();
  if (stylePanelIntroduced) return;
  stylePanelIntroduced = true;
  if (window.matchMedia('(max-width: 1180px)').matches) openInspector(true);
  else pulse(dom.inspector);
}

/** Enciende en el texto las apariciones del termino que estas mirando. */
function previewTerm(term) {
  if (!term) {
    hoverStyle.textContent = '';
    return;
  }
  const safe = String(term).slice(0, 80).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  hoverStyle.textContent = `.mc-hl[data-term="${safe}"]{background:var(--marker-strong);box-shadow:0 0 0 2px var(--marker-strong)}`;
}

/** Datos detectados, agrupados por tipo y pulsables como los terminos. */
function renderEntities() {
  const { analysis, styleConfig } = store.state;
  const container = dom.entityList;
  container.replaceChildren();
  dom.entityControls.classList.toggle('is-disabled', !styleConfig.entities.enabled);

  const entities = analysis ? analysis.entities || [] : [];
  if (entities.length === 0) {
    container.appendChild(el('p', { class: 'empty-note' }, [i18n.t('entities.empty')]));
    return;
  }

  for (const kind of ENTITY_KINDS) {
    const group = entities.filter((entity) => entity.kind === kind);
    if (group.length === 0) continue;
    const chips = group.map((entity) => {
      const chip = buildChip(entity.text, entity.count > 1 ? entity.count : '', false);
      chip.classList.add('chip--entity');
      return chip;
    });
    container.appendChild(
      el('div', { class: 'insight-group' }, [
        el('p', { class: 'insight-group__title', text: i18n.t(`entity.${kind}`) }),
        el('div', { class: 'chips' }, chips),
      ])
    );
  }
}

function locateTerm(term) {
  const next = store.state.locatedTerm === term ? null : term;
  const view = next ? 'styled' : store.state.view;
  const apply = () => store.set({ locatedTerm: next, view }, 'locate');
  if (view !== store.state.view) withViewTransition(apply);
  else apply();
}

/* ------------------------------------------------------------------ *
 *  Inspector: reglas propias
 * ------------------------------------------------------------------ */

function renderCustomRules() {
  const container = dom.customRules;
  container.replaceChildren();
  const rules = store.state.styleConfig.customRules;

  if (rules.length === 0) {
    container.appendChild(el('p', { class: 'empty-note' }, [i18n.t('custom.empty')]));
    return;
  }

  for (const rule of rules) {
    const row = el('div', { class: 'rule' });
    const text = el('span', { class: 'rule__text', text: rule.text });
    const remove = el('button', {
      type: 'button',
      class: 'btn btn--icon',
      'aria-label': i18n.t('custom.remove', { term: rule.text }),
      title: i18n.t('custom.remove', { term: rule.text }),
    });
    remove.appendChild(icon('close', 14));
    remove.addEventListener('click', () => removeRule(rule.id));

    const controls = el('div', { class: 'rule__controls' });

    const fontSelect = el('select', {
      class: 'input select rule__font',
      'aria-label': i18n.t('type.font'),
    });
    fontSelect.appendChild(el('option', { value: '', text: 'Aa' }));
    for (const key of Object.keys(FONT_STACKS)) {
      fontSelect.appendChild(
        el('option', { value: FONT_STACKS[key], text: i18n.t(`font.${key}`) })
      );
    }
    fontSelect.value = rule.font || '';
    fontSelect.addEventListener('change', (event) =>
      updateRule(rule.id, { font: event.target.value || null })
    );

    for (const [key, label] of [
      ['bold', 'B'],
      ['italic', 'I'],
      ['underline', 'U'],
    ]) {
      const toggle = el('button', {
        type: 'button',
        class: `toggle${rule[key] ? ' is-active' : ''}`,
        'aria-pressed': rule[key] ? 'true' : 'false',
        title: i18n.t(`keywords.${key}`),
        'aria-label': i18n.t(`keywords.${key}`),
      });
      toggle.appendChild(
        key === 'bold'
          ? el('b', { text: label })
          : key === 'italic'
            ? el('i', { text: label })
            : el('u', { text: label })
      );
      toggle.addEventListener('click', () => updateRule(rule.id, { [key]: !rule[key] }));
      controls.appendChild(toggle);
    }

    const colorWrap = el('span', { class: 'swatch swatch--custom', title: i18n.t('keywords.color') });
    const colorInput = el('input', {
      type: 'color',
      value: resolveColor(rule.color, theme.effective()),
      'aria-label': i18n.t('keywords.color'),
    });
    colorInput.addEventListener('input', (event) =>
      updateRule(rule.id, { color: event.target.value })
    );
    colorWrap.appendChild(colorInput);
    controls.append(fontSelect, colorWrap);

    row.append(text, remove, controls);
    container.appendChild(row);
  }
}

function addRule(rawText) {
  const text = rawText.trim().replace(/\s+/g, ' ');
  if (!text) return;
  const existing = store.state.styleConfig.customRules.some(
    (rule) => rule.text.toLowerCase() === text.toLowerCase()
  );
  if (existing) {
    toaster.info(i18n.t('custom.duplicate'));
    return;
  }
  const id = `rule-${store.state.nextRuleId}`;
  const rule = { id, text, color: 'amber', bold: true, italic: false, underline: false, font: null };
  store.set({ nextRuleId: store.state.nextRuleId + 1 }, 'silent');
  setStyleConfig({ customRules: [...store.state.styleConfig.customRules, rule] }, true);
}

function updateRule(id, patch) {
  const customRules = store.state.styleConfig.customRules.map((rule) =>
    rule.id === id ? { ...rule, ...patch } : rule
  );
  setStyleConfig({ customRules }, true);
}

function removeRule(id) {
  const customRules = store.state.styleConfig.customRules.filter((rule) => rule.id !== id);
  setStyleConfig({ customRules }, true);
}

/* ------------------------------------------------------------------ *
 *  Inspector: documento
 * ------------------------------------------------------------------ */

function renderInsights() {
  const { analysis } = store.state;
  const lang = i18n.lang;

  dom.stats.replaceChildren();
  if (!analysis || analysis.stats.words === 0) {
    dom.stats.appendChild(el('p', { class: 'empty-note' }, [i18n.t('stats.empty')]));
    dom.repetitions.replaceChildren(el('p', { class: 'empty-note' }, [i18n.t('repeat.none')]));
    dom.fillers.replaceChildren(el('p', { class: 'empty-note' }, [i18n.t('fillers.none')]));
    updateMetaStats();
    return;
  }

  const { stats, repetitions } = analysis;
  const cards = [
    [formatNumber(stats.words, lang), i18n.t('stats.words')],
    [formatNumber(stats.characters, lang), i18n.t('stats.characters')],
    [formatNumber(stats.paragraphs, lang), i18n.t('stats.paragraphs')],
    [`~${stats.minutes}`, i18n.t('stats.reading')],
  ];
  for (const [value, label] of cards) {
    dom.stats.appendChild(
      el('div', { class: 'stat' }, [
        el('div', { class: 'stat__value', text: value }),
        el('div', { class: 'stat__label', text: label }),
      ])
    );
  }

  const groups = [
    ['repeat.words', repetitions.overused.map((item) => [item.display, item.count])],
    ['repeat.phrases', repetitions.phrases.map((item) => [item.display, item.count])],
    ['repeat.starts', repetitions.starts.map((item) => [item.display, item.count])],
  ].filter(([, items]) => items.length > 0);

  dom.repetitions.replaceChildren();
  if (groups.length === 0) {
    dom.repetitions.appendChild(el('p', { class: 'empty-note' }, [i18n.t('repeat.none')]));
  } else {
    for (const [titleKey, items] of groups) {
      dom.repetitions.appendChild(
        el('div', { class: 'insight-group' }, [
          el('p', { class: 'insight-group__title', text: i18n.t(titleKey) }),
          el(
            'div',
            { class: 'chips' },
            items.map(([label, count]) => buildChip(label, count, false))
          ),
        ])
      );
    }
  }

  dom.fillers.replaceChildren();
  if (repetitions.fillers.length === 0) {
    dom.fillers.appendChild(el('p', { class: 'empty-note' }, [i18n.t('fillers.none')]));
  } else {
    dom.fillers.appendChild(
      el(
        'div',
        { class: 'chips' },
        repetitions.fillers.map((item) => buildChip(item.phrase, item.count, true))
      )
    );
  }

  updateMetaStats();
}

function buildChip(label, count, warn) {
  const chip = el('button', {
    type: 'button',
    class: `chip${warn ? ' chip--warn' : ''}`,
    title: i18n.t('keywords.locate', { term: label }),
  });
  chip.append(
    el('span', { text: label }),
    el('span', { class: 'chip__count', text: String(count) })
  );
  chip.addEventListener('click', () => locateTerm(label.toLowerCase()));
  return chip;
}

/* ------------------------------------------------------------------ *
 *  Configuracion visual
 * ------------------------------------------------------------------ */

/**
 * Un ajuste de estilo no se ve en la vista "Limpio", asi que tocarlo
 * lleva alli directamente. Excepcion: si el cursor esta dentro del texto
 * limpio, es que estas editando y no se te mueve la vista debajo.
 */
function shouldJumpToStyled() {
  if (store.state.view === 'styled') return false;
  if (document.activeElement === dom.cleanOutput) return false;
  return true;
}

function announceStyledJump() {
  if (styledJumpAnnounced) return;
  styledJumpAnnounced = true;
  toaster.info(i18n.t('toast.styledJump'));
}

/** @param {boolean} affectsMarks true si hay que reconstruir los segmentos */
function setStyleConfig(patch, affectsMarks) {
  const next = { ...store.state.styleConfig, ...patch };
  // Cualquier ajuste manual deja de coincidir con el preset elegido.
  if (!('preset' in patch)) next.preset = matchPreset(next);

  if (shouldJumpToStyled()) {
    withViewTransition(() => store.set({ styleConfig: next, view: 'styled' }, 'style-jump'));
    announceStyledJump();
    return;
  }
  store.set({ styleConfig: next }, affectsMarks ? 'style-marks' : 'style-box');
}

function setKeywordStyle(patch) {
  setStyleConfig({ keywords: { ...store.state.styleConfig.keywords, ...patch } }, true);
}

function setEntityStyle(patch) {
  setStyleConfig({ entities: { ...store.state.styleConfig.entities, ...patch } }, true);
}

function setFocus(patch) {
  setStyleConfig({ focus: { ...store.state.styleConfig.focus, ...patch } }, true);
}

/** Detecta si la configuracion actual sigue siendo exactamente un preset. */
function matchPreset(config) {
  for (const [id, preset] of Object.entries(PRESETS)) {
    const keywordsMatch = Object.entries(preset.keywords).every(
      ([key, value]) => config.keywords[key] === value
    );
    const entitiesMatch = Object.entries(preset.entities || {}).every(
      ([key, value]) => config.entities[key] === value
    );
    const focusMatch = Object.entries(preset.focus).every(
      ([key, value]) => config.focus[key] === value
    );
    const boxMatch =
      config.lineHeight === preset.lineHeight && config.width === preset.width;
    if (keywordsMatch && entitiesMatch && focusMatch && boxMatch) return id;
  }
  return 'custom';
}

function syncStyleControls() {
  const config = store.state.styleConfig;

  document.querySelectorAll('[data-preset]').forEach((button) => {
    const active = button.dataset.preset === config.preset;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (button.dataset.preset === 'custom') button.disabled = config.preset !== 'custom';
  });

  dom.presetDesc.textContent = i18n.t(`preset.${config.preset}.desc`);
  dom.styleDot.hidden = !(
    config.keywords.enabled ||
    config.entities.enabled ||
    config.focus.enabled ||
    config.customRules.length > 0
  );
  dom.keywordsEnabled.checked = config.keywords.enabled;
  dom.keywordControls.classList.toggle('is-disabled', !config.keywords.enabled);
  dom.entitiesEnabled.checked = config.entities.enabled;
  dom.entityControls.classList.toggle('is-disabled', !config.entities.enabled);
  dom.focusEnabled.checked = config.focus.enabled;
  dom.focusControls.classList.toggle('is-disabled', !config.focus.enabled);

  document.querySelectorAll('[data-amount]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.amount === config.keywords.amount);
  });
  document.querySelectorAll('[data-intensity]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.intensity === config.focus.intensity);
  });
  document.querySelectorAll('[data-line-height]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.lineHeight === config.lineHeight);
  });
  document.querySelectorAll('[data-width]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.width === config.width);
  });
  document.querySelectorAll('[data-align]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.align === config.align);
  });
  document.querySelectorAll('[data-kw-style]').forEach((button) => {
    const active = Boolean(config.keywords[button.dataset.kwStyle]);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  document.querySelectorAll('#keyword-swatches .swatch[data-color]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.color === config.keywords.color);
  });
  document.querySelectorAll('#entity-swatches .swatch[data-color]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.color === config.entities.color);
  });
  document.querySelectorAll('[data-entity-style]').forEach((button) => {
    const active = Boolean(config.entities[button.dataset.entityStyle]);
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  dom.fontSelect.value = config.font;
  dom.sizeRange.value = String(config.size);
  dom.sizeValue.textContent = String(config.size);

  document.querySelectorAll('[data-theme-set]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.themeSet === theme.mode);
  });
  document.querySelectorAll('[data-lang-set]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.langSet === i18n.lang);
  });
}

/* ------------------------------------------------------------------ *
 *  Archivos
 * ------------------------------------------------------------------ */

async function handleFile(file) {
  if (!file) return;
  store.set({ status: { kind: 'processing', params: null } }, 'status');
  try {
    const result = await loadFile(file, {
      onProgress: (page, pages) =>
        store.set({ status: { kind: 'pdf', params: { page, pages } } }, 'status'),
    });

    if (!result.text.trim()) {
      const key = result.kind === 'pdf' && result.scanned ? 'status.scanned' : 'error.noText';
      store.set(
        { status: result.scanned ? { kind: 'scanned' } : { kind: 'error', params: { key } } },
        'status'
      );
      if (!result.scanned) toaster.error(i18n.t(key));
      return;
    }

    dom.sourceInput.value = result.text;
    processNow(result.text);
    freshResult();
    store.set(
      {
        source: { name: result.name, kind: result.kind, pages: result.pages || null },
        status: result.scanned
          ? { kind: 'scanned' }
          : { kind: 'cleaned', params: { fixes: store.state.totalFixes } },
      },
      'document'
    );
  } catch (error) {
    const key = error instanceof FileLoadError ? `error.${error.code}` : 'error.readFailed';
    store.set({ status: { kind: 'error', params: { key } } }, 'status');
    toaster.error(i18n.t(key));
  } finally {
    dom.fileInput.value = '';
  }
}

/* ------------------------------------------------------------------ *
 *  Acciones
 * ------------------------------------------------------------------ */

function currentBlocks() {
  const { cleanText, styleConfig, analysis } = store.state;
  return buildStyledBlocks(
    cleanText,
    styleConfig,
    analysis ? analysis.keywords : [],
    analysis ? analysis.entities || [] : []
  );
}

async function copyClean() {
  const { cleanText } = store.state;
  if (!cleanText) return toaster.info(i18n.t('toast.nothingToCopy'));
  const ok = await copyPlainText(cleanText);
  return ok ? toaster.success(i18n.t('toast.copied')) : toaster.error(i18n.t('toast.copyFailed'));
}

async function copyStyled() {
  const { cleanText, styleConfig } = store.state;
  if (!cleanText) return toaster.info(i18n.t('toast.nothingToCopy'));
  const html = blocksToHtml(currentBlocks(), styleConfig, { theme: theme.effective() });
  const result = await copyRichText(html, cleanText);
  if (result === 'rich') return toaster.success(i18n.t('toast.copied'));
  if (result === 'plain') return toaster.info(i18n.t('toast.copiedPlain'));
  return toaster.error(i18n.t('toast.copyFailed'));
}

function saveTxt() {
  const { cleanText, source } = store.state;
  if (!cleanText) return toaster.info(i18n.t('toast.nothingToCopy'));
  downloadText(exportFileName(brand.fileSlug, source && source.name, 'txt'), cleanText);
  return toaster.success(i18n.t('toast.downloaded'));
}

function saveHtml() {
  const { cleanText, styleConfig, source } = store.state;
  if (!cleanText) return toaster.info(i18n.t('toast.nothingToCopy'));
  const html = buildStandaloneHtml({
    title: (source && source.name) || brand.productName,
    blocks: currentBlocks(),
    styleConfig,
    lang: i18n.lang,
    theme: 'light',
  });
  downloadHtml(exportFileName(brand.fileSlug, source && source.name, 'html'), html);
  return toaster.success(i18n.t('toast.downloaded'));
}

function resetStyles() {
  const keptRules = store.state.styleConfig.customRules.map((rule) => ({
    ...rule,
    color: 'amber',
    bold: true,
    italic: false,
    underline: false,
    font: null,
  }));
  const fresh = cloneStyleConfig(DEFAULT_STYLE_CONFIG);
  fresh.customRules = keptRules;
  store.set({ styleConfig: fresh }, 'style-marks');
  toaster.success(i18n.t('toast.stylesReset'));
}

function clearDocument() {
  const { rawText, cleanText, source } = store.state;
  if (rawText.trim().length > 400 && !window.confirm(i18n.t('confirm.clear'))) return;
  const snapshot = { kind: 'clear', rawText, cleanText, source };
  scheduleClean.cancel();
  store.reset();
  analysisCache = null;
  dom.sourceInput.value = '';
  dom.cleanOutput.value = '';
  store.set({ history: rawText ? snapshot : null }, 'document');
  toaster.success(i18n.t('toast.cleared'));
}

function undo() {
  const { history } = store.state;
  if (!history) return;
  editingClean = false;
  if (history.kind === 'clear') {
    dom.sourceInput.value = history.rawText;
    processNow(history.rawText);
    store.set({ source: history.source, history: null }, 'document');
  } else {
    const analysis = analyze(history.cleanText, null);
    store.set(
      { cleanText: history.cleanText, analysis, manualEdit: false, history: null },
      'document'
    );
  }
  toaster.success(i18n.t('toast.undone'));
}

function loadExample() {
  const example = getExample(i18n.lang);
  dom.sourceInput.value = example;
  processNow(example);
  freshResult();
  toaster.success(i18n.t('toast.exampleLoaded'));
}

/* ------------------------------------------------------------------ *
 *  Eventos
 * ------------------------------------------------------------------ */

function wireEvents() {
  // --- Entrada de texto ---
  dom.sourceInput.addEventListener('input', (event) => {
    syncEmptyState();
    store.set({ source: null }, 'silent');
    scheduleClean(event.target.value);
  });
  dom.sourceInput.addEventListener('paste', () => {
    // El valor todavia no incluye lo pegado: se procesa en el siguiente tick.
    setTimeout(() => processNow(dom.sourceInput.value), 0);
  });

  // --- Edicion manual del texto limpio ---
  const scheduleReanalyze = debounce(() => {
    const value = dom.cleanOutput.value;
    const analysis = analyze(value, null);
    store.set({ cleanText: value, analysis, manualEdit: true }, 'clean-edit');
    editingClean = false;
  }, 320);

  dom.cleanOutput.addEventListener('input', () => {
    if (!editingClean) {
      editingClean = true;
      if (!store.state.manualEdit) {
        store.set(
          { history: { kind: 'edit', cleanText: store.state.cleanText } },
          'silent'
        );
      }
    }
    scheduleReanalyze();
  });

  // Pegar funciona en toda la pagina, no solo dentro del cuadro.
  document.addEventListener('paste', (event) => {
    const node = event.target;
    const editable =
      node &&
      (node.tagName === 'TEXTAREA' ||
        node.tagName === 'INPUT' ||
        (node.isContentEditable === true));
    if (editable) return;
    const text = event.clipboardData && event.clipboardData.getData('text/plain');
    if (!text || !text.trim()) return;
    event.preventDefault();
    const previous = store.state;
    if (previous.rawText.trim()) {
      store.set(
        {
          history: {
            kind: 'clear',
            rawText: previous.rawText,
            cleanText: previous.cleanText,
            source: previous.source,
          },
        },
        'silent'
      );
    }
    dom.sourceInput.value = text;
    processNow(text);
    freshResult();
  });

  // --- Archivos ---
  dom.chooseFile.addEventListener('click', () => dom.fileInput.click());
  dom.emptyChoose.addEventListener('click', () => dom.fileInput.click());
  dom.emptyExample.addEventListener('click', () => loadExample());
  dom.status.addEventListener('click', toggleFixes);
  document.addEventListener('click', (event) => {
    if (dom.fixesPopover.hidden) return;
    if (dom.status.contains(event.target) || dom.fixesPopover.contains(event.target)) return;
    closeFixes();
  });
  dom.fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));
  dom.loadExample.addEventListener('click', () => loadExample());

  let dragDepth = 0;
  const setDragging = (active) => dom.dropzone.classList.toggle('is-dragging', active);
  document.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer || !event.dataTransfer.types.includes('Files')) return;
    event.preventDefault();
    dragDepth += 1;
    setDragging(true);
  });
  document.addEventListener('dragover', (event) => {
    if (event.dataTransfer && event.dataTransfer.types.includes('Files')) event.preventDefault();
  });
  document.addEventListener('dragleave', () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) setDragging(false);
  });
  document.addEventListener('drop', (event) => {
    if (!event.dataTransfer || event.dataTransfer.files.length === 0) return;
    event.preventDefault();
    dragDepth = 0;
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  });

  // --- Vistas ---
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      if (store.state.view === button.dataset.view) return;
      withViewTransition(() => store.set({ view: button.dataset.view }, 'view'));
      if (button.dataset.view === 'styled') revealStyleTools();
    });
  });

  dom.toggleSource.addEventListener('click', () => {
    const collapsed = dom.sourcePanel.classList.toggle('is-collapsed');
    dom.workspace.classList.toggle('is-source-collapsed', collapsed);
    dom.toggleSource.textContent = i18n.t(collapsed ? 'source.show' : 'source.hide');
    dom.toggleSource.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });

  // --- Inspector ---
  let focusBeforeInspector = null;
  openInspector = (open) => {
    document.body.classList.toggle('is-inspector-open', open);
    dom.inspectorBackdrop.hidden = !open;
    dom.openInspector.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      focusBeforeInspector = document.activeElement;
      const first = dom.inspector.querySelector(
        'button:not([disabled]), input, select, summary, [href]'
      );
      if (first) first.focus();
      return;
    }
    if (focusBeforeInspector && typeof focusBeforeInspector.focus === 'function') {
      focusBeforeInspector.focus();
    }
    focusBeforeInspector = null;
  };
  dom.openInspector.addEventListener('click', () => openInspector(true));
  dom.closeInspector.addEventListener('click', () => openInspector(false));
  dom.inspectorBackdrop.addEventListener('click', () => openInspector(false));
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeFixes();
    if (document.body.classList.contains('is-inspector-open')) openInspector(false);
  });

  document.querySelectorAll('[data-inspector]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-inspector]').forEach((other) => {
        const active = other === button;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('[data-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== button.dataset.inspector;
      });
    });
  });

  // --- Controles de estilo ---
  dom.keywordsEnabled.addEventListener('change', (event) =>
    setKeywordStyle({ enabled: event.target.checked })
  );
  dom.entitiesEnabled.addEventListener('change', (event) =>
    setEntityStyle({ enabled: event.target.checked })
  );
  document.querySelectorAll('[data-entity-style]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.entityStyle;
      setEntityStyle({ [key]: !store.state.styleConfig.entities[key] });
    });
  });
  dom.focusEnabled.addEventListener('change', (event) =>
    setFocus({ enabled: event.target.checked })
  );

  document.querySelectorAll('[data-kw-style]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.kwStyle;
      setKeywordStyle({ [key]: !store.state.styleConfig.keywords[key] });
    });
  });

  document.querySelectorAll('[data-amount]').forEach((button) => {
    button.addEventListener('click', () => {
      setKeywordStyle({ amount: button.dataset.amount });
      const analysis = analyze(store.state.cleanText, analysisCache);
      store.set({ analysis }, 'analysis');
    });
  });

  document.querySelectorAll('[data-intensity]').forEach((button) => {
    button.addEventListener('click', () => setFocus({ intensity: button.dataset.intensity }));
  });
  document.querySelectorAll('[data-line-height]').forEach((button) => {
    button.addEventListener('click', () => setStyleConfig({ lineHeight: button.dataset.lineHeight }, false));
  });
  document.querySelectorAll('[data-width]').forEach((button) => {
    button.addEventListener('click', () => setStyleConfig({ width: button.dataset.width }, false));
  });
  document.querySelectorAll('[data-align]').forEach((button) => {
    button.addEventListener('click', () => setStyleConfig({ align: button.dataset.align }, false));
  });
  document.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.preset === 'custom') return;
      const next = applyPreset(store.state.styleConfig, button.dataset.preset);
      const jump = shouldJumpToStyled();
      const apply = () =>
        store.set(
          jump ? { styleConfig: next, view: 'styled' } : { styleConfig: next },
          jump ? 'style-jump' : 'style-marks'
        );
      if (jump) {
        withViewTransition(apply);
        announceStyledJump();
      } else {
        apply();
      }
      const analysis = analyze(store.state.cleanText, analysisCache);
      store.set({ analysis }, 'analysis');
    });
  });

  dom.fontSelect.addEventListener('change', (event) =>
    setStyleConfig({ font: event.target.value }, false)
  );
  dom.sizeRange.addEventListener('input', (event) => {
    dom.sizeValue.textContent = event.target.value;
    setStyleConfig({ size: Number(event.target.value) }, false);
  });

  const submitRule = (event) => {
    event.preventDefault();
    addRule(dom.customInput.value);
    dom.customInput.value = '';
  };
  dom.customForm.addEventListener('submit', submitRule);
  // Enter explicito: no dependemos del envio implicito del formulario.
  dom.customInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitRule(event);
  });

  $('#reset-styles').addEventListener('click', resetStyles);

  // --- Idioma del analisis ---
  dom.langSelect.addEventListener('change', (event) => {
    store.set({ analysisLang: event.target.value }, 'silent');
    const analysis = analyze(store.state.cleanText, null);
    store.set({ analysis }, 'analysis');
  });

  // --- Acciones ---
  $('#copy-clean').addEventListener('click', copyClean);
  $('#copy-styled').addEventListener('click', copyStyled);
  $('#download-txt').addEventListener('click', saveTxt);
  $('#download-html').addEventListener('click', saveHtml);
  $('#clear-doc').addEventListener('click', clearDocument);
  dom.undoButton.addEventListener('click', undo);

  // --- Tema e idioma de interfaz ---
  document.querySelectorAll('[data-theme-set]').forEach((button) => {
    button.addEventListener('click', () => {
      theme.set(button.dataset.themeSet);
      syncStyleControls();
    });
  });
  document.querySelectorAll('[data-lang-set]').forEach((button) => {
    button.addEventListener('click', () => i18n.setLang(button.dataset.langSet));
  });

  i18n.onChange(() => {
    i18n.apply();
    injectFaqSchema();
    renderDemo();
    renderKeywords();
    renderEntities();
    renderCustomRules();
    renderInsights();
    renderSourceMeta();
    renderOutput();
    updateStatus();
    syncStyleControls();
    dom.toggleSource.textContent = i18n.t(
      dom.sourcePanel.classList.contains('is-collapsed') ? 'source.show' : 'source.hide'
    );
  });

  theme.onChange(() => {
    if (store.state.view === 'styled') renderStyled();
  });
}

/* ------------------------------------------------------------------ *
 *  Reaccion a los cambios de estado
 * ------------------------------------------------------------------ */

/** Marca en las pestanas cual es la vista visible. */
function syncViewTabs(state) {
  document.querySelectorAll('[data-view]').forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

store.subscribe((state, reason) => {
  if (reason === 'silent') return;

  if (reason === 'document' || reason === 'reset') {
    dom.styledDot.hidden = !(state.cleanText && state.view !== 'styled');
    renderSourceMeta();
    renderOutput();
    renderKeywords();
    renderEntities();
    renderInsights();
    updateStatus();
    dom.undoButton.hidden = !state.history;
    return;
  }

  if (reason === 'clean-edit' || reason === 'analysis') {
    renderKeywords();
    renderEntities();
    renderInsights();
    updateStatus();
    if (state.view === 'styled') renderStyled();
    dom.undoButton.hidden = !state.history;
    return;
  }

  if (reason === 'style-jump') {
    syncStyleControls();
    renderCustomRules();
    renderKeywords();
    renderEntities();
    syncViewTabs(state);
    renderOutput();
    return;
  }

  if (reason === 'style-marks') {
    syncStyleControls();
    renderCustomRules();
    renderKeywords();
    renderEntities();
    if (state.view === 'styled') renderStyled();
    return;
  }

  if (reason === 'style-box') {
    syncStyleControls();
    applyContainerStyle(dom.styledOutput, state.styleConfig);
    return;
  }

  if (reason === 'view') {
    if (state.view === 'styled') dom.styledDot.hidden = true;
    syncViewTabs(state);
    renderOutput();
    return;
  }

  if (reason === 'locate') {
    syncViewTabs(state);
    renderKeywords();
    renderOutput();
    return;
  }

  if (reason === 'status') {
    updateStatus();
  }
});

/* ------------------------------------------------------------------ *
 *  Datos estructurados de la FAQ (sin spam: solo lo que se ve)
 * ------------------------------------------------------------------ */

function injectFaqSchema() {
  const previous = document.getElementById('faq-schema');
  if (previous) previous.remove();
  const entities = [1, 2, 3, 4, 5, 6].map((n) => ({
    '@type': 'Question',
    name: i18n.t(`faq.q${n}`),
    acceptedAnswer: { '@type': 'Answer', text: i18n.t(`faq.a${n}`) },
  }));
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'faq-schema';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entities,
  });
  document.head.appendChild(script);
}

boot();
