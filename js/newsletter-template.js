const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';

export const DEFAULT_CSS = `body { margin: 0; padding: 0; background-color: #f4f4f4; }
.newsletter { margin: 0 auto; background-color: #ffffff; }
.banner img { display: block; width: 100%; }
.header { background-color: #ffffff; padding: 0; text-align: center; }
.header h1 { font-family: ${FONT_FAMILY}; color: #333; margin: 0; font-size: 21.5pt; }
.article { padding: 15px 20px; font-family: ${FONT_FAMILY}; }
.article h2 { font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 5px 0; font-size: 18pt; }
.article-body { font-family: ${FONT_FAMILY}; color: #333; }
.article-body p { font-size: 14.5pt; }
.article-img-block { display: block; margin: 10px 0; }
.article-img-right { float: right; margin: 0 0 5px 5px; }
.article-img-left { float: left; margin: 0 5px 5px 0; }
.divider { background-color: ${GREEN}; height: 20px; padding: 0; font-size: 0; line-height: 0; }
`;

function articleImageHTML(img) {
  const src = img.dataUrl || `[UPLOAD_TO_LUMINATE: ${img.filename}]`;
  const align = img.align || 'right';
  const width = img.width || 300;
  const alt = img.alt || '';
  const cls = align === 'none' ? 'article-img-block' : `article-img-${align}`;
  return `<img src="${src}" width="${width}" alt="${alt}" class="${cls}" />`;
}

function dividerHTML() {
  return `<tr><td class="divider" style="background-color:${GREEN};height:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

function articleHTML(article) {
  const images = article.images.map(articleImageHTML).join('\n');
  const body = article.body || '';
  return `<tr><td class="article">
  <h2>${article.title || 'Untitled'}</h2>
  ${images}
  <div class="article-body">${body}</div>
  <div style="clear:both;"></div>
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


function articlesWithDividersHTML(articles) {
  return articles.map((article, i) => {
    const row = articleHTML(article);
    return i < articles.length - 1 ? row + '\n' + dividerHTML() : row;
  }).join('\n');
}

export function generateArticlesHTML(articles) {
  return articlesWithDividersHTML(articles);
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
<table class="newsletter" width="600" align="center" cellpadding="0" cellspacing="0">
${headerHTML(title, bannerUrl)}
${articlesWithDividersHTML(articles)}
</table>
</body>
</html>`;
}

export function generatePreviewHTML(newsletter) {
  return generateFullHTML(newsletter);
}
