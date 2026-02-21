const DB_NAME = 'cnps-newsletter';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const NEWSLETTERS_KEY = 'cnps-newsletters';
const CURRENT_KEY = 'cnps-current-newsletter';

let db = null;
let state = null;
let listeners = [];

function createNewsletter(name = 'Untitled Newsletter') {
  return {
    name,
    title: name,
    bannerUrl: 'http://cnps.convio.net/images/content/pagebuilder/simple-header.jpg',
    css: '',
    articles: [],
  };
}

function createArticle() {
  return {
    id: crypto.randomUUID(),
    title: '',
    body: '',
    images: [],
    collapsed: false,
  };
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

function persist() {
  const serializable = {
    name: state.name,
    title: state.title,
    css: state.css,
    articles: state.articles.map((a) => ({
      ...a,
      images: a.images.map(({ blob, dataUrl, ...rest }) => rest),
    })),
  };
  const all = getNewsletterList();
  if (!all.includes(state.name)) {
    all.push(state.name);
    localStorage.setItem(NEWSLETTERS_KEY, JSON.stringify(all));
  }
  localStorage.setItem(`cnps-nl-${state.name}`, JSON.stringify(serializable));
  localStorage.setItem(CURRENT_KEY, state.name);
  persistImages();
}

function persistImages() {
  if (!db) return;
  const tx = db.transaction(IMAGE_STORE, 'readwrite');
  const store = tx.objectStore(IMAGE_STORE);
  store.delete(state.name);
  const imageData = {};
  for (const article of state.articles) {
    for (const img of article.images) {
      if (img.blob) {
        imageData[img.id] = { blob: img.blob, articleId: article.id };
      }
    }
  }
  if (Object.keys(imageData).length > 0) {
    store.put({ id: state.name, images: imageData });
  }
}

async function loadImages(name) {
  if (!db) return {};
  return new Promise((resolve) => {
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const store = tx.objectStore(IMAGE_STORE);
    const req = store.get(name);
    req.onsuccess = () => resolve(req.result?.images || {});
    req.onerror = () => resolve({});
  });
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getNewsletterList() {
  try {
    return JSON.parse(localStorage.getItem(NEWSLETTERS_KEY)) || [];
  } catch {
    return [];
  }
}

export async function init() {
  db = await openDB();
  const currentName = localStorage.getItem(CURRENT_KEY);
  if (currentName) {
    await loadNewsletter(currentName);
  } else {
    state = createNewsletter();
    persist();
  }
  return state;
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function update() {
  persist();
  notify();
}

export function setTitle(title) {
  state.title = title;
  update();
}

export function setBannerUrl(url) {
  state.bannerUrl = url;
  update();
}

export function setCss(css) {
  state.css = css;
  update();
}

export function addArticle() {
  const article = createArticle();
  state.articles.push(article);
  update();
  return article;
}

export function removeArticle(id) {
  state.articles = state.articles.filter((a) => a.id !== id);
  update();
}

export function updateArticle(id, changes) {
  state.articles = state.articles.map((a) =>
    a.id === id ? { ...a, ...changes } : a
  );
  update();
}

export function reorderArticles(fromIndex, toIndex) {
  const articles = [...state.articles];
  const [moved] = articles.splice(fromIndex, 1);
  articles.splice(toIndex, 0, moved);
  state.articles = articles;
  update();
}

export function addImage(articleId, imageData) {
  state.articles = state.articles.map((a) =>
    a.id === articleId
      ? { ...a, images: [...a.images, { id: crypto.randomUUID(), width: 300, alt: '', align: 'right', ...imageData }] }
      : a
  );
  update();
}

export function removeImage(articleId, imageId) {
  state.articles = state.articles.map((a) =>
    a.id === articleId
      ? { ...a, images: a.images.filter((img) => img.id !== imageId) }
      : a
  );
  update();
}

export function updateImage(articleId, imageId, changes) {
  state.articles = state.articles.map((a) =>
    a.id === articleId
      ? { ...a, images: a.images.map((img) => img.id === imageId ? { ...img, ...changes } : img) }
      : a
  );
  update();
}

export function toggleCollapsed(id) {
  const article = state.articles.find((a) => a.id === id);
  if (article) {
    article.collapsed = !article.collapsed;
    update();
  }
}

export async function loadNewsletter(name) {
  try {
    const data = JSON.parse(localStorage.getItem(`cnps-nl-${name}`));
    if (!data) {
      state = createNewsletter(name);
    } else {
      state = data;
      const imageMap = await loadImages(name);
      for (const article of state.articles) {
        for (const img of article.images) {
          const stored = imageMap[img.id];
          if (stored) {
            img.blob = stored.blob;
            img.dataUrl = URL.createObjectURL(stored.blob);
          }
        }
      }
    }
  } catch {
    state = createNewsletter(name);
  }
  localStorage.setItem(CURRENT_KEY, name);
  notify();
}

export async function saveAsNewsletter(newName) {
  state.name = newName;
  state.title = newName;
  persist();
  notify();
}

export async function newNewsletter(name) {
  state = createNewsletter(name);
  persist();
  notify();
}

export function deleteNewsletter(name) {
  localStorage.removeItem(`cnps-nl-${name}`);
  const all = getNewsletterList().filter((n) => n !== name);
  localStorage.setItem(NEWSLETTERS_KEY, JSON.stringify(all));
  if (db) {
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    tx.objectStore(IMAGE_STORE).delete(name);
  }
  if (state.name === name) {
    if (all.length > 0) {
      loadNewsletter(all[0]);
    } else {
      state = createNewsletter();
      persist();
      notify();
    }
  }
}

export { getNewsletterList };
