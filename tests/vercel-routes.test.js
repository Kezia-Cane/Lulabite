const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

assert.equal(config.cleanUrls, true, 'Vercel must serve extensionless HTML routes.');
assert.equal(config.trailingSlash, false, 'Vercel routes must stay slashless to match internal hrefs.');
assert(Array.isArray(config.rewrites), 'vercel.json must define route rewrites.');

const rewriteSources = new Set(config.rewrites.map((rewrite) => rewrite.source));
const rewriteDestinations = new Map(config.rewrites.map((rewrite) => [rewrite.source, rewrite.destination]));

[
  ['/about', '/about.html'],
  ['/faq', '/faq.html'],
  ['/checkout', '/checkout.html'],
  ['/thankyou', '/thankyou.html'],
  ['/shipping-policy', '/shipping-policy.html'],
  ['/refund-return-policy', '/refund-return-policy.html'],
  ['/privacy-policy', '/privacy-policy.html'],
  ['/terms-of-service', '/terms-of-service.html'],
  ['/contact', '/contact.html']
].forEach(([source, destination]) => {
  assert.equal(rewriteDestinations.get(source), destination, `${source} must rewrite to ${destination}.`);
});

[
  ['/shipping', '/shipping-policy.html'],
  ['/refund', '/refund-return-policy.html'],
  ['/privacy', '/privacy-policy.html'],
  ['/terms', '/terms-of-service.html']
].forEach(([source, destination]) => {
  assert.equal(rewriteDestinations.get(source), destination, `${source} must remain as a backwards-compatible alias.`);
});

const publishedHtmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html'))
  .filter((file) => !file.includes('-shopify'))
  .filter((file) => !file.includes('-live'))
  .filter((file) => !['about-rendered.html', 'reference-source.html', 'ghl.html', 'ghl-ready.html'].includes(file))
  .sort();

const localAbsoluteHrefPattern = /\bhref=(["'])\/([^"']*)\1/g;

publishedHtmlFiles.forEach((file) => {
  const page = fs.readFileSync(path.join(root, file), 'utf8');
  const hrefs = [...page.matchAll(localAbsoluteHrefPattern)].map((match) => '/' + match[2]);

  assert(
    !/\bhref=(["'])\/(?:shipping|refund|privacy|terms)\1/.test(page),
    `${file} must link directly to canonical policy slugs instead of short aliases.`
  );

  hrefs.forEach((href) => {
    const pathname = href.split(/[?#]/)[0];

    if (pathname === '/' || href.startsWith('/#')) {
      return;
    }

    assert(
      rewriteSources.has(pathname),
      `${file} links to ${href}, but ${pathname} is not covered by vercel.json.`
    );
  });
});

console.log('vercel-routes.test.js passed');
