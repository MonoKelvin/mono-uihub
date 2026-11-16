import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startPrototypeServer } from './server.mjs';

const require = createRequire(new URL('../../site/package.json', import.meta.url));
const { chromium } = require('playwright');
const host = await startPrototypeServer(fileURLToPath(new URL('../../ui/', import.meta.url)));
const errors = [];
let browser;
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  const navigate = async view => {
    const target = page.locator(`[data-view="${view}"]`).first();
    if (view === 'favourites' && await target.count() === 0) await page.locator('.profile-trigger').click();
    await target.click();
  };
  await page.goto(host.url + '/buymore-studio/index.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('#view-title').textContent(), 'Explore');
  assert.equal(await page.locator('.favourites-products [data-product]').count(), 2);
  const initialImages = await page.locator('img').evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), ok: image.complete && image.naturalWidth > 0 })));
  assert.ok(initialImages.every(image => image.ok), JSON.stringify(initialImages));
  assert.equal(await page.locator('button button').count(), 0);

  await navigate('clothing');
  assert.equal(await page.locator('.product-card').count(), 4);
  await page.locator('[data-action="page-next"]').click();
  assert.equal(await page.locator('.pagination span').textContent(), '2 / 2');
  await page.locator('.product-picture').first().click();
  await page.locator('[data-back]').click();
  assert.equal(await page.locator('.pagination span').textContent(), '2 / 2');
  await navigate('gifts');
  assert.equal(await page.locator('.product-card').count(), 1);
  await page.locator('.product-picture').click();
  assert.ok(await page.locator('[data-size="One size"]').isEnabled());
  await page.locator('[data-action="add-cart"]').click();
  await navigate('cart');
  assert.equal(await page.locator('.pagination span').textContent(), '1 / 2');
  await page.locator('[data-action="cart-next"]').click();
  assert.match(await page.locator('.cart-row').textContent(), /carryall/);

  await navigate('explore');
  await page.locator('[data-action="filters"]').first().click();
  await page.locator('#sort-trigger').click();
  assert.ok(await page.locator('#sort-menu [disabled]').isDisabled());
  await page.keyboard.press('End');
  assert.equal(await page.locator('[data-sort="high"]').evaluate(element => element === document.activeElement), true);
  await page.keyboard.press('Enter');
  await page.locator('#filter-form input[name="price"]').fill('60');
  await page.locator('#filter-form .primary-button').click();
  assert.ok((await page.locator('.price-button').allTextContents()).every(price => Number(price.slice(1)) <= 60));
  const filterHeading = await page.locator('.view-heading p').textContent();
  await page.locator('.product-picture').first().click();
  await page.locator('[data-back]').click();
  assert.equal(await page.locator('.view-heading p').textContent(), filterHeading);
  await page.locator('[data-action="clear-search"]').click();

  await page.locator('[data-action="search"]').first().click();
  await page.locator('#search-form input').fill('canvas');
  await page.locator('#search-form .soft-button').click();
  assert.equal(await page.locator('.product-card').count(), 1);
  await page.locator('[data-action="search"]').first().click();
  await page.locator('#search-form input').fill('W'.repeat(90));
  await page.locator('#search-form .soft-button').click();
  assert.equal(await page.locator('.empty-state h2').textContent(), 'No pieces found');
  await page.locator('.empty-state button').click();
  assert.equal(await page.locator('.product-card').count(), 4);

  await navigate('favourites');
  await page.locator('[data-save="hoodie"]').click();
  await navigate('explore');
  assert.equal(await page.locator('.favourites-products [data-product]').count(), 1);
  assert.ok(await page.locator('[data-action="fav-next"]').isDisabled());
  await navigate('favourites');
  await page.locator('[data-save="green"]').click();
  assert.ok(await page.locator('.empty-state').isVisible());
  await navigate('explore');
  assert.equal(await page.locator('.favourites-products [data-product]').count(), 0);
  assert.ok(await page.locator('.favourites-empty').isVisible());
  await page.locator('[data-save="sandals"]').click();
  assert.equal(await page.locator('.favourites-products [data-product="sandals"]').count(), 1);

  await navigate('orders');
  await page.locator('[data-order="BM-1037"]').last().click();
  assert.equal(await page.locator('#view-title').textContent(), 'Order Details');
  await navigate('request');
  await page.locator('#request-form .primary-button').click();
  assert.ok(await page.locator('#request-form [aria-invalid="true"]').count());
  await page.locator('#request-form input[name="name"]').fill('Everyday jacket');
  await page.locator('#request-form input[name="url"]').fill('javascript:alert(1)');
  await page.locator('#request-form .primary-button').click();
  assert.match(await page.locator('#request-message').textContent(), /https/);
  await page.locator('#request-form input[name="url"]').fill('https://example.com/jacket');
  await page.locator('#request-form .primary-button').click();
  assert.equal(await page.locator('.member-row').count(), 1);
  await navigate('members');
  await page.locator('#member-form input[name="name"]').fill('Sam');
  await page.locator('#member-form input[name="email"]').fill('sam@example.com');
  await page.locator('#member-form .primary-button').click();
  assert.equal(await page.locator('.member-row').count(), 2);
  await page.locator('#member-form input[name="name"]').fill('Sam');
  await page.locator('#member-form input[name="email"]').fill('sam@example.com');
  await page.locator('#member-form .primary-button').click();
  assert.match(await page.locator('#member-message').textContent(), /already/);

  await page.reload({ waitUntil: 'networkidle' });
  await navigate('cart');
  const initialCount = await page.locator('.cart-preview span').textContent();
  await page.locator('[data-change="1"]').first().click();
  assert.notEqual(await page.locator('.cart-preview span').textContent(), initialCount);
  await page.locator('#promo-form input').fill('wrong');
  await page.locator('#promo-form button').click();
  assert.match(await page.locator('#promo-message').textContent(), /isn’t valid/);
  await page.locator('#promo-form input').fill('WELCOME10');
  await page.locator('#promo-form button').click();
  assert.ok(await page.locator('#promo-form button').isDisabled());
  await page.locator('[data-action="checkout"]').click();
  await page.locator('#checkout-form .primary-button').click();
  assert.ok(await page.locator('#checkout-form [aria-invalid="true"]').count());
  await page.locator('#checkout-form input[name="address"]').fill('24 Hudson Street');
  await page.locator('#checkout-form input[name="city"]').fill('New York');
  await page.locator('#checkout-form input[name="zip"]').fill('10013');
  await page.locator('#checkout-form .primary-button').click();
  assert.equal(await page.locator('#view-title').textContent(), 'Review Order');
  assert.ok(await page.locator('[data-action="payment-unavailable"]').isDisabled());

  await navigate('account');
  await page.locator('#profile-form input[name="name"]').fill('W'.repeat(60));
  await page.locator('#profile-form input[name="email"]').fill('a'.repeat(75) + '@example.com');
  await page.locator('#profile-form .primary-button').click();
  assert.match(await page.locator('#profile-message').textContent(), /updated/);
  const profileFits = await page.locator('.account-card').evaluate(element => [...element.querySelectorAll('h2, p')].every(child => child.scrollWidth <= child.clientWidth + 1));
  assert.ok(profileFits, '长账户名和邮箱必须在卡片内换行');
  await page.locator('#profile-form [data-action="logout"]').click();
  await page.locator('#login-form input[name="password"]').fill('secret123');
  await page.locator('#login-form .primary-button').click();
  assert.ok(await page.locator('#login-form .primary-button').isDisabled());
  await page.locator('#profile-form').waitFor();
  await page.locator('#profile-form [data-action="logout"]').click();
  await page.locator('#login-form input[name="password"]').fill('secret123');
  await page.locator('#login-form .primary-button').click();
  await page.waitForFunction(() => document.querySelector('#login-message')?.textContent.includes('couldn’t connect'));
  await page.locator('#login-form .primary-button').click();
  await page.locator('#profile-form').waitFor();

  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.cart-preview span').textContent(), '+8');
  assert.equal(await page.locator('#profile-name').textContent(), 'Ryana');
  await navigate('cart');
  while (await page.locator('[data-remove]').count()) await page.locator('[data-remove]').first().click();
  assert.equal(await page.locator('.empty-state h2').textContent(), 'Your cart is waiting');
  await page.reload({ waitUntil: 'networkidle' });

  for (const viewport of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    for (const view of ['explore', 'popular', 'clothing', 'gifts', 'inspiration', 'cart', 'orders', 'request', 'members', 'account']) {
      await navigate(view);
      const metrics = await page.evaluate(() => {
        const canvas = document.querySelector('.canvas'), rect = canvas.getBoundingClientRect();
        const elements = [...document.querySelectorAll('.canvas button, .workspace input, .workspace h1, .workspace h2, .workspace p')].filter(element => element.checkVisibility());
        const out = elements.filter(element => { const r = element.getBoundingClientRect(); return r.left < rect.left - 1 || r.right > rect.right + 1 || r.top < rect.top - 1 || r.bottom > rect.bottom + 1; }).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 50), rect: element.getBoundingClientRect().toJSON() }));
        return { out, pageScroll: document.documentElement.scrollWidth > innerWidth + 1 || document.documentElement.scrollHeight > innerHeight + 1, ratio: rect.width / rect.height, minFont: Math.min(...elements.map(element => parseFloat(getComputedStyle(element).fontSize))) };
      });
      assert.deepEqual(metrics.out, [], `${viewport.width}×${viewport.height} ${view}: 画布越界`);
      assert.equal(metrics.pageScroll, false, `${view}: 页面不应滚动`);
      assert.ok(Math.abs(metrics.ratio - 1.55) < .01);
      if (viewport.width >= 1280) assert.ok(metrics.minFont >= 12, `${view}: 最小字号 ${metrics.minFont}`);
    }
    console.log(`PASS ${viewport.width}×${viewport.height} 十视图边界、比例与字号`);
  }
  await page.setViewportSize({ width: 1366, height: 768 });
  await navigate('explore');
  await page.evaluate(() => document.documentElement.style.setProperty('--font', 'Arial, sans-serif'));
  const fallbackFits = await page.locator('.spotlight-products .product-info').evaluateAll(infos => infos.every(info => info.querySelector('.product-name').getBoundingClientRect().right <= info.querySelector('.price-button').getBoundingClientRect().left));
  assert.ok(fallbackFits, '回退字体下名称和价格不得碰撞');
  const source = await page.locator('.spotlight-products img').first().getAttribute('src');
  await page.locator('.spotlight-products img').first().evaluate(image => { image.src = 'assets/missing-verification-image.webp'; });
  await page.locator('.product-picture[data-retry-image]').waitFor();
  assert.equal(await page.locator('button button').count(), 0);
  await page.locator('.product-picture[data-retry-image]').evaluate((button, src) => { button.dataset.retryImage = src; }, source);
  await page.locator('.product-picture[data-retry-image]').click();
  await page.locator('.spotlight-products img').first().evaluate(image => image.decode());
  assert.equal(await page.locator('.image-retry-label').count(), 0);
  assert.equal(await page.locator('#view-title').textContent(), 'Explore');
  assert.deepEqual(errors, [], '浏览器 JavaScript 错误');
  console.log('PASS 单尺码、加购/分页、筛选/排序/返回、跨分类搜索、收藏同步/空态、订单、请求/成员校验、折扣/配送校验、支付禁用、账户、登录成功/失败/重试、刷新清零、图片恢复与字体回退');
} finally {
  if (browser) await browser.close();
  await host.close();
}
