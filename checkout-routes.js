(function (globalScope) {
  var CHECKOUT_URLS = {
    oneTime: {
      buy1: '#',
      buy1Get1: '#',
      buy2Get2: '#'
    },
    subscription: {
      buy1: '#',
      buy1Get1: '#',
      buy2Get2: '#'
    }
  };
  CHECKOUT_URLS.one_time = CHECKOUT_URLS.oneTime;

  var bundleAliases = {
    buy1: 'buy1',
    buy1Get1: 'buy1Get1',
    buy1get1free: 'buy1Get1',
    buy2Get2: 'buy2Get2',
    buy2get2free: 'buy2Get2'
  };

  function resolveCheckoutUrl(purchaseType, bundleKey) {
    var normalizedPurchaseType = purchaseType === 'one_time' ? 'oneTime' : purchaseType;
    normalizedPurchaseType = CHECKOUT_URLS[normalizedPurchaseType] ? normalizedPurchaseType : 'oneTime';
    var routesForType = CHECKOUT_URLS[normalizedPurchaseType];
    var normalizedBundleKey = bundleAliases[bundleKey] || 'buy1';

    return routesForType[normalizedBundleKey];
  }

  var api = {
    CHECKOUT_URLS: CHECKOUT_URLS,
    resolveCheckoutUrl: resolveCheckoutUrl
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (globalScope) {
    globalScope.LulabitesCheckoutRoutes = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
