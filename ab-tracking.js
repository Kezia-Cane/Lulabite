(function (globalScope) {
  function normalizeVariant(rawVariant) {
    if (typeof rawVariant !== 'string') {
      return 'A';
    }

    var normalized = rawVariant.trim().toUpperCase();
    return normalized || 'A';
  }

  function buildTrackingPayload(options) {
    return {
      event: options.event,
      test_key: options.testKey,
      variant: normalizeVariant(options.variant),
      page_path: options.pagePath,
      page_url: options.pageUrl,
      timestamp: options.timestamp || 'NOW'
    };
  }

  function createAbTracker(config) {
    var endpoint = config.endpoint;
    var fetchImpl = config.fetchImpl || (globalScope.fetch ? globalScope.fetch.bind(globalScope) : null);
    var locationRef = config.location || globalScope.location || { pathname: '/', href: '' };
    var navigatorRef = config.navigator || globalScope.navigator || null;
    var storageRef = config.storage || globalScope.localStorage || null;
    var storageKey = config.storageKey || 'ab_variant';

    function getVariant() {
      if (config.variant) {
        return normalizeVariant(config.variant);
      }

      try {
        return normalizeVariant(storageRef && storageRef.getItem(storageKey));
      } catch (error) {
        return 'A';
      }
    }

    function send(payload) {
      var body = JSON.stringify(payload);

      if (navigatorRef && typeof navigatorRef.sendBeacon === 'function') {
        try {
          var blob = new Blob([body], { type: 'application/json' });
          if (navigatorRef.sendBeacon(endpoint, blob)) {
            return Promise.resolve({ queued: true });
          }
        } catch (error) {
          // Fall through to fetch keepalive below.
        }
      }

      if (!fetchImpl) {
        return Promise.resolve({ queued: false });
      }

      return fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body,
        keepalive: true
      }).catch(function () {
        return { queued: false };
      });
    }

    function track(eventName, extra) {
      if (!endpoint || !config.testKey) {
        return Promise.resolve({ queued: false });
      }

      var payload = buildTrackingPayload({
        event: eventName,
        testKey: config.testKey,
        variant: extra && extra.variant ? extra.variant : getVariant(),
        pagePath: extra && extra.pagePath ? extra.pagePath : locationRef.pathname,
        pageUrl: extra && extra.pageUrl ? extra.pageUrl : locationRef.href,
        timestamp: new Date().toISOString()
      });

      if (extra && extra.metadata) {
        payload.metadata = extra.metadata;
      }

      return send(payload);
    }

    return {
      buildTrackingPayload: buildTrackingPayload,
      getVariant: getVariant,
      track: track
    };
  }

  var api = {
    buildTrackingPayload: buildTrackingPayload,
    createAbTracker: createAbTracker,
    normalizeVariant: normalizeVariant
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.LulabitesAbTracking = api;
})(typeof window !== 'undefined' ? window : globalThis);
