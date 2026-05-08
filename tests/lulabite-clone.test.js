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
const htmlPages = lulabiteHtmlPages.map((file) => [file, read(file)]);

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

assert.equal((index.match(/class="gallery-slide/g) || []).length, 11, 'Landing gallery must keep one clean mobile slide set without duplicated buy1take1 media.');
assert(index.includes('<span>11</span>\n          </div>\n          <div class="gallery-thumb-row">'), 'Landing gallery counter must match the 11 mobile gallery slides.');
assert(index.includes('class="gallery-slide is-active" data-index="0" data-gallery-role="mobile-default"'), 'Landing gallery mobile/tablet default must be the first active mobile slide.');
assert(index.includes('class="gallery-thumb active" data-index="0" data-gallery-role="mobile-default"'), 'Landing gallery mobile/tablet default thumbnail must be active by default.');
{
  const galleryMarker = index.indexOf('id="product-gallery"');
  const galleryStart = index.lastIndexOf('<section', galleryMarker);
  const galleryEnd = index.indexOf('</section>', galleryMarker) + '</section>'.length;
  const gallery = index.slice(galleryStart, galleryEnd);
  const mobileShellStart = gallery.indexOf('<div class="gallery-mobile-shell">');
  const mobileShell = gallery.slice(mobileShellStart);
  assert.equal((mobileShell.match(/assets\/new%20products\/buy1take1\.png/g) || []).length, 2, 'Mobile gallery should include buy1take1 only once as a slide and once as its thumbnail.');
}
assert.equal((index.match(/data-faq/g) || []).length, 13, 'Jiyu FAQ item count must stay intact.');
assert.equal((index.match(/data-accordion/g) || []).length, 4, 'Jiyu product accordion count must stay intact.');
assert.equal((index.match(/class="result-slide/g) || []).length, 4, 'Jiyu result carousel count must stay intact.');

assert(index.includes('assets/new%20products/buy1.png'), 'Landing page must use the new Lulabite product imagery.');
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

assert(routes.includes("buy1: 'https://bettermornings.silmea.com/lullabbitesbuy1'"), 'Checkout route map must use the final Buy 1 checkout link.');
assert(!/var checkoutUrls\s*=\s*\{/.test(script), 'Script must use the shared checkout route map instead of inline checkout URLs.');
assert(script.includes("buy1Get1: 'buy1Get1'"), 'Bundle alias logic must remain intact.');

htmlPages.forEach(([file, page]) => {
  assert(!page.includes('assets/lulabite-logo.svg'), `${file} must not use the generated SVG logo.`);
  assert(!page.includes('lulabite-logo.svg'), `${file} must not reference any non-approved logo asset.`);
});

const oldLocalProductImagePattern = /assets\/lulabite-product\.svg|scraped\/69a6e16973a20246b1c7154c\.png|scraped\/69a6e1356dca2075b2fbba4d\.png|scraped\/69a6e137feee5259462a31e7\.png/g;
htmlPages.forEach(([file, page]) => {
  assert.equal((page.match(oldLocalProductImagePattern) || []).length, 0, `${file} must not reference old local product images.`);
});

const rootLogoMatches = index.match(/src="assets\/logo\.webp"/g) || [];
assert(rootLogoMatches.length >= 3, 'Landing page must use assets/logo.webp in header, mobile menu, and footer.');

[
  'index.html',
  'ghl.html',
  'ghl-ready.html',
  'thankyou.html'
].forEach((file) => {
  const page = read(file);
  assert(!/<span class="announcement-text">\s*<img\b/i.test(page), `${file} announcement bar must not show a logo image.`);
});

assert(index.includes('class="jar-options-section"'), 'Product selector must use the Jiyu jar options section structure.');
assert(index.includes('class="jar-option selected"'), 'Product selector must keep the Jiyu selected jar option state.');
assert(index.includes('class="jar-badge most-popular"'), 'Product selector must keep the Jiyu most popular badge.');
assert(index.includes('class="jar-badge best-deal"'), 'Product selector must keep the Jiyu best deal badge.');
assert(!index.includes('bottle-option'), 'Product selector must not use the old Lulabite bottle option structure.');

const selectorImageMap = {
  buy1: 'assets/new%20products/buy1.png',
  buy1Get1: 'assets/new%20products/buy1take1.png',
  buy2Get2: 'assets/new%20products/buy2%20get2.png'
};

htmlPages
  .filter(([, page]) => page.includes('id="jar-options"'))
  .forEach(([file, page]) => {
    Object.values(selectorImageMap).forEach((imagePath) => {
      assert(page.includes(imagePath), `${file} product selector must use ${imagePath}.`);
    });
  });

const ingredientImagePaths = [
  'assets/ingredients/Valerian_root_fibers_and_textures_202605070331.jpeg',
  'assets/ingredients/Griffonia_simplicifolia_seeds_te%E2%80%A6_202605070329.jpeg',
  'assets/ingredients/Passionflower_petals_and_leaves_202605070330.jpeg',
  'assets/ingredients/Magnesium_mineral_crystals_powde%E2%80%A6_202605070330.jpeg',
  'assets/ingredients/L-theanine_liquid_textures_ripples_202605070330.jpeg',
  'assets/ingredients/White_silk_texture_flowing_curves_202605070330.jpeg',
  'assets/ingredients/Strawberry_gummies_with_strawber%E2%80%A6_202605070330.jpeg'
];

htmlPages
  .filter(([, page]) => page.includes('id="clinical-ingredients"'))
  .forEach(([file, page]) => {
    const ingredientSources = [...page.matchAll(/<div class="ingredient-img"><img\s+src="([^"]+)"/g)].map((match) => match[1]);
    assert(ingredientSources.length >= 7, `${file} must keep the ingredient image cards.`);
    ingredientSources.forEach((src) => {
      assert(src.startsWith('assets/ingredients/'), `${file} ingredient image must use assets/ingredients, not ${src}.`);
    });
    ingredientImagePaths.forEach((imagePath) => {
      assert(page.includes(imagePath), `${file} ingredients must use ${imagePath}.`);
    });
  });

[
  'index.html',
  'ghl.html',
  'ghl-ready.html'
].forEach((file) => {
  const page = read(file);
  assert(page.includes('class="comp-hero-img"'), `${file} comparison table must keep the hero image.`);
  assert(page.includes('class="comp-product-img comp-product-img--other"'), `${file} comparison table must keep the other-product image.`);
  assert(
    page.includes('src="assets/reviews/Screenshot_2025-12-26_at_1.35.21_AM.jpg" alt="LullaBites review result" class="comp-hero-img"'),
    `${file} comparison hero image must use the selected review image.`
  );
  assert(
    page.includes('src="assets/new%20products/ChatGPT%20Image%20May%207,%202026,%2004_29_35%20AM.png" alt="Other sleep aids" class="comp-product-img comp-product-img--other"'),
    `${file} other sleep aids image must use the selected new product image.`
  );
});

assert(styles.includes('.product-reviews-line .review-count {\n  color: var(--brand-blue);'), 'Review count must use LullaBites brand blue.');
assert(styles.includes('.site-logo {\n  background: var(--brand-blue);'), 'Header logo link must use the main LullaBites brand color.');
assert(styles.includes('.footer-brand {\n  background: var(--brand-night);'), 'Footer logo link must provide a dark brand background.');
assert(styles.includes('.jar-option__card {\n  background: #e6f0ff;'), 'Product selector cards must use a branded blue background.');
assert(
  !/green|#2f6b4f|#4f8f68|#dfeee5|#173f2c|#3d7052|#0f7a46|#eff5dd|#dff0cf|#dff0bf|#d9f0b9|#e6f4d4|#0b6d38|#17412b|rgba\(20,\s*52,\s*34|rgba\(24,\s*52,\s*34|rgba\(14,\s*45,\s*28/i.test(styles),
  'Styles must not contain Jiyu green tokens, green hex colors, or green rgba colors.'
);
assert(styles.includes('.mobile-nav__brand {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--brand-blue);'), 'Mobile nav logo must sit on a LullaBites brand-blue background.');
assert(!styles.includes('background: #e6f4d4;'), 'Auto-refill selected state must not use the old green mobile background.');
assert(styles.includes('.auto-refill {\n  padding: 13px 16px;\n  margin-bottom: 14px;\n  background: #e6f0ff;'), 'Auto-refill base card must use branded blue background.');
assert(styles.includes('  .auto-refill {\n    padding: 14px 16px;\n    margin-bottom: 16px;\n    background: #e6f0ff;'), 'Mobile auto-refill card must use branded blue background.');

assert(!/<span class="video-thumb"[^>]*>\s*<img/i.test(index), 'Video thumbs must render videos instead of static images.');
assert.equal((index.match(/<video[^>]*\bautoplay\b/g) || []).length, 0, 'Video sections must follow Jiyu and not autoplay.');
assert.equal((index.match(/<video[^>]*\bmuted\b/g) || []).length, 0, 'Video sections must follow Jiyu and not be muted by default.');
assert((index.match(/<video preload="metadata" playsinline loop/g) || []).length >= 5, 'Landing page video sections must use Jiyu preload/playsinline/loop video settings.');

function socialSectionFor(page) {
  const marker = 'id="social-section"';
  const markerIndex = page.indexOf(marker);
  assert.notEqual(markerIndex, -1, 'Page must include #social-section before extracting it.');
  const start = page.lastIndexOf('<section', markerIndex);
  const end = page.indexOf('</section>', markerIndex) + '</section>'.length;
  return page.slice(start, end).replace(/\s+/g, ' ').trim();
}

const landingSocialSection = socialSectionFor(index);
[
  'about.html',
  'faq.html',
  'ghl.html',
  'ghl-ready.html'
].forEach((file) => {
  const socialSection = socialSectionFor(read(file));
  assert.equal(socialSection, landingSocialSection, `${file} #social-section must match the landing page video section.`);
});

const reviewImagePattern = /^assets\/reviews\//;
[
  'index.html',
  'ghl.html',
  'ghl-ready.html'
].forEach((file) => {
  const page = read(file);
  ['real-results', 'customer-reviews'].forEach((id) => {
    const section = socialSectionFor(page.replace(`id="${id}"`, 'id="social-section"'));
    const imageSources = [...section.matchAll(/<img[^>]+src="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((src) => src !== 'assets/icon-shield.svg');
    assert(imageSources.length > 0, `${file} #${id} must include review/result images.`);
    imageSources.forEach((src) => {
      assert(reviewImagePattern.test(src), `${file} #${id} image must use assets/reviews, not ${src}.`);
    });
  });
});

assert(!/assets\/icon-social\.svg/.test(index), 'Footer social links must not use the generic/broken social icon asset.');
assert(index.includes('social-icon--instagram'), 'Footer must include branded inline social icons.');

console.log('lulabite-clone.test.js passed');
