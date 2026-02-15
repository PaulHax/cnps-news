const FONT_FAMILY = "'Nunito Sans', arial, helvetica, sans-serif";
const GREEN = '#9bba77';
const ORANGE = '#F99D25';
const GRAY = '#646569';
const BANNER_URL = '[BANNER_IMAGE_URL]';

function articleImageHTML(img) {
  const src = img.dataUrl || `[UPLOAD_TO_LUMINATE: ${img.filename}]`;
  const align = img.align || 'right';
  const width = img.width || 300;
  const alt = img.alt || '';
  if (align === 'none') {
    return `<p><img src="${src}" width="${width}" alt="${alt}" style="display:block; margin:10px 0;" /></p>`;
  }
  const hspace = 5;
  return `<img src="${src}" width="${width}" alt="${alt}" align="${align}" hspace="${hspace}" style="margin-bottom:5px;" />`;
}

function articleHTML(article) {
  const images = article.images.map(articleImageHTML).join('\n');
  const body = article.body || '<p></p>';
  return `<tr>
  <td style="border-bottom: 20px solid ${GREEN}; padding: 15px 20px; font-family: ${FONT_FAMILY};">
    <h2 style="font-family: ${FONT_FAMILY}; color: #333; margin: 0 0 10px 0;">${article.title || 'Untitled'}</h2>
    ${images}
    <span style="font-size: 120%; font-family: ${FONT_FAMILY}; color: #333;">${body}</span>
    <div style="clear:both;"></div>
  </td>
</tr>`;
}

function headerHTML(title) {
  return `<tr>
  <td style="padding: 0;">
    <img src="${BANNER_URL}" width="600" alt="CNPS Marin" style="display:block; width:100%; max-width:600px;" />
  </td>
</tr>
<tr>
  <td style="background-color: ${GREEN}; padding: 15px 20px; text-align: center;">
    <h1 style="font-family: ${FONT_FAMILY}; color: #fff; margin: 0; font-size: 28px;">${title}</h1>
  </td>
</tr>`;
}

function footerHTML() {
  return `<tr>
  <td style="padding: 20px; text-align: center; font-family: ${FONT_FAMILY};">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td style="padding: 0 10px;">
          <a href="[JOIN_RENEW_URL]" target="_blank" style="display:inline-block; background-color:${ORANGE}; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; font-weight:bold; font-family:${FONT_FAMILY};">Join / Renew</a>
        </td>
        <td style="padding: 0 10px;">
          <a href="[DONATE_URL]" target="_blank" style="display:inline-block; background-color:${ORANGE}; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; font-weight:bold; font-family:${FONT_FAMILY};">Donate</a>
        </td>
      </tr>
    </table>
    <p style="margin: 15px 0 5px; font-size: 14px; color: ${GRAY};">
      <a href="[WEBSITE_URL]" target="_blank" style="color:${GRAY};">Website</a> |
      <a href="[FACEBOOK_URL]" target="_blank" style="color:${GRAY};">Facebook</a> |
      <a href="[INSTAGRAM_URL]" target="_blank" style="color:${GRAY};">Instagram</a>
    </p>
  </td>
</tr>
<tr>
  <td style="background-color: ${GRAY}; height: 8px; font-size: 0;">&nbsp;</td>
</tr>`;
}

export function generateArticlesHTML(articles) {
  return articles.map(articleHTML).join('\n');
}

export function generateFullHTML(newsletter) {
  const { title, articles } = newsletter;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
<center>
<table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; background-color: #ffffff; max-width: 600px;">
${headerHTML(title)}
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
