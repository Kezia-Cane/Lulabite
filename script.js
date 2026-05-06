document.addEventListener('DOMContentLoaded', function () {
  var galleryTrack = document.getElementById('gallery-mobile-track');
  var gallerySlides = Array.from(document.querySelectorAll('.gallery-slide'));
  var galleryThumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
  var galleryCurrentIndex = document.getElementById('gallery-current-index');
  var galleryMainImg = document.getElementById('gallery-main-img');
  var desktopVariantMedia = document.getElementById('desktop-variant-media');
  var galleryPrev = document.getElementById('gallery-prev');
  var galleryNext = document.getElementById('gallery-next');
  var headerMenu = document.querySelector('.header-menu');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileNavCloseControls = Array.from(document.querySelectorAll('[data-mobile-nav-close]'));
  var mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav a'));

  var jarOptions = Array.from(document.querySelectorAll('.jar-option'));
  var autoRefillToggle = document.getElementById('auto-refill-toggle');
  var autoRefillTitle = document.getElementById('auto-refill-title');
  var autoRefillSub = document.querySelector('.auto-refill__sub');

  var addToCartBtn = document.getElementById('add-to-cart');
  var checkoutCtas = Array.from(document.querySelectorAll('[data-checkout-cta]'));
  var checkoutUrls = {
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

  var accordionItems = document.querySelectorAll('[data-accordion]');
  var faqItems = document.querySelectorAll('[data-faq]');
  var seeAllBtn = document.getElementById('see-all-btn');
  var modal = document.getElementById('ingredients-modal');
  var modalClose = document.getElementById('modal-close');

  var resultsSlides = Array.from(document.querySelectorAll('.result-slide'));
  var avatarBtns = Array.from(document.querySelectorAll('.avatar-btn'));
  var dotsContainer = document.getElementById('carousel-dots');
  var dots = Array.from(dotsContainer ? dotsContainer.querySelectorAll('.dot') : []);
  var prevBtn = document.getElementById('results-prev');
  var nextBtn = document.getElementById('results-next');
  var resultsViewport = document.querySelector('.results-viewport');
  var benefitStrip = document.getElementById('benefit-strip');

  var videoThumbs = Array.from(document.querySelectorAll('.video-thumb, .media-play-tile'));
  var ingredientsRow = document.getElementById('ingredients-row');
  var ingredientsPrev = document.getElementById('ingredients-prev');
  var ingredientsNext = document.getElementById('ingredients-next');

  var selectedOption = jarOptions.find(function (option) {
    return option.classList.contains('selected');
  }) || jarOptions[0];
  var jarToBundle = {
    '1': 'buy1',
    '2': 'buy1Get1',
    '3': 'buy2Get2'
  };
  var bundleAliases = {
    buy1: 'buy1',
    buy1Get1: 'buy1Get1',
    buy1get1free: 'buy1Get1',
    buy2Get2: 'buy2Get2',
    buy2get2free: 'buy2Get2'
  };

  if (addToCartBtn && checkoutCtas.indexOf(addToCartBtn) === -1) {
    checkoutCtas.push(addToCartBtn);
  }

  function formatPrice(value) {
    var amount = Number(value);

    if (!isFinite(amount)) {
      return '';
    }

    return '$' + amount.toFixed(2);
  }

  function getPurchaseType() {
    return autoRefillToggle && autoRefillToggle.checked ? 'subscription' : 'oneTime';
  }

  function getSelectedBundleKey() {
    var currentSelectedOption = jarOptions.find(function (option) {
      return option.classList.contains('selected');
    }) || selectedOption;

    if (!currentSelectedOption) {
      return 'buy1';
    }

    var rawBundleKey = currentSelectedOption.dataset.option || currentSelectedOption.dataset.bundle || jarToBundle[currentSelectedOption.dataset.jar];

    return bundleAliases[rawBundleKey] || 'buy1';
  }

  function getCheckoutUrl() {
    var purchaseType = getPurchaseType();
    var bundleKey = getSelectedBundleKey();

    return checkoutUrls[purchaseType][bundleKey];
  }

  function syncCheckoutCtas() {
    var purchaseType = getPurchaseType();
    var bundleKey = getSelectedBundleKey();
    var checkoutUrl = getCheckoutUrl();

    checkoutCtas.forEach(function (cta) {
      cta.dataset.checkoutUrl = checkoutUrl;
      cta.dataset.purchaseType = purchaseType;
      cta.dataset.bundle = bundleKey;
      cta.dataset.option = bundleKey;

      if (cta.tagName && cta.tagName.toLowerCase() === 'a') {
        cta.href = checkoutUrl;
      }
    });
  }

  function openMobileNav() {
    if (!mobileNav) {
      return;
    }

    mobileNav.hidden = false;
    document.body.classList.add('mobile-nav-open');

    if (headerMenu) {
      headerMenu.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileNav() {
    if (!mobileNav) {
      return;
    }

    mobileNav.hidden = true;
    document.body.classList.remove('mobile-nav-open');

    if (headerMenu) {
      headerMenu.setAttribute('aria-expanded', 'false');
    }
  }

  function getInitialGalleryIndex() {
    var isMobileViewport = window.matchMedia
      ? window.matchMedia('(max-width: 1024px)').matches
      : window.innerWidth <= 1024;

    if (!isMobileViewport) {
      return 0;
    }

    var mobileStartSlide = document.querySelector('.gallery-slide[data-gallery-role="mobile-default"]');

    if (!mobileStartSlide) {
      return 0;
    }

    var explicitIndex = Number(mobileStartSlide.dataset.index);

    if (isFinite(explicitIndex)) {
      return explicitIndex;
    }

    return Math.max(0, gallerySlides.indexOf(mobileStartSlide));
  }

  function getVariantGalleryIndex() {
    var variantSlide = document.querySelector('.gallery-slide[data-gallery-role="variant"]');

    if (!variantSlide) {
      return 0;
    }

    var explicitIndex = Number(variantSlide.dataset.index);

    if (isFinite(explicitIndex)) {
      return explicitIndex;
    }

    return Math.max(0, gallerySlides.indexOf(variantSlide));
  }

  function getGallerySlideLeft(index) {
    if (!gallerySlides.length) {
      return 0;
    }

    var safeIndex = Math.max(0, Math.min(index, gallerySlides.length - 1));
    var firstOffset = gallerySlides[0] ? gallerySlides[0].offsetLeft : 0;
    var targetSlide = gallerySlides[safeIndex];

    if (!targetSlide) {
      return 0;
    }

    return Math.max(0, targetSlide.offsetLeft - firstOffset);
  }

  function getClosestGalleryIndex() {
    if (!galleryTrack || !gallerySlides.length) {
      return 0;
    }

    var currentLeft = galleryTrack.scrollLeft;
    var closestIndex = 0;
    var closestDistance = Infinity;

    gallerySlides.forEach(function (slide, slideIndex) {
      var distance = Math.abs(currentLeft - getGallerySlideLeft(slideIndex));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = slideIndex;
      }
    });

    return closestIndex;
  }

  function updateGalleryUI(index) {
    if (!gallerySlides.length || !galleryThumbs.length) {
      return;
    }

    gallerySlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    galleryThumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('active', thumbIndex === index);
      thumb.setAttribute('aria-current', thumbIndex === index ? 'true' : 'false');
    });

    if (galleryCurrentIndex) {
      galleryCurrentIndex.textContent = String(index + 1);
    }
  }

  function goToGalleryIndex(index, behavior) {
    if (!galleryTrack || !gallerySlides.length) {
      return;
    }

    var safeIndex = Math.max(0, Math.min(index, gallerySlides.length - 1));

    galleryTrack.scrollTo({
      left: getGallerySlideLeft(safeIndex),
      behavior: behavior || 'smooth'
    });

    updateGalleryUI(safeIndex);
  }

  function syncGalleryFromScroll() {
    if (!galleryTrack || !gallerySlides.length) {
      return;
    }

    updateGalleryUI(getClosestGalleryIndex());
  }

  function updateVariantMedia(imageSrc) {
    if (desktopVariantMedia) {
      desktopVariantMedia.src = imageSrc;
    }

    var variantSlide = document.querySelector('.gallery-slide[data-gallery-role="variant"] img');
    var variantThumb = document.querySelector('.gallery-thumb[data-gallery-role="variant"] img');

    if (galleryMainImg) {
      galleryMainImg.src = imageSrc;
    }

    if (variantSlide) {
      variantSlide.src = imageSrc;
    }

    if (variantThumb) {
      variantThumb.src = imageSrc;
    }
  }

  function renderJarPricing() {
    var useSubscription = autoRefillToggle ? autoRefillToggle.checked : true;

    jarOptions.forEach(function (option) {
      var current = option.querySelector('.price-current');
      var compare = option.querySelector('.price-compare');
      var daily = option.querySelector('.price-daily');
      var price = useSubscription ? option.dataset.subscription : option.dataset.regular;
      var comparePrice = useSubscription ? option.dataset.subscriptionCompare : option.dataset.regularCompare;
      var dailyPrice = useSubscription
        ? (option.dataset.subscriptionDaily || option.dataset.daily)
        : (option.dataset.regularDaily || option.dataset.daily);

      if (current) {
        current.textContent = formatPrice(price);
      }

      if (compare) {
        if (comparePrice) {
          compare.textContent = formatPrice(comparePrice);
          compare.style.display = 'inline-block';
        } else {
          compare.textContent = '';
          compare.style.display = 'none';
        }
      }

      if (daily) {
        if (dailyPrice && formatPrice(dailyPrice)) {
          daily.textContent = formatPrice(dailyPrice) + ' per day';
          daily.style.display = 'block';
        } else {
          daily.textContent = '';
          daily.style.display = 'none';
        }
      }
    });

    if (autoRefillTitle) {
      autoRefillTitle.textContent = useSubscription ? 'Save 20% with Monthly Delivery' : 'One-Time Purchase';
    }

    if (autoRefillSub) {
      autoRefillSub.textContent = useSubscription ? 'Cancel Anytime \u2013 No Commitment' : 'No automatic refills';
    }

    if (selectedOption) {
      updateVariantMedia(selectedOption.dataset.image);
    }

    syncCheckoutCtas();
  }

  function setSelectedOption(option) {
    selectedOption = option;

    jarOptions.forEach(function (item) {
      var isSelected = item === option;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    renderJarPricing();
    goToGalleryIndex(getVariantGalleryIndex(), 'smooth');
  }

  jarOptions.forEach(function (option) {
    option.setAttribute('aria-pressed', option.classList.contains('selected') ? 'true' : 'false');
    option.addEventListener('click', function () {
      setSelectedOption(option);
    });
  });

  if (autoRefillToggle) {
    autoRefillToggle.addEventListener('change', renderJarPricing);
  }

  renderJarPricing();

  if (headerMenu && mobileNav) {
    headerMenu.addEventListener('click', function () {
      if (mobileNav.hidden) {
        openMobileNav();
      } else {
        closeMobileNav();
      }
    });
  }

  mobileNavCloseControls.forEach(function (control) {
    control.addEventListener('click', closeMobileNav);
  });

  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  if (galleryTrack) {
    galleryTrack.addEventListener('scroll', syncGalleryFromScroll, { passive: true });
  }

  galleryThumbs.forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      goToGalleryIndex(Number(thumb.dataset.index), 'smooth');
    });
  });

  if (galleryPrev) {
    galleryPrev.addEventListener('click', function () {
      var activeIndex = gallerySlides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
      });
      goToGalleryIndex(Math.max(0, activeIndex - 1), 'smooth');
    });
  }

  if (galleryNext) {
    galleryNext.addEventListener('click', function () {
      var activeIndex = gallerySlides.findIndex(function (slide) {
        return slide.classList.contains('is-active');
      });
      goToGalleryIndex(Math.min(gallerySlides.length - 1, activeIndex + 1), 'smooth');
    });
  }

  window.addEventListener('resize', function () {
    syncGalleryFromScroll();

    if (window.innerWidth > 1024) {
      closeMobileNav();
    }
  });

  var initialGalleryIndex = getInitialGalleryIndex();
  updateGalleryUI(initialGalleryIndex);
  window.setTimeout(function () {
    goToGalleryIndex(initialGalleryIndex, 'auto');
  }, 180);

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function (event) {
      if (addToCartBtn.disabled) {
        return;
      }

      event.preventDefault();
      syncCheckoutCtas();
      window.location.href = getCheckoutUrl();
    });
  }

  accordionItems.forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    var body = item.querySelector('.accordion-body');
    var icon = item.querySelector('.accordion-icon');

    if (!header || !body) {
      return;
    }

    header.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      item.classList.toggle('open', !isOpen);
      body.style.display = isOpen ? 'none' : 'block';
      header.setAttribute('aria-expanded', isOpen ? 'false' : 'true');

      if (icon) {
        icon.textContent = isOpen ? '+' : '\u2212';
      }
    });
  });

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    if (!question || !answer) {
      return;
    }

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      answer.style.display = isOpen ? 'none' : 'block';
    });
  });

  if (seeAllBtn && modal) {
    seeAllBtn.addEventListener('click', function () {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  }

  if (modalClose && modal) {
    modalClose.addEventListener('click', function () {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMobileNav();
    }

    if (event.key === 'Escape' && modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  function getResultsCardsPerPage() {
    if (window.innerWidth <= 768) {
      return 1;
    }

    return 2;
  }

  function getResultsMaxPage() {
    return Math.max(0, resultsSlides.length - getResultsCardsPerPage());
  }

  function syncResultDots() {
    if (!dotsContainer) {
      return;
    }

    var requiredDots = getResultsMaxPage() + 1;
    var dotMarkup = '';
    var dotIndex = 0;

    for (dotIndex = 0; dotIndex < requiredDots; dotIndex += 1) {
      dotMarkup += '<span class="dot' + (dotIndex === 0 ? ' active' : '') + '" data-dot="' + dotIndex + '"></span>';
    }

    dotsContainer.innerHTML = dotMarkup;
    dots = Array.from(dotsContainer.querySelectorAll('.dot'));
  }

  function setActiveResultAvatar(index) {
    avatarBtns.forEach(function (btn, btnIndex) {
      btn.classList.toggle('active', btnIndex === index);
    });
  }

  function setActiveResultDot(index) {
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  function showResultSlide(index, activeAvatarIndex) {
    if (!resultsSlides.length || !resultsViewport) {
      return 0;
    }

    var safePage = Math.max(0, Math.min(index, getResultsMaxPage()));
    var slidesTrack = document.getElementById('results-slides');
    var targetSlide = resultsSlides[safePage];
    var maxTranslate = Math.max(0, slidesTrack.scrollWidth - resultsViewport.clientWidth);
    var translateX = targetSlide ? Math.min(targetSlide.offsetLeft, maxTranslate) : 0;

    slidesTrack.style.transform = 'translateX(-' + translateX + 'px)';

    resultsSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === (activeAvatarIndex != null ? activeAvatarIndex : safePage));
    });

    setActiveResultAvatar(activeAvatarIndex != null ? activeAvatarIndex : safePage);
    setActiveResultDot(safePage);

    return safePage;
  }

  var currentResultSlide = 0;
  var currentActiveAvatar = 0;

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      currentResultSlide = currentResultSlide <= 0 ? getResultsMaxPage() : currentResultSlide - 1;
      currentActiveAvatar = currentResultSlide;
      showResultSlide(currentResultSlide, currentActiveAvatar);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentResultSlide = currentResultSlide >= getResultsMaxPage() ? 0 : currentResultSlide + 1;
      currentActiveAvatar = currentResultSlide;
      showResultSlide(currentResultSlide, currentActiveAvatar);
    });
  }

  avatarBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var avatarIndex = Number(btn.dataset.slide);
      currentActiveAvatar = avatarIndex;
      currentResultSlide = Math.min(avatarIndex, getResultsMaxPage());
      showResultSlide(currentResultSlide, currentActiveAvatar);
    });
  });

  if (dotsContainer) {
    dotsContainer.addEventListener('click', function (event) {
      var dot = event.target.closest('.dot');

      if (!dot) {
        return;
      }

      currentResultSlide = Number(dot.dataset.dot);
      currentActiveAvatar = Math.min(currentResultSlide, resultsSlides.length - 1);
      showResultSlide(currentResultSlide, currentActiveAvatar);
    });
  }

  var resultsAutoplay = window.setInterval(function () {
    currentResultSlide = currentResultSlide >= getResultsMaxPage() ? 0 : currentResultSlide + 1;
    currentActiveAvatar = currentResultSlide;
    showResultSlide(currentResultSlide, currentActiveAvatar);
  }, 6500);

  var resultsCarousel = document.getElementById('results-carousel');
  if (resultsCarousel) {
    resultsCarousel.addEventListener('mouseenter', function () {
      window.clearInterval(resultsAutoplay);
    });

    resultsCarousel.addEventListener('mouseleave', function () {
      window.clearInterval(resultsAutoplay);
      resultsAutoplay = window.setInterval(function () {
        currentResultSlide = currentResultSlide >= getResultsMaxPage() ? 0 : currentResultSlide + 1;
        currentActiveAvatar = currentResultSlide;
        showResultSlide(currentResultSlide, currentActiveAvatar);
      }, 6500);
    });
  }

  window.addEventListener('resize', function () {
    syncResultDots();
    currentResultSlide = Math.min(currentResultSlide, getResultsMaxPage());
    currentActiveAvatar = Math.min(currentActiveAvatar, resultsSlides.length - 1);
    showResultSlide(currentResultSlide, currentActiveAvatar);
  });

  syncResultDots();
  showResultSlide(0, 0);

  function initVideoCards(cards) {
    cards.forEach(function (thumb) {
      var video = thumb.querySelector('video');

      if (!video) {
        return;
      }

      thumb.addEventListener('click', function () {
        var isPlaying = !video.paused;

        cards.forEach(function (otherThumb) {
          var otherVideo = otherThumb.querySelector('video');
          if (otherVideo && otherVideo !== video) {
            otherVideo.pause();
            otherThumb.classList.remove('is-playing');
          }
        });

        if (isPlaying) {
          video.pause();
          thumb.classList.remove('is-playing');
        } else {
          video.removeAttribute('muted');
          video.muted = false;
          video.play().catch(function () {
            return null;
          });
          thumb.classList.add('is-playing');
        }
      });

      video.addEventListener('pause', function () {
        thumb.classList.remove('is-playing');
      });

      video.addEventListener('play', function () {
        thumb.classList.add('is-playing');
      });
    });
  }

  initVideoCards(videoThumbs);

  if (ingredientsRow) {
    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;

    function getIngredientsScrollAmount() {
      var firstCard = ingredientsRow.querySelector('.ingredient-card');
      var cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 168;
      return Math.max(cardWidth + 16, ingredientsRow.clientWidth * 0.72);
    }

    function updateIngredientsArrows() {
      var maxScroll = Math.max(0, ingredientsRow.scrollWidth - ingredientsRow.clientWidth - 2);

      if (ingredientsPrev) {
        ingredientsPrev.disabled = ingredientsRow.scrollLeft <= 2;
      }

      if (ingredientsNext) {
        ingredientsNext.disabled = ingredientsRow.scrollLeft >= maxScroll;
      }
    }

    function scrollIngredients(direction) {
      ingredientsRow.scrollBy({
        left: getIngredientsScrollAmount() * direction,
        behavior: 'smooth'
      });
    }

    if (ingredientsPrev) {
      ingredientsPrev.addEventListener('click', function () {
        scrollIngredients(-1);
      });
    }

    if (ingredientsNext) {
      ingredientsNext.addEventListener('click', function () {
        scrollIngredients(1);
      });
    }

    ingredientsRow.addEventListener('mousedown', function (event) {
      isDown = true;
      startX = event.pageX - ingredientsRow.offsetLeft;
      scrollLeft = ingredientsRow.scrollLeft;
      ingredientsRow.style.cursor = 'grabbing';
    });

    ingredientsRow.addEventListener('mouseleave', function () {
      isDown = false;
      ingredientsRow.style.cursor = '';
    });

    ingredientsRow.addEventListener('mouseup', function () {
      isDown = false;
      ingredientsRow.style.cursor = '';
    });

    ingredientsRow.addEventListener('mousemove', function (event) {
      if (!isDown) {
        return;
      }

      event.preventDefault();
      var x = event.pageX - ingredientsRow.offsetLeft;
      var walk = (x - startX) * 2;
      ingredientsRow.scrollLeft = scrollLeft - walk;
    });

    ingredientsRow.addEventListener('scroll', updateIngredientsArrows, { passive: true });
    window.addEventListener('resize', updateIngredientsArrows);
    window.requestAnimationFrame(updateIngredientsArrows);
  }

  if (benefitStrip) {
    var benefitStripHovered = false;
    var benefitStripInView = false;

    function syncBenefitStripState(isInView) {
      benefitStripInView = Boolean(isInView);
      benefitStrip.classList.toggle('is-animating', benefitStripInView && !benefitStripHovered);
      benefitStrip.classList.toggle('is-paused', benefitStripHovered);
      benefitStrip.dataset.inView = benefitStripInView ? 'true' : 'false';
    }

    function updateBenefitStripVisibility() {
      var rect = benefitStrip.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      var visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      var isInView = visibleHeight > Math.min(rect.height * 0.15, 80);

      syncBenefitStripState(isInView);
    }

    benefitStrip.addEventListener('mouseenter', function () {
      benefitStripHovered = true;
      syncBenefitStripState(benefitStripInView);
    });

    benefitStrip.addEventListener('mouseleave', function () {
      benefitStripHovered = false;
      syncBenefitStripState(benefitStripInView);
    });

    if ('IntersectionObserver' in window) {
      var benefitStripObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var isInView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          syncBenefitStripState(isInView);
        });
      }, {
        threshold: 0.15
      });

      benefitStripObserver.observe(benefitStrip);
    }

    window.addEventListener('scroll', updateBenefitStripVisibility, { passive: true });
    window.addEventListener('resize', updateBenefitStripVisibility);
    window.requestAnimationFrame(updateBenefitStripVisibility);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href');
      var target = null;

      if (!href || href === '#') {
        event.preventDefault();
        return;
      }

      try {
        target = document.querySelector(href);
      } catch (error) {
        target = null;
      }

      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
