const assert = require('node:assert/strict');

const {
  CHECKOUT_URLS,
  resolveCheckoutUrl
} = require('../checkout-routes.js');

const cases = [
  ['oneTime', 'buy1', '#'],
  ['oneTime', 'buy1Get1', '#'],
  ['oneTime', 'buy2Get2', '#'],
  ['subscription', 'buy1', '#'],
  ['subscription', 'buy1Get1', '#'],
  ['subscription', 'buy2Get2', '#'],
  ['one_time', 'buy1get1free', '#'],
  ['subscription', 'buy2get2free', '#']
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

console.log('checkout-routes.test.js passed');
