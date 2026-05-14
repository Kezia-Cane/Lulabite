const assert = require('node:assert/strict');

const {
  buildTrackingPayload,
  normalizeVariant,
} = require('../ab-tracking.js');

assert.equal(normalizeVariant('b'), 'B');
assert.equal(normalizeVariant(''), 'A');
assert.equal(normalizeVariant(undefined), 'A');

assert.deepEqual(
  buildTrackingPayload({
    event: 'cta_click',
    testKey: 'lulabites_headline_v1',
    variant: 'a',
    pagePath: '/',
    pageUrl: 'https://sleepgummies.silmea.com/',
  }),
  {
    event: 'cta_click',
    test_key: 'lulabites_headline_v1',
    variant: 'A',
    page_path: '/',
    page_url: 'https://sleepgummies.silmea.com/',
    timestamp: 'NOW',
  },
  'Tracking payload should normalize variants and preserve the active page URL.',
);

console.log('ab-tracking.test.js passed');
