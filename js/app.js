import * as state from './state.js';
import { handlePaste } from './html-cleaner.js';
import { resizeImage, downloadAllImages } from './image-handler.js';
import { initDragSort } from './drag-sort.js';
import { initPreview } from './preview.js';
import { generateArticlesHTML, generateFullHTML, DEFAULT_CSS } from './newsletter-template.js';

const articleList = document.getElementById('article-list');
const emptyState = document.getElementById('empty-state');
const titleInput = document.getElementById('newsletter-title');
const previewIframe = document.getElementById('preview-iframe');
const picker = document.getElementById('newsletter-picker');
const bannerUrlInput = document.getElementById('banner-url');
const htmlOutput = document.getElementById('html-output');
const cssEditor = document.getElementById('css-editor');
const toast = document.getElementById('toast');
const maxWidthInput = document.getElementById('max-image-width');
const previewTabs = document.querySelectorAll('.preview-tab');

let focusedArticleId = null;
let activeTab = 'preview';

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
}

function renderArticleCard(article) {
  const card = document.createElement('div');
  card.className = 'article-card';
  card.dataset.articleId = article.id;

  const header = document.createElement('div');
  header.className = 'article-card-header';
  header.innerHTML = `
    <span class="drag-handle" draggable="true">⠿</span>
    <span class="article-title-display">${article.title || 'Untitled Article'}</span>
    <button class="collapse-toggle">${article.collapsed ? '▸' : '▾'}</button>
    <button class="remove-btn">✕</button>
  `;

  const body = document.createElement('div');
  body.className = `article-card-body${article.collapsed ? ' collapsed' : ''}`;

  body.innerHTML = `
    <label>Title</label>
    <input type="text" class="article-title-input" value="${escapeAttr(article.title)}" placeholder="Article title" />
    <label>Content (paste here)</label>
    <div class="paste-area" contenteditable="true">${article.body}</div>
    <label>Images</label>
    <div class="image-drop-zone" data-article-id="${article.id}">
      Drop images here or click to browse
      <input type="file" accept="image/*" multiple />
    </div>
    <div class="image-thumbnails">${article.images.map(renderImageThumb).join('')}</div>
  `;

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function renderImageThumb(img) {
  const src = img.dataUrl || '';
  return `<div class="image-thumb" data-image-id="${img.id}">
    ${src ? `<img src="${src}" alt="${escapeAttr(img.alt)}" />` : '<div style="height:80px;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;">No preview</div>'}
    <button class="remove-image-btn">✕</button>
    <div class="image-controls">
      <select class="image-width-select">
        <option value="200"${img.width === 200 ? ' selected' : ''}>200px</option>
        <option value="300"${img.width === 300 ? ' selected' : ''}>300px</option>
      </select>
      <select class="image-align-select">
        <option value="right"${img.align === 'right' ? ' selected' : ''}>Right</option>
        <option value="left"${img.align === 'left' ? ' selected' : ''}>Left</option>
        <option value="none"${img.align === 'none' ? ' selected' : ''}>Block</option>
      </select>
      <input type="text" class="image-alt-input" value="${escapeAttr(img.alt)}" placeholder="Alt text" />
    </div>
  </div>`;
}

function escapeAttr(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function render(data) {
  titleInput.value = data.title;
  bannerUrlInput.value = data.bannerUrl || '';
  if (document.activeElement !== cssEditor) {
    cssEditor.value = data.css || DEFAULT_CSS;
  }
  emptyState.style.display = data.articles.length ? 'none' : 'block';

  const existingIds = [...articleList.children].map((c) => c.dataset.articleId);
  const newIds = data.articles.map((a) => a.id);
  const orderChanged =
    existingIds.length !== newIds.length ||
    existingIds.some((id, i) => id !== newIds[i]);

  if (orderChanged) {
    const existingCards = new Map();
    for (const card of articleList.children) {
      existingCards.set(card.dataset.articleId, card);
    }
    const fragment = document.createDocumentFragment();
    for (const article of data.articles) {
      if (article.id === focusedArticleId && existingCards.has(article.id)) {
        const card = existingCards.get(article.id);
        card.querySelector('.article-title-display').textContent = article.title || 'Untitled Article';
        fragment.appendChild(card);
      } else {
        fragment.appendChild(renderArticleCard(article));
      }
    }
    articleList.replaceChildren(fragment);
  } else {
    for (const article of data.articles) {
      const card = articleList.querySelector(`[data-article-id="${article.id}"]`);
      if (!card) continue;
      if (article.id === focusedArticleId) {
        card.querySelector('.article-title-display').textContent = article.title || 'Untitled Article';
      } else {
        card.replaceWith(renderArticleCard(article));
      }
    }
  }
  updatePreview();
}

function updatePreview() {
  preview.render();
  htmlOutput.value = generateFullHTML(state.getState());
}

function renderPicker() {
  const names = state.getNewsletterList();
  const current = state.getState().name;
  picker.innerHTML = names
    .map((n) => `<option value="${escapeAttr(n)}"${n === current ? ' selected' : ''}>${escapeAttr(n)}</option>`)
    .join('');
}

function getArticleId(el) {
  return el.closest('[data-article-id]')?.dataset.articleId;
}

function getImageId(el) {
  return el.closest('[data-image-id]')?.dataset.imageId;
}

articleList.addEventListener('click', (e) => {
  const articleId = getArticleId(e.target);
  if (!articleId) return;

  if (e.target.closest('.remove-btn')) {
    state.removeArticle(articleId);
    return;
  }
  if (e.target.closest('.collapse-toggle') || (e.target.closest('.article-card-header') && !e.target.closest('.drag-handle'))) {
    state.toggleCollapsed(articleId);
    return;
  }
  if (e.target.closest('.remove-image-btn')) {
    const imageId = getImageId(e.target);
    if (imageId) state.removeImage(articleId, imageId);
    return;
  }
  if (e.target.closest('.image-drop-zone')) {
    const input = e.target.closest('.image-drop-zone').querySelector('input[type="file"]');
    if (e.target !== input) input.click();
  }
});

articleList.addEventListener('input', (e) => {
  const articleId = getArticleId(e.target);
  if (!articleId) return;

  if (e.target.classList.contains('article-title-input')) {
    state.updateArticle(articleId, { title: e.target.value });
    return;
  }
  if (e.target.classList.contains('image-alt-input')) {
    const imageId = getImageId(e.target);
    if (imageId) state.updateImage(articleId, imageId, { alt: e.target.value });
    return;
  }
});

articleList.addEventListener('change', (e) => {
  const articleId = getArticleId(e.target);
  if (!articleId) return;

  if (e.target.classList.contains('image-width-select')) {
    const imageId = getImageId(e.target);
    if (imageId) state.updateImage(articleId, imageId, { width: parseInt(e.target.value) });
    return;
  }
  if (e.target.classList.contains('image-align-select')) {
    const imageId = getImageId(e.target);
    if (imageId) state.updateImage(articleId, imageId, { align: e.target.value });
    return;
  }
  if (e.target.type === 'file') {
    handleFiles(articleId, e.target.files);
    e.target.value = '';
  }
});

articleList.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('paste-area') || e.target.classList.contains('article-title-input')) {
    focusedArticleId = getArticleId(e.target);
  }
});

