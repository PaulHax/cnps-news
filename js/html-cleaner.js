import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.es.mjs';

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'p', 'a', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'br', 'blockquote',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  KEEP_CONTENT: true,
  ALLOW_DATA_ATTR: false,
};

function normalizeDOM(container) {
  container.querySelectorAll('b').forEach((el) => {
    const strong = document.createElement('strong');
    strong.innerHTML = el.innerHTML;
    el.replaceWith(strong);
  });

  container.querySelectorAll('i').forEach((el) => {
    const em = document.createElement('em');
    em.innerHTML = el.innerHTML;
    el.replaceWith(em);
  });

  container.querySelectorAll('a').forEach((el) => {
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
    const href = el.getAttribute('href') || '';
    if (href && !/^(https?:|mailto:|tel:)/i.test(href)) {
      el.removeAttribute('href');
    }
  });

  collapseEmptyParagraphs(container);
  cleanExcessiveBrs(container);
  removeEmptyInlines(container);
}

function collapseEmptyParagraphs(container) {
  const paragraphs = [...container.querySelectorAll('p')];
  let prevWasEmpty = false;
  for (const p of paragraphs) {
    const isEmpty = !p.textContent.trim() && !p.querySelector('img, br');
    if (isEmpty && prevWasEmpty) {
      p.remove();
    }
    prevWasEmpty = isEmpty;
  }
}

function cleanExcessiveBrs(container) {
  const brs = [...container.querySelectorAll('br')];
  let consecutive = 0;
  for (const br of brs) {
    const next = br.nextSibling;
    if (next && next.nodeName === 'BR') {
      consecutive++;
      if (consecutive >= 2) {
        br.remove();
      }
    } else {
      consecutive = 0;
    }
  }
}

function removeEmptyInlines(container) {
  container.querySelectorAll('strong, em, a').forEach((el) => {
    if (!el.textContent.trim() && !el.querySelector('img')) {
      el.remove();
    }
  });
}

export function cleanHTML(dirty) {
  if (!dirty || !dirty.trim()) return '';

  const sanitized = DOMPurify.sanitize(dirty, PURIFY_CONFIG);

  const temp = document.createElement('div');
  temp.innerHTML = sanitized;
  normalizeDOM(temp);

  return temp.innerHTML.trim();
}

export function handlePaste(event) {
  event.preventDefault();
  const html = event.clipboardData.getData('text/html');
  const text = event.clipboardData.getData('text/plain');
  const raw = html || `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
  return cleanHTML(raw);
}
