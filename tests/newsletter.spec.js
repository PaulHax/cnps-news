import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    indexedDB.deleteDatabase('cnps-newsletter');
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
});

test('page loads with correct title', async ({ page }) => {
  await expect(page).toHaveTitle('CNPS Marin Newsletter Builder');
  await expect(page.locator('.toolbar h1')).toHaveText('CNPS Marin');
});

test('shows empty state initially', async ({ page }) => {
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#empty-state')).toContainText('No articles yet');
});

test('add an article via toolbar button', async ({ page }) => {
  await page.click('#add-article-btn');
  await expect(page.locator('.article-card')).toHaveCount(1);
  await expect(page.locator('#empty-state')).toBeHidden();
});

test('add an article via bottom button', async ({ page }) => {
  await page.click('#add-article-btn');
  await expect(page.locator('.article-card')).toHaveCount(1);
});

test('edit article title', async ({ page }) => {
  await page.click('#add-article-btn');
  const titleInput = page.locator('.article-title-input');
  await titleInput.fill('My Test Article');
  await titleInput.blur();
  await expect(page.locator('.article-title-display')).toContainText('My Test Article');
});

test('remove an article', async ({ page }) => {
  await page.click('#add-article-btn');
  await expect(page.locator('.article-card')).toHaveCount(1);
  await page.click('.remove-btn');
  await expect(page.locator('.article-card')).toHaveCount(0);
  await expect(page.locator('#empty-state')).toBeVisible();
});

test('collapse and expand article', async ({ page }) => {
  await page.click('#add-article-btn');
  await expect(page.locator('.article-card-body')).toBeVisible();
  await page.click('.collapse-toggle');
  await expect(page.locator('.article-card-body')).toBeHidden();
  await page.click('.collapse-toggle');
  await expect(page.locator('.article-card-body')).toBeVisible();
});

test('paste plain text into article body', async ({ page }) => {
  await page.click('#add-article-btn');
  const pasteArea = page.locator('.paste-area');
  await pasteArea.click();
  await page.evaluate(() => {
    const area = document.querySelector('.paste-area');
    const dt = new DataTransfer();
    dt.setData('text/plain', 'Hello world\n\nSecond paragraph');
    area.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
  });
  await expect(pasteArea).toContainText('Hello world');
  await expect(pasteArea).toContainText('Second paragraph');
});

test('paste HTML cleans formatting', async ({ page }) => {
  await page.click('#add-article-btn');
  const pasteArea = page.locator('.paste-area');
  await pasteArea.click();
  await page.evaluate(() => {
    const area = document.querySelector('.paste-area');
    const dt = new DataTransfer();
    dt.setData('text/html', '<div style="font-family: Comic Sans"><b>Bold</b> and <span class="weird">normal</span><script>alert("xss")</script></div>');
    area.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
  });
  const html = await pasteArea.innerHTML();
  expect(html).toContain('<strong>Bold</strong>');
  expect(html).not.toContain('script');
  expect(html).not.toContain('Comic Sans');
  expect(html).not.toContain('class=');
});

test('edit newsletter title', async ({ page }) => {
  const titleInput = page.locator('#newsletter-title');
  await titleInput.fill('March 2026 Newsletter');
  await expect(titleInput).toHaveValue('March 2026 Newsletter');
});

test('preview iframe renders', async ({ page }) => {
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').fill('Preview Test');
  await page.locator('.article-title-input').blur();
  const iframe = page.frameLocator('#preview-iframe');
  await expect(iframe.locator('h2')).toContainText('Preview Test');
});

test('copy full HTML to clipboard', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').fill('Copy Test');
  await page.locator('.article-title-input').blur();
  await page.click('#copy-full-btn');
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('Copy Test');
  expect(clipText).toContain('class="newsletter"');
  expect(clipText).toContain('9bba77');
});

test('copy articles-only HTML to clipboard', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').fill('Articles Only');
  await page.locator('.article-title-input').blur();
  await page.click('#copy-articles-btn');
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipText).toContain('Articles Only');
  expect(clipText).not.toContain('<!DOCTYPE');
});

test('add multiple articles and reorder via state', async ({ page }) => {
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').first().fill('First');
  await page.locator('.article-title-input').first().blur();
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').last().fill('Second');
  await page.locator('.article-title-input').last().blur();
  const titles = await page.locator('.article-title-display').allInnerTexts();
  expect(titles).toEqual(['First', 'Second']);
});

test('newsletter persists across reload', async ({ page }) => {
  await page.locator('#newsletter-title').fill('Persistent NL');
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').fill('Saved Article');
  await page.locator('.article-title-input').blur();
  await page.reload();
  await expect(page.locator('#newsletter-title')).toHaveValue('Persistent NL');
  await expect(page.locator('.article-title-display')).toContainText('Saved Article');
});

test('create new newsletter and switch', async ({ page }) => {
  await page.click('#add-article-btn');
  await page.locator('.article-title-input').fill('Article in First');
  await page.locator('.article-title-input').blur();

  const firstName = await page.locator('#newsletter-picker').inputValue();

  page.on('dialog', (dialog) => dialog.accept('Second NL'));
  await page.click('#new-newsletter-btn');

  await expect(page.locator('#newsletter-title')).toHaveValue('Second NL');
  await expect(page.locator('.article-card')).toHaveCount(0);

  await page.locator('#newsletter-picker').selectOption(firstName);
  await expect(page.locator('.article-title-display')).toContainText('Article in First');
});

test('delete newsletter', async ({ page }) => {
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') await dialog.accept('To Delete');
    else await dialog.accept();
  });
  await page.click('#new-newsletter-btn');
  await page.click('#add-article-btn');
  await page.click('#delete-newsletter-btn');
  await expect(page.locator('.article-card')).toHaveCount(0);
});

test('image upload creates thumbnail', async ({ page }) => {
  await page.click('#add-article-btn');
  const fileInput = page.locator('.image-drop-zone input[type="file"]');
  const buffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'green';
    ctx.fillRect(0, 0, 400, 300);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob.arrayBuffer().then((ab) => resolve(Array.from(new Uint8Array(ab))));
      }, 'image/png');
    });
  });
  await fileInput.setInputFiles({
    name: 'test-image.png',
    mimeType: 'image/png',
    buffer: Buffer.from(buffer),
  });
  await expect(page.locator('.image-thumb')).toHaveCount(1);
  await expect(page.locator('.image-thumb img')).toBeVisible();
});

test('remove image from article', async ({ page }) => {
  await page.click('#add-article-btn');
  const fileInput = page.locator('.image-drop-zone input[type="file"]');
  const buffer = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 100, 100);
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        blob.arrayBuffer().then((ab) => resolve(Array.from(new Uint8Array(ab))));
      }, 'image/png');
    });
  });
  await fileInput.setInputFiles({
    name: 'remove-me.png',
    mimeType: 'image/png',
    buffer: Buffer.from(buffer),
  });
  await expect(page.locator('.image-thumb')).toHaveCount(1);
  await page.click('.remove-image-btn');
  await expect(page.locator('.image-thumb')).toHaveCount(0);
});

test('toast appears on copy', async ({ context, page }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('#copy-full-btn');
  await expect(page.locator('#toast')).toHaveClass(/visible/);
  await expect(page.locator('#toast')).toContainText('Copied');
});
