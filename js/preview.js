import { generatePreviewHTML } from './newsletter-template.js';

export function initPreview(iframe, getState) {
  function render() {
    const state = getState();
    const html = generatePreviewHTML(state);
    const doc = iframe.contentDocument;
    doc.open();
    doc.write(html);
    doc.close();
  }

  return { render };
}
