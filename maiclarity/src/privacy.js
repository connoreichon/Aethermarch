/** Pagina de privacidad: mismo sistema visual, sin herramienta. */
import './styles/main.css';
import { brand } from './config/brand.js';
import { createI18n, detectUiLang } from './modules/i18n.js';
import { createTheme } from './modules/theme.js';

const i18n = createI18n(detectUiLang());
const theme = createTheme();

function syncLangButtons() {
  document.querySelectorAll('[data-lang-set]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.langSet === i18n.lang);
  });
}

theme.apply();
document.documentElement.lang = i18n.lang;
document.title = `${brand.productName} — ${i18n.t('privacy.title')}`;

const [first, second] = brand.nameParts;
const partA = document.getElementById('brand-part-a');
const partB = document.getElementById('brand-part-b');
if (partA) partA.textContent = first;
if (partB) partB.textContent = second || '';

i18n.apply();
syncLangButtons();

document.querySelectorAll('[data-lang-set]').forEach((button) => {
  button.addEventListener('click', () => i18n.setLang(button.dataset.langSet));
});

i18n.onChange(() => {
  i18n.apply();
  document.title = `${brand.productName} — ${i18n.t('privacy.title')}`;
  syncLangButtons();
});
