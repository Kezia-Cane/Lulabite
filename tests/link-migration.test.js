const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root)
  .filter((file) => file.endsWith('.html'))
  .sort();
const publishedHtmlFiles = htmlFiles
  .filter((file) => !file.includes('-shopify') && file !== 'reference-source.html');

const internalHtmlHrefPattern = /\bhref=(["'])(?!https?:\/\/|mailto:|tel:|#)([^"']*\.html(?:#[^"']*)?)\1/i;
const staleCheckoutPattern = /my\.felinebloom\.com|tonerpads|sleepgummiesbuy|sleepgummies\.silmea\.com\/(?:sleepgummiesbuy|lullabitesbuy)/i;
const oldMainDomainPattern = /www\.lullabites\.com/i;

htmlFiles.forEach((file) => {
  const page = fs.readFileSync(path.join(root, file), 'utf8');

  assert(
    !internalHtmlHrefPattern.test(page),
    `${file} must use clean internal route hrefs instead of .html paths.`
  );

  assert(
    !staleCheckoutPattern.test(page),
    `${file} must not contain stale checkout domains or old checkout slugs.`
  );
});

publishedHtmlFiles.forEach((file) => {
  const page = fs.readFileSync(path.join(root, file), 'utf8');

  assert(
    !oldMainDomainPattern.test(page),
    `${file} must not reference the old main domain.`
  );
});

const script = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

assert(
  !/var checkoutUrls\s*=\s*\{/.test(script),
  'script.js must use the shared checkout route map instead of an inline duplicate map.'
);

console.log('link-migration.test.js passed');
