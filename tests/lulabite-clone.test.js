const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const jiyuRoot = path.resolve(root, '..', 'Jiyu');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const jiyuHtmlPages = fs.readdirSync(jiyuRoot)
  .filter((file) => file.endsWith('.html'))
  .sort();

const lulabiteHtmlPages = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html'))
  .sort();

assert.deepEqual(
  lulabiteHtmlPages,
  jiyuHtmlPages,
  'Lulabites must contain every root HTML page from the Jiyu layout system.'
);

const index = read('index.html');
const styles = read('styles.css');
const routes = read('checkout-routes.js');
const script = read('script.js');

[
  'product-gallery',
  'product-info',
  'benefit-strip',
  'real-results',
  'clinical-ingredients',
  'how-different',
  'customer-reviews',
  'faq-section',
  'social-section',
  'newsletter-section'
].forEach((id) => {
  assert(index.includes(`id="${id}"`), `Landing page must preserve #${id}.`);
});

assert.equal((index.match(/class="gallery-slide/g) || []).length, 12, 'Jiyu gallery slide count must stay intact.');
assert.equal((index.match(/data-faq/g) || []).length, 13, 'Jiyu FAQ item count must stay intact.');
assert.equal((index.match(/data-accordion/g) || []).length, 4, 'Jiyu product accordion count must stay intact.');
assert.equal((index.match(/class="result-slide/g) || []).length, 4, 'Jiyu result carousel count must stay intact.');

assert(index.includes('scraped/69a6e16973a20246b1c7154c.png'), 'Landing page must use scraped Lulabite product imagery.');
assert(index.includes('assets/Lulla%20(1).mp4'), 'Landing page must use Lulabite video assets.');
assert(index.includes('Shop Now'), 'Offer CTA copy must be Shop Now.');
assert(!index.includes('Renewal &amp; Rejuvenation Toner Pads'), 'Landing page must not show old Jiyu product copy.');
assert(!index.includes('tonerpads'), 'Landing page must not contain old toner-pad checkout URLs.');
assert(!index.includes('my.felinebloom.com'), 'Landing page must use placeholder/local links, not Jiyu checkout links.');

[
  'about.html',
  'faq.html',
  'checkout.html',
  'thankyou.html'
].forEach((file) => {
  const page = read(file);
  assert(!/dark spots|wrinkles|snail mucin|niacinamide|peptides/i.test(page), `${file} must not show old skincare product copy.`);
  assert(!/my\.felinebloom\.com|tonerpads/i.test(page), `${file} must not contain old checkout URLs.`);
});

assert(styles.includes('--brand-blue: #0f3fbf;'), 'Styles must include scraped blue brand token.');
assert(styles.includes('--brand-navy: #0b1220;'), 'Styles must include scraped navy brand token.');
assert(styles.includes('"Inter"'), 'Styles must use scraped/system Inter-style font stack.');

assert(routes.includes("buy1: '#'"), 'Checkout route map must use placeholder links.');
assert(script.includes("buy1: '#'"), 'Inline checkout route map must use placeholder links.');
assert(script.includes("buy1Get1: 'buy1Get1'"), 'Bundle alias logic must remain intact.');

console.log('lulabite-clone.test.js passed');
