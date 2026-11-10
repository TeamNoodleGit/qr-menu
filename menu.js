const copy = {
  ko: ['메뉴', '따뜻한 한 그릇과 곁들임', '언어', '카테고리', '전체', '품절', '표시할 메뉴가 없습니다.', '메뉴를 불러오지 못했습니다. 새로고침해 주세요.', '면 요리', '곁들임', '음료'],
  en: ['Menu', 'Comforting bowls and sides', 'Language', 'Categories', 'All', 'Sold out', 'No items to display.', 'Could not load the menu. Please refresh.', 'Noodles', 'Sides', 'Drinks'],
  ja: ['メニュー', '温かい麺とサイドメニュー', '言語', 'カテゴリー', 'すべて', '売り切れ', '表示できるメニューがありません。', 'メニューを読み込めませんでした。再読み込みしてください。', '麺料理', 'サイド', 'ドリンク'],
  'zh-CN': ['菜单', '暖心面食与小菜', '语言', '分类', '全部', '售罄', '暂无菜单。', '无法加载菜单，请刷新页面。', '面食', '小菜', '饮品'],
};
const categories = ['jeotgal', 'sides', 'kimchi', 'noodles', 'drinks'];
const categoryLabels = {
  ko: ['젓갈류', '반찬류', '김치류', '면 요리', '음료'],
  en: ['Salted seafood', 'Side dishes', 'Kimchi', 'Noodles', 'Drinks'],
  ja: ['塩辛', 'お惣菜', 'キムチ', '麺料理', 'ドリンク'],
  'zh-CN': ['海鲜酱', '小菜', '泡菜', '面食', '饮品'],
};
const infoLabels = {
  ko: ['가게 정보', '주소', '영업시간 및 휴무', '가게 전화번호', '안내', '가격 문의', '원산지'],
  en: ['Store information', 'Address', 'Hours', 'Store phone', 'Notice', 'Ask for price', 'Origin'],
  ja: ['店舗情報', '住所', '営業時間・定休日', '店舗電話', 'お知らせ', '価格はお問い合わせください', '原産地'],
  'zh-CN': ['店铺信息', '地址', '营业时间及休息日', '店铺电话', '公告', '价格请咨询', '原产地'],
};
const uiLabels = {
  ko: ['자세히 보기', '닫기', '메뉴로 돌아가기', '가게 정보가 아직 등록되지 않았습니다.'],
  en: ['View details', 'Close', 'Back to menu', 'Store information has not been added yet.'],
  ja: ['詳細を見る', '閉じる', 'メニューに戻る', '店舗情報はまだ登録されていません。'],
  'zh-CN': ['查看详情', '关闭', '返回菜单', '店铺信息尚未填写。'],
};
let store = {};
const localized = value => typeof value === 'string' ? value : value?.[locale] || value?.ko || '';

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
  const [title, intro, label, categoryLabel, all, soldOut, empty, error] = copy[locale];
  const categoryNames = categoryLabels[locale];
  document.documentElement.lang = locale;
  const brand = localized(store.name) || '서비의 전통 맛 젓갈';
  document.title = brand + ' · ' + title;
  document.querySelector('#brand').textContent = brand;
  renderStore();
  document.querySelector('#title').textContent = title;
  document.querySelector('#language-toggle').setAttribute('aria-label', label);
  document.querySelector('#current-language').src = './flags/' + locale + '.svg';
  renderPage();
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
    const formatPrice = value => locale === 'ko'
      ? new Intl.NumberFormat('ko-KR').format(value) + '원'
      : money.format(value);
    menu.replaceChildren();
    for (const item of selection) {
      const article = element('article', '', 'card');
      const name = localized(item.name);
      const photoLabels = { ko: '사진 준비 중', en: 'Photo coming soon', ja: '写真準備中', 'zh-CN': '图片准备中' };
      const photoFrame = element('div', photoLabels[locale], 'menu-photo');
      article.append(photoFrame);
      if (typeof item.image === 'string' && /^\/?images\//.test(item.image)) {
        const photo = new URL(item.image.replace(/^\//, ''), import.meta.url);
        const imageRoot = new URL('./images/', import.meta.url);
        if (photo.href.startsWith(imageRoot.href)) {
          const img = element('img', '');
          img.alt = '';
          img.loading = 'lazy';
          img.addEventListener('error', () => img.remove());
          img.src = photo.href;
          photoFrame.append(img);
        }
      }
      const details = element('div', '', 'details');
      const price = element('div', '', 'prices');
      const variants = Array.isArray(item.prices) ? item.prices : [];
      const validPrice = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
      const available = variants.filter(option => validPrice(option.price));
      for (const option of available) {
        const row = element('p', '', 'price-row');
        const upper = validPrice(option.maxPrice) && option.maxPrice > option.price
          ? ' – ' + formatPrice(option.maxPrice) : '';
        row.append(element('span', option.weight || ''), element('strong', formatPrice(option.price) + upper));
        price.append(row);
      }
      if (!available.length) {
        price.append(element('strong', validPrice(item.price) ? formatPrice(item.price) : infoLabels[locale][5]));
      }
      details.append(
        element('h2', name),
        price
      );
      if (localized(item.description)) {
        details.append(element('p', localized(item.description), 'description'));
      }
      if (localized(item.origin)) {
        details.append(element('p', infoLabels[locale][6] + ' · ' + localized(item.origin), 'origin'));
      }
      if (item.soldOut) details.append(element('span', soldOut, 'badge'));
      article.append(details);
      const open = element('button', uiLabels[locale][0], 'card-open');
      open.type = 'button';
      open.setAttribute('aria-label', name + ' · ' + uiLabels[locale][0]);
      open.setAttribute('aria-haspopup', 'dialog');
      open.addEventListener('click', () => {
        const detail = article.cloneNode(true);
        detail.querySelector('.card-open').remove();
        detail.className = 'detail-card';
        detail.querySelector('h2').id = 'product-title';
        document.querySelector('#product-detail').replaceChildren(detail);
        document.querySelector('#close-dialog').setAttribute('aria-label', uiLabels[locale][1]);
        document.querySelector('#product-dialog').showModal();
      });
      article.append(open);
      menu.append(article);
    }
  }
}


