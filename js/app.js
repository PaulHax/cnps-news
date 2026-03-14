import * as state from './state.js';
import { handlePaste } from './html-cleaner.js';
import { resizeImage, downloadAllImages } from './image-handler.js';
import { initPreview } from './preview.js';
import { generateArticlesHTML, generateFullHTML, DEFAULT_CSS } from './newsletter-template.js';

const pasteArea = document.getElementById('paste-area');
const titleInput = document.getElementById('newsletter-title');
const previewIframe = document.getElementById('preview-iframe');
const picker = document.getElementById('newsletter-picker');
const bannerUrlInput = document.getElementById('banner-url');
const htmlOutput = document.getElementById('html-output');
const cssEditor = document.getElementById('css-editor');
const toast = document.getElementById('toast');
const maxWidthInput = document.getElementById('max-image-width');
const previewTabs = document.querySelectorAll('.preview-tab');
const imageDropZone = document.getElementById('image-drop-zone');
const imageThumbnails = document.getElementById('image-thumbnails');

let activeTab = 'preview';
let pasteAreaFocused = false;

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
  showToast('Copied to clipboard!');
}

function escapeAttr(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function renderImageThumb(img) {
  const src = img.dataUrl || '';
  return `<div class="image-thumb" data-image-id="${img.id}">
    ${src ? `<img src="${src}" alt="${escapeAttr(img.alt)}" />` : '<div style="height:80px;background:#eee;display:flex;align-items:center;justify-content:center;color:#aaa;">No preview</div>'}
    <button class="remove-image-btn">\u2715</button>
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

function render(data) {
  titleInput.value = data.title;
  bannerUrlInput.value = data.bannerUrl || '';
  if (document.activeElement !== cssEditor) {
    cssEditor.value = data.css || DEFAULT_CSS;
  }
  if (!pasteAreaFocused) {
    pasteArea.innerHTML = data.body || '';
  }
  imageThumbnails.innerHTML = (data.images || []).map(renderImageThumb).join('');
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

// Paste area events
pasteArea.addEventListener('paste', (e) => {
  const cleaned = handlePaste(e);
  pasteArea.innerHTML = cleaned;
  state.setBody(cleaned);
});

pasteArea.addEventListener('focusin', () => {
  pasteAreaFocused = true;
});

pasteArea.addEventListener('focusout', () => {
  state.setBody(pasteArea.innerHTML);
  pasteAreaFocused = false;
});

// Image events
imageDropZone.addEventListener('click', (e) => {
  const input = imageDropZone.querySelector('input[type="file"]');
  if (e.target !== input) input.click();
});

imageDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  imageDropZone.classList.add('dragover');
});

imageDropZone.addEventListener('dragleave', () => {
  imageDropZone.classList.remove('dragover');
});

imageDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  imageDropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFiles(e.dataTransfer.files);
  }
});

imageDropZone.querySelector('input[type="file"]').addEventListener('change', (e) => {
  handleFiles(e.target.files);
  e.target.value = '';
});

imageThumbnails.addEventListener('click', (e) => {
  if (e.target.closest('.remove-image-btn')) {
    const imageId = e.target.closest('[data-image-id]')?.dataset.imageId;
    if (imageId) state.removeImage(imageId);
  }
});

imageThumbnails.addEventListener('change', (e) => {
  const imageId = e.target.closest('[data-image-id]')?.dataset.imageId;
  if (!imageId) return;
  if (e.target.classList.contains('image-width-select')) {
    state.updateImage(imageId, { width: parseInt(e.target.value) });
  }
  if (e.target.classList.contains('image-align-select')) {
    state.updateImage(imageId, { align: e.target.value });
  }
});

imageThumbnails.addEventListener('input', (e) => {
  const imageId = e.target.closest('[data-image-id]')?.dataset.imageId;
  if (imageId && e.target.classList.contains('image-alt-input')) {
    state.updateImage(imageId, { alt: e.target.value });
  }
});

async function handleFiles(files) {
  const maxWidth = parseInt(maxWidthInput.value) || 300;
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    try {
      const resized = await resizeImage(file, maxWidth);
      state.addImage(resized);
    } catch (err) {
      showToast(`Failed to process ${file.name}`);
    }
  }
}

document.getElementById('copy-articles-btn').addEventListener('click', () => {
  const html = generateArticlesHTML(state.getState().body);
  copyToClipboard(html);
});

document.getElementById('copy-full-btn').addEventListener('click', () => {
  const html = generateFullHTML(state.getState());
  copyToClipboard(html);
});

document.getElementById('download-images-btn').addEventListener('click', () => {
  downloadAllImages(state.getState().images);
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

const preview = initPreview(previewIframe, state.getState);
state.subscribe((data) => {
  render(data);
  renderPicker();
});

state.init().then((data) => {
  render(data);
  renderPicker();
});