articleList.addEventListener('focusout', (e) => {
  if (e.target.classList.contains('paste-area')) {
    const articleId = getArticleId(e.target);
    if (articleId) {
      state.updateArticle(articleId, { body: e.target.innerHTML });
    }
    focusedArticleId = null;
  }
});

articleList.addEventListener('paste', (e) => {
  const pasteArea = e.target.closest('.paste-area');
  if (!pasteArea) return;
  const cleaned = handlePaste(e);
  pasteArea.innerHTML = cleaned;
  const articleId = getArticleId(pasteArea);
  if (articleId) state.updateArticle(articleId, { body: cleaned });
});

articleList.addEventListener('dragover', (e) => {
  const zone = e.target.closest('.image-drop-zone');
  if (zone) {
    e.preventDefault();
    zone.classList.add('dragover');
  }
});

articleList.addEventListener('dragleave', (e) => {
  const zone = e.target.closest('.image-drop-zone');
  if (zone) zone.classList.remove('dragover');
});

articleList.addEventListener('drop', (e) => {
  const zone = e.target.closest('.image-drop-zone');
  if (!zone) return;
  e.preventDefault();
  zone.classList.remove('dragover');
  const articleId = zone.dataset.articleId;
  if (articleId && e.dataTransfer.files.length) {
    handleFiles(articleId, e.dataTransfer.files);
  }
});

async function handleFiles(articleId, files) {
  const maxWidth = parseInt(maxWidthInput.value) || 300;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const resized = await resizeImage(file, maxWidth);
      state.addImage(articleId, resized);
    } catch (err) {
      showToast(`Failed to process ${file.name}`);
    }
  }
}

document.getElementById('add-article-btn').addEventListener('click', () => state.addArticle());

document.getElementById('copy-articles-btn').addEventListener('click', () => {
  const html = generateArticlesHTML(state.getState().articles);
  copyToClipboard(html);
});

document.getElementById('copy-full-btn').addEventListener('click', () => {
  const html = generateFullHTML(state.getState());
  copyToClipboard(html);
});

document.getElementById('download-images-btn').addEventListener('click', () => {
  downloadAllImages(state.getState().articles);
});

titleInput.addEventListener('input', () => {
  state.setTitle(titleInput.value);
});

bannerUrlInput.addEventListener('input', () => {
  state.setBannerUrl(bannerUrlInput.value);
});

cssEditor.addEventListener('input', () => {
  state.setCss(cssEditor.value);
});

document.getElementById('reset-css-btn').addEventListener('click', () => {
  cssEditor.value = DEFAULT_CSS;
  state.setCss('');
});

previewTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    activeTab = tab.dataset.tab;
    previewTabs.forEach((t) => t.classList.toggle('active', t === tab));
    previewIframe.style.display = activeTab === 'preview' ? '' : 'none';
    htmlOutput.classList.toggle('active', activeTab === 'html');
  });
});

document.getElementById('new-newsletter-btn').addEventListener('click', () => {
  const name = prompt('Newsletter name:');
  if (name?.trim()) {
    state.newNewsletter(name.trim());
    renderPicker();
  }
});

document.getElementById('delete-newsletter-btn').addEventListener('click', () => {
  const current = state.getState().name;
  if (confirm(`Delete "${current}"?`)) {
    state.deleteNewsletter(current);
    renderPicker();
  }
});

picker.addEventListener('change', () => {
  state.loadNewsletter(picker.value);
});

initDragSort(articleList, (from, to) => {
  state.reorderArticles(from, to);
});

const preview = initPreview(previewIframe, state.getState);
state.subscribe((data) => {
  render(data);
  renderPicker();
});

state.init().then((data) => {
  render(data);
  renderPicker();
});
