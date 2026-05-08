const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const reviewAssets = [
  'assets/reviews/lullabites-result-bedside-before.png',
  'assets/reviews/lullabites-result-bedside-after.png',
  'assets/reviews/lullabites-result-couch-before.png',
  'assets/reviews/lullabites-result-couch-after.png',
  'assets/reviews/lullabites-result-phone-before.png',
  'assets/reviews/lullabites-result-phone-after.png',
  'assets/reviews/lullabites-result-selfie-before.png',
  'assets/reviews/lullabites-result-selfie-after.png'
];
const resultPairs = [
  ['assets/reviews/lullabites-result-bedside-before.png', 'assets/reviews/lullabites-result-bedside-after.png'],
  ['assets/reviews/lullabites-result-couch-before.png', 'assets/reviews/lullabites-result-couch-after.png'],
  ['assets/reviews/lullabites-result-phone-before.png', 'assets/reviews/lullabites-result-phone-after.png'],
  ['assets/reviews/lullabites-result-selfie-before.png', 'assets/reviews/lullabites-result-selfie-after.png']
];
const reviewPages = [
  'index.html',
  'ghl.html',
  'ghl-ready.html'
];

function getResultSlide(page, slideIndex, file) {
  const slidePattern = new RegExp(
    `<article class="result-slide[^"]*" data-slide="${slideIndex}">([\\s\\S]*?)(?=<article class="result-slide|</div>\\s*</div>\\s*<button class="carousel-arrow|</div>\\s*</div>\\s*</section>)`
  );
  const match = page.match(slidePattern);

  assert(match, `${file} must contain result slide ${slideIndex}.`);

  return match[0];
}

reviewAssets.forEach((assetPath) => {
  assert(
    fs.existsSync(path.join(root, assetPath)),
    `${assetPath} must exist in the review asset folder.`
  );
});

reviewPages.forEach((file) => {
  const page = fs.readFileSync(path.join(root, file), 'utf8');
  const hasReviewSection = page.includes('id="real-results"') || page.includes('id="customer-reviews"');

  assert(hasReviewSection, `${file} must contain a review/results section.`);

  reviewAssets.forEach((assetPath) => {
    assert(
      page.includes(assetPath),
      `${file} must reference ${assetPath} in its review/results imagery.`
    );
  });

  assert(
    /src="assets\/reviews\/lullabites-result-bedside-after\.png"[^>]+class="comp-hero-img"|class="comp-hero-img"[^>]+src="assets\/reviews\/lullabites-result-bedside-after\.png"/.test(page),
    `${file} must use the refreshed girl selfie review photo in the comparison table hero image.`
  );

  resultPairs.forEach(([beforePath, afterPath], pairIndex) => {
    const slide = getResultSlide(page, pairIndex, file);

    assert(
      slide.includes(beforePath) && slide.includes(afterPath) && slide.indexOf(beforePath) < slide.indexOf(afterPath),
      `${file} must include result pair ${pairIndex + 1} in before/after order.`
    );
  });
});

console.log('review-photos.test.js passed');