function renderStore() {
  const section = document.querySelector('#store');
  section.replaceChildren();
  const mobileLabels = { ko: '휴대폰 번호', en: 'Mobile phone', ja: '携帯電話', 'zh-CN': '手机号码' };
  const labels = [...infoLabels[locale], mobileLabels[locale]];
  section.append(element('h2', labels[0]));
  for (const [index, key] of [[1, 'address'], [2, 'hours'], [3, 'phone'], [7, 'mobile'], [4, 'notice']]) {
    const value = localized(store[key]);
    if (!value.trim()) continue;
    const row = element('div', '', 'store-row');
    const content = element('p', value);
    if ((key === 'phone' || key === 'mobile') && /^[+0-9()\s-]+$/.test(value)) {
      const call = element('a', value);
      call.href = 'tel:' + value.replace(/[^+0-9]/g, '');
      content.replaceChildren(call);
    }
    row.append(element('h3', labels[index]), content);
    section.append(row);
  }
  if (section.children.length === 1) section.append(element('p', uiLabels[locale][3]));
}

function renderPage() {
  const isStore = location.hash === '#store';
  document.querySelector('#title').textContent = isStore ? infoLabels[locale][0] : copy[locale][0];
  document.querySelector('#store').hidden = !isStore;
  document.querySelector('#back-link').hidden = !isStore;
  document.querySelector('#back-link').textContent = uiLabels[locale][2];
  document.querySelector('#store-link').textContent = infoLabels[locale][0];
  filters.hidden = isStore;
  menu.hidden = isStore;
  status.hidden = isStore;
}
window.addEventListener('hashchange', () => {
  document.querySelector('#language-picker').open = false;
  renderPage();
  window.scrollTo({ top: 0, behavior: 'instant' });
});

async function loadStore() {
  try {
    const response = await fetch(new URL('./data/store.json', import.meta.url), { cache: 'no-cache' });
    if (!response.ok) throw new Error('Store request failed');
    const data = await response.json();
    if (data && typeof data === 'object' && !Array.isArray(data)) store = data;
  } catch (error) {
    console.error(error);
  }
  render();
}
loadStore();

for (const button of languageButtons) {
  button.addEventListener('click', () => {
    locale = button.dataset.locale;
    document.querySelector('#language-picker').open = false;
    document.querySelector('#language-toggle').focus();
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
