const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';
const ORANGE = '#F99D25';
const GRAY = '#646569';

function styleBlock() {
  return `<style>
  body { margin: 0; padding: 0; background-color: #f4f4f4; }
  .email-container { margin: 0 auto; background-color: #ffffff; max-width: 600px; }
  .banner-cell { padding: 0; }
  .banner-img { display: block; width: 100%; max-width: 600px; }
  .header-cell { background-color: ${GREEN}; padding: 15px 20px; text-align: center; }
  .header-title { font-family: ${FONT_FAMILY}; color: #fff; margin: 0; font-size: 28px; }
  .article-cell { border-bottom: 20px solid ${GREEN}; padding: 15px 20px; font-family: ${FONT_FAMILY}; }
  .article-title { font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 10px 0; }
  .article-body { font-size: 120%; font-family: ${FONT_FAMILY}; color: #333; }
  .article-img-block { display: block; margin: 10px 0; }
  .article-img-float { margin-bottom: 5px; }
  .clear { clear: both; }
  .footer-cell { padding: 20px; text-align: center; font-family: ${FONT_FAMILY}; }
  .footer-buttons { margin: 0 auto; }
  .footer-btn-cell { padding: 0 10px; }
  .cta-btn { display: inline-block; background-color: ${ORANGE}; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-family: ${FONT_FAMILY}; }
  .social-links { margin: 15px 0 5px; font-size: 14px; color: ${GRAY}; }
  .social-link { color: ${GRAY}; }
  .footer-bar { background-color: ${GRAY}; height: 8px; font-size: 0; }
</style>`;
}

function articleImageHTML(img) {
  const src = img.dataUrl || `[UPLOAD_TO_LUMINATE: ${img.filename}]`;
  const align = img.align || 'right';
  const width = img.width || 300;
  const alt = img.alt || '';
  if (align === 'none') {
    return `<p><img src="${src}" width="${width}" alt="${alt}" class="article-img-block" /></p>`;
  }
  const hspace = 5;
  return `<img src="${src}" width="${width}" alt="${alt}" align="${align}" hspace="${hspace}" class="article-img-float" />`;
}

function articleHTML(article) {
  const images = article.images.map(articleImageHTML).join('\n');
  const body = article.body || '<p></p>';
  return `<tr>
  <td class="article-cell">
    <h2 class="article-title">${article.title || 'Untitled'}</h2>
    ${images}
    <span class="article-body">${body}</span>
    <div class="clear"></div>
  </td>
</tr>`;
}

function headerHTML(title, bannerUrl) {
  const bannerRow = bannerUrl
    ? `<tr>
  <td class="banner-cell">
    <img src="${bannerUrl}" width="600" alt="CNPS Marin" class="banner-img" />
  </td>
</tr>`
    : '';
  return `${bannerRow}
<tr>
  <td class="header-cell">
    <h1 class="header-title">${title}</h1>
  </td>
</tr>`;
}

function footerHTML() {
  return `<tr>
  <td class="footer-cell">
    <table role="presentation" class="footer-buttons" cellpadding="0" cellspacing="0">
      <tr>
        <td class="footer-btn-cell">
          <a href="[JOIN_RENEW_URL]" target="_blank" class="cta-btn">Join / Renew</a>
        </td>
        <td class="footer-btn-cell">
          <a href="[DONATE_URL]" target="_blank" class="cta-btn">Donate</a>
        </td>
      </tr>
    </table>
    <p class="social-links">
      <a href="[WEBSITE_URL]" target="_blank" class="social-link">Website</a> |
      <a href="[FACEBOOK_URL]" target="_blank" class="social-link">Facebook</a> |
      <a href="[INSTAGRAM_URL]" target="_blank" class="social-link">Instagram</a>
    </p>
  </td>
</tr>
<tr>
  <td class="footer-bar">&nbsp;</td>
</tr>`;
}

export function generateArticlesHTML(articles) {
  return articles.map(articleHTML).join('\n');
}

export function generateFullHTML(newsletter) {
  const { title, bannerUrl, articles } = newsletter;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
${styleBlock()}
</head>
<body>
<center>
<table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="600">
${headerHTML(title, bannerUrl)}
${articles.map(articleHTML).join('\n')}
${footerHTML()}
</table>
</center>
</body>
</html>`;
}

export function generatePreviewHTML(newsletter) {
  return generateFullHTML(newsletter);
}
