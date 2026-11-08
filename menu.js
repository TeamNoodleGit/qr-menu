const copy = {
  ko: ['메뉴', '따뜻한 한 그릇과 곁들임', '언어', '카테고리', '전체', '품절', '표시할 메뉴가 없습니다.', '메뉴를 불러오지 못했습니다. 새로고침해 주세요.', '면 요리', '곁들임', '음료'],
  en: ['Menu', 'Comforting bowls and sides', 'Language', 'Categories', 'All', 'Sold out', 'No items to display.', 'Could not load the menu. Please refresh.', 'Noodles', 'Sides', 'Drinks'],
  ja: ['メニュー', '温かい麺とサイドメニュー', '言語', 'カテゴリー', 'すべて', '売り切れ', '表示できるメニューがありません。', 'メニューを読み込めませんでした。再読み込みしてください。', '麺料理', 'サイド', 'ドリンク'],
  'zh-CN': ['菜单', '暖心面食与小菜', '语言', '分类', '全部', '售罄', '暂无菜单。', '无法加载菜单，请刷新页面。', '面食', '小菜', '饮品'],
};
const categories = ['noodles', 'sides', 'drinks'];
const languages = document.querySelector('#language');
const languageButtons = [...languages.querySelectorAll('button')];
const languageKey = 'qr-menu.language';
const defaultLocale = 'ko';

function preferredLocale() {
  try {
    const saved = localStorage.getItem(languageKey);
    if (Object.hasOwn(copy, saved)) return saved;
  } catch {
    // Browsing still works when storage is unavailable.
  }

  for (const preference of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const base = preference?.toLowerCase().split('-')[0];
    if (base === 'zh') return 'zh-CN';
    if (Object.hasOwn(copy, base)) return base;
  }
  return defaultLocale;
}

let locale = preferredLocale();
const filters = document.querySelector('#filters');
const menu = document.querySelector('#menu');
const status = document.querySelector('#status');
let active = '';
let items = [];
let state = 'loading';

function element(tag, value, className) {
  const node = document.createElement(tag);
  node.textContent = value;
  if (className) node.className = className;
  return node;
}

function render() {
  const [title, intro, label, categoryLabel, all, soldOut, empty, error, ...categoryNames] = copy[locale];
  document.documentElement.lang = locale;
  document.title = 'Noodle Kitchen · ' + title;
  document.querySelector('#title').textContent = title;
  document.querySelector('#intro').textContent = intro;
  languages.setAttribute('aria-label', label);
  for (const button of languageButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.locale === locale));
  }
  filters.setAttribute('aria-label', categoryLabel);
  filters.replaceChildren();
  menu.replaceChildren();
  const visible = items.filter(item => !active || item.category === active);
  status.textContent = state === 'error' ? error : state === 'ready' && !visible.length ? empty : '';
  if (!items.length) return;

  for (const key of ['', ...categories.filter(key => items.some(item => item.category === key))]) {
    const button = element('button', key ? categoryNames[categories.indexOf(key)] : all);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(key === active));
    button.addEventListener('click', () => {
      active = key;
      for (const sibling of filters.children) {
        sibling.setAttribute('aria-pressed', String(sibling === button));
      }
      renderItems(items.filter(item => !active || item.category === active));
    });
    filters.append(button);
  }
  renderItems(visible);

  function renderItems(selection) {
    const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'KRW' });
    menu.replaceChildren();
    for (const item of selection) {
      const article = element('article', '', 'card');
      const name = item.name[locale] || item.name.ko;
      if (typeof item.image === 'string' && /^\/?images\//.test(item.image)) {
        const photo = new URL(item.image.replace(/^\//, ''), import.meta.url);
        const imageRoot = new URL('./images/', import.meta.url);
        if (photo.href.startsWith(imageRoot.href)) {
          const img = element('img', '');
          img.alt = '';
          img.loading = 'lazy';
          img.addEventListener('error', () => img.remove());
          img.src = photo.href;
          article.append(img);
        }
      }
      const details = element('div', '', 'details');
      const price = element('strong', money.format(item.price));
      details.append(
        element('span', categoryNames[categories.indexOf(item.category)], 'category'),
        element('h2', name),
        element('p', item.description[locale] || item.description.ko),
        price
      );
      if (item.soldOut) details.append(element('span', soldOut, 'badge'));
      article.append(details);
      menu.append(article);
    }
  }
}

for (const button of languageButtons) {
  button.addEventListener('click', () => {
    locale = button.dataset.locale;
    try {
      localStorage.setItem(languageKey, locale);
    } catch {
      // Keep the selection for this visit.
    }
    render();
  });
}
render();
try {
  const response = await fetch(new URL('./data/menu.json', import.meta.url), { cache: 'no-cache' });
  if (!response.ok) throw new Error('Menu request failed');
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid menu');
  items = data;
  state = 'ready';
  render();
} catch (error) {
  console.error(error);
  items = [];
  state = 'error';
  render();
}
