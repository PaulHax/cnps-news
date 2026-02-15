const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';
const ORANGE = '#F99D25';
const GRAY = '#646569';

export const DEFAULT_CSS = `body { margin: 0; padding: 0; background-color: #f4f4f4; }
.newsletter { margin: 0 auto; max-width: 600px; background-color: #ffffff; }
.banner img { display: block; width: 100%; max-width: 600px; }
.header { background-color: ${GREEN}; padding: 15px 20px; text-align: center; }
.header h1 { font-family: ${FONT_FAMILY}; color: #fff; margin: 0; font-size: 28px; }
.article { border-bottom: 20px solid ${GREEN}; padding: 15px 20px; font-family: ${FONT_FAMILY}; }
.article h2 { font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 10px 0; }
.article-body { font-size: 120%; font-family: ${FONT_FAMILY}; color: #333; }
.article-img-block { display: block; margin: 10px 0; }
.article-img-float { margin-bottom: 5px; }
.article::after { content: ""; display: block; clear: both; }
.footer { padding: 20px; text-align: center; font-family: ${FONT_FAMILY}; }
.footer-buttons { display: flex; justify-content: center; gap: 20px; }
.cta-btn { display: inline-block; background-color: ${ORANGE}; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: ${FONT_FAMILY}; }
.social-links { margin: 15px 0 5px; font-size: 14px; color: ${GRAY}; }
.social-link { color: ${GRAY}; }
.footer-bar { background-color: ${GRAY}; height: 8px; }`;

function articleImageHTML(img) {
  const src = img.dataUrl || `[UPLOAD_TO_LUMINATE: ${img.filename}]`;
  const align = img.align || 'right';
  const width = img.width || 300;
  const alt = img.alt || '';
  if (align === 'none') {
    return `<img src="${src}" width="${width}" alt="${alt}" class="article-img-block" />`;
  }
  return `<img src="${src}" width="${width}" alt="${alt}" align="${align}" hspace="5" class="article-img-float" />`;
}

function articleHTML(article) {
  const images = article.images.map(articleImageHTML).join('\n');
  const body = article.body || '<p></p>';
  return `<div class="article">
  <h2>${article.title || 'Untitled'}</h2>
  ${images}
  <span class="article-body">${body}</span>
</div>`;
}

function headerHTML(title, bannerUrl) {
  const banner = bannerUrl
    ? `<div class="banner"><img src="${bannerUrl}" width="600" alt="CNPS Marin" /></div>`
    : '';
  return `${banner}
<div class="header">
  <h1>${title}</h1>
</div>`;
}

function footerHTML() {
  return `<div class="footer">
  <div class="footer-buttons">
    <a href="[JOIN_RENEW_URL]" target="_blank" class="cta-btn">Join / Renew</a>
    <a href="[DONATE_URL]" target="_blank" class="cta-btn">Donate</a>
  </div>
  <p class="social-links">
    <a href="[WEBSITE_URL]" target="_blank" class="social-link">Website</a> |
    <a href="[FACEBOOK_URL]" target="_blank" class="social-link">Facebook</a> |
    <a href="[INSTAGRAM_URL]" target="_blank" class="social-link">Instagram</a>
  </p>
</div>
<div class="footer-bar"></div>`;
}

export function generateArticlesHTML(articles) {
  return articles.map(articleHTML).join('\n');
}

export function generateFullHTML(newsletter) {
  const { title, bannerUrl, css, articles } = newsletter;
  const styles = css || DEFAULT_CSS;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<style>
${styles}
</style>
</head>
<body>
<div class="newsletter">
${headerHTML(title, bannerUrl)}
${articles.map(articleHTML).join('\n')}
${footerHTML()}
</div>
</body>
</html>`;
}

export function generatePreviewHTML(newsletter) {
  return generateFullHTML(newsletter);
}
