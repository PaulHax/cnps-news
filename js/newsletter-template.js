const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';

export const DEFAULT_CSS = `body { margin: 0; padding: 0; background-color: #f4f4f4; }
.newsletter { margin: 0 auto; background-color: #ffffff; }
.banner img { display: block; width: 100%; }
.newsletter-title { padding: 12px 20px 10px; font-family: ${FONT_FAMILY}; font-size: 22pt; font-weight: bold; color: #333; margin: 0; }
.article { padding: 15px 20px; font-family: ${FONT_FAMILY}; }
.article h2 { font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 5px 0; font-size: 18pt; }
.article-body { font-family: ${FONT_FAMILY}; color: #333; }
.article-body p { font-size: 14.5pt; }
.article-img-block { display: block; margin: 10px 0; }
.article-img-right { float: right; margin: 0 0 5px 5px; }
.article-img-left { float: left; margin: 0 5px 5px 0; }
.divider { background-color: ${GREEN}; height: 20px; padding: 0; font-size: 0; line-height: 0; }
`;

function dividerHTML() {
  return `<tr><td class="divider" style="background-color:${GREEN};height:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>`;
}

function articleHTML(article) {
  return `<tr><td class="article">
  <h2>${article.title || 'Untitled'}</h2>
  <div class="article-body">${article.body || ''}</div>
  <div style="clear:both;"></div>
</td></tr>`;
}

function bannerHTML(bannerUrl) {
  if (!bannerUrl) return '';
  return `<tr><td class="banner"><img src="${bannerUrl}" alt="CNPS Marin" /></td></tr>`;
}

function titleHTML(title) {
  if (!title) return '';
  return `<tr><td class="newsletter-title" style="padding:12px 20px 10px;font-family:${FONT_FAMILY};font-size:22pt;font-weight:bold;color:#333;">${title}</td></tr>
${dividerHTML()}`;
}

export function parseBodyIntoArticles(bodyHTML) {
  if (!bodyHTML || !bodyHTML.trim()) return [];

  const temp = document.createElement('div');
  temp.innerHTML = bodyHTML;

  const articles = [];
  let currentTitle = '';
  let currentBody = '';

  const flushArticle = () => {
    if (currentTitle || currentBody.trim()) {
      articles.push({ title: currentTitle, body: currentBody.trim() });
    }
    currentTitle = '';
    currentBody = '';
  };

  for (const node of [...temp.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H2') {
      flushArticle();
      currentTitle = node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      currentBody += node.outerHTML;
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      currentBody += node.textContent;
    }
  }

  flushArticle();
  return articles;
}

function articlesWithDividersHTML(articles) {
  return articles.map((article, i) => {
    const row = articleHTML(article);
    return i < articles.length - 1 ? row + '\n' + dividerHTML() : row;
  }).join('\n');
}

export function generateArticlesHTML(body) {
  const articles = parseBodyIntoArticles(body);
  return articlesWithDividersHTML(articles);
}

export function generateFullHTML(newsletter) {
  const { title, bannerUrl, css, body } = newsletter;
  const styles = css || DEFAULT_CSS;
  const articles = parseBodyIntoArticles(body);
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
${bannerHTML(bannerUrl)}
${titleHTML(title)}
${articlesWithDividersHTML(articles)}
</table>
</body>
</html>`;
}

export function generatePreviewHTML(newsletter) {
  return generateFullHTML(newsletter);
}
