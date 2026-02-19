const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';
const ORANGE = '#F99D25';
const GRAY = '#646569';

export const DEFAULT_CSS = `body { margin: 0; padding: 0; background-color: #f4f4f4; }
.newsletter { margin: 0 auto; background-color: #ffffff; }
.banner img { display: block; width: 100%; }
.header { background-color: ${GREEN}; padding: 15px 20px; text-align: center; }
.header h1 { font-family: ${FONT_FAMILY}; color: #fff; margin: 0; font-size: 28px; }
.article { border-bottom: 20px solid ${GREEN}; padding: 15px 20px; font-family: ${FONT_FAMILY}; }
.article h2 { font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 10px 0; font-size: 21.5pt; }
.article-body { font-family: ${FONT_FAMILY}; color: #333; }
.article-body p { font-size: 14.5pt; }
.article-img-block { display: block; margin: 10px 0; }
.article-img-right { float: right; margin: 0 0 5px 5px; }
.article-img-left { float: left; margin: 0 5px 5px 0; }
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
  const cls = align === 'none' ? 'article-img-block' : `article-img-${align}`;
  return `<img src="${src}" width="${width}" alt="${alt}" class="${cls}" />`;
}

function articleHTML(article) {
  const images = article.images.map(articleImageHTML).join('\n');
  const body = article.body || '';
  return `<tr><td class="article">
  <h2>${article.title || 'Untitled'}</h2>
  ${images}
  <div class="article-body">${body}</div>
</td></tr>`;
}

function headerHTML(title, bannerUrl) {
  const banner = bannerUrl
    ? `<tr><td class="banner"><img src="${bannerUrl}" alt="CNPS Marin" /></td></tr>`
    : '';
  return `${banner}
<tr><td class="header">
  <h1>${title}</h1>
</td></tr>`;
}

function footerHTML() {
  return `<tr><td class="footer">
  <div class="footer-buttons">
    <a href="[JOIN_RENEW_URL]" target="_blank" class="cta-btn">Join / Renew</a>
    <a href="[DONATE_URL]" target="_blank" class="cta-btn">Donate</a>
  </div>
  <div class="social-links">
    <a href="[WEBSITE_URL]" target="_blank" class="social-link">Website</a> |
    <a href="[FACEBOOK_URL]" target="_blank" class="social-link">Facebook</a> |
    <a href="[INSTAGRAM_URL]" target="_blank" class="social-link">Instagram</a>
  </div>
</td></tr>
<tr><td class="footer-bar"></td></tr>`;
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
<table class="newsletter" width="600" cellpadding="0" cellspacing="0">
${headerHTML(title, bannerUrl)}
${articles.map(articleHTML).join('\n')}
${footerHTML()}
</table>
</body>
</html>`;
}

export function generatePreviewHTML(newsletter) {
  return generateFullHTML(newsletter);
}
