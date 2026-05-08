const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  CHECKOUT_URLS,
  resolveCheckoutUrl
} = require('../checkout-routes.js');

const cases = [
  ['oneTime', 'buy1', 'https://bettermornings.silmea.com/lullabbitesbuy1'],
  ['oneTime', 'buy1Get1', 'https://bettermornings.silmea.com/lullabbitesbuy1getfree'],
  ['oneTime', 'buy2Get2', 'https://bettermornings.silmea.com/lullabitesbuy2get2free'],
  ['subscription', 'buy1', 'https://bettermornings.silmea.com/lullabitesbuy1save30monthlydelivery'],
  ['subscription', 'buy1Get1', 'https://bettermornings.silmea.com/lullabitesbuy1get1freesave30monthlydelivery'],
  ['subscription', 'buy2Get2', 'https://bettermornings.silmea.com/lullabitesbuy2get2freesave30monthlydelivery'],
  ['one_time', 'buy1get1free', 'https://bettermornings.silmea.com/lullabbitesbuy1getfree'],
  ['subscription', 'buy2get2free', 'https://bettermornings.silmea.com/lullabitesbuy2get2freesave30monthlydelivery']
];

assert.equal(typeof CHECKOUT_URLS, 'object');
assert.equal(typeof resolveCheckoutUrl, 'function');

cases.forEach(function ([purchaseType, bundleKey, expectedUrl]) {
  assert.equal(
    resolveCheckoutUrl(purchaseType, bundleKey),
    expectedUrl,
    'Expected ' + purchaseType + ' / ' + bundleKey + ' to resolve to the correct checkout URL.'
  );
});

assert.equal(
  resolveCheckoutUrl('unknown', 'buy1get1free'),
  CHECKOUT_URLS.oneTime.buy1Get1,
  'Unknown purchase types should fall back to one-time routes.'
);

assert.equal(
  resolveCheckoutUrl('subscription', 'unknown'),
  CHECKOUT_URLS.subscription.buy1,
  'Unknown bundle keys should fall back to the Buy 1 route for the current purchase type.'
);

const script = fs.readFileSync(path.resolve(__dirname, '..', 'script.js'), 'utf8');

assert(script.includes('function getPurchaseType()'), 'Add to Cart routing must read the current purchase type.');
assert(script.includes('function getSelectedBundleKey()'), 'Add to Cart routing must read the current selected bundle.');
assert(script.includes('checkoutRoutes.resolveCheckoutUrl(purchaseType, bundleKey)'), 'Add to Cart routing must resolve through the shared checkout map.');
assert(script.includes('window.location.href = getCheckoutUrl();'), 'Add to Cart must redirect to the URL for the current selection.');

console.log('checkout-routes.test.js passed');
