/**
 * HTGAA Week 2 — Media Loader
 * Loads real CC-licensed images from Wikimedia Commons into topic pages.
 * Replaces image placeholders and inserts figures near relevant content.
 */

let mediaData = null;

async function loadMediaData() {
  if (mediaData) return mediaData;
  try {
    const resp = await fetch('./data/media.json');
    mediaData = await resp.json();
    return mediaData;
  } catch (err) {
    console.warn('Media data not available:', err.message);
    return null;
  }
}

/** Insert real images into a topic page container */
export async function initMediaImages(container, topicId) {
  const data = await loadMediaData();
  if (!data || !data.images || !data.images[topicId]) return;

  const images = data.images[topicId];
  const isDark = document.documentElement.classList.contains('dark');
  let insertedCount = 0;
  const maxImages = 4; // Don't overwhelm with too many images

  // First: replace any image-placeholder divs
  const placeholders = container.querySelectorAll('.image-placeholder');
  placeholders.forEach(ph => {
    if (insertedCount >= maxImages) return;
    const caption = ph.querySelector('.placeholder-caption')?.textContent.toLowerCase() || '';

    // Find best matching image
    const match = findBestMatch(images, caption);
    if (match) {
      const figure = createFigure(match, isDark);
      ph.replaceWith(figure);
      insertedCount++;
      images.splice(images.indexOf(match), 1); // Remove used image
    }
  });

  // Second: insert remaining images near relevant h3/h4 headers
  if (insertedCount < maxImages && images.length > 0) {
    const headers = container.querySelectorAll('h3, h4');
    headers.forEach(h => {
      if (insertedCount >= maxImages || images.length === 0) return;

      const headerText = h.textContent.toLowerCase();
      // Check next paragraph too
      const nextP = h.nextElementSibling;
      const sectionText = headerText + ' ' + (nextP?.textContent?.toLowerCase() || '');

      const match = findBestMatch(images, sectionText);
      if (match) {
        // Insert after the first paragraph following this header
        const insertAfter = nextP || h;
        // Don't insert if there's already an image or diagram nearby
        const next = insertAfter.nextElementSibling;
        if (next && (next.tagName === 'FIGURE' || next.classList?.contains('inline-diagram') || next.classList?.contains('image-placeholder'))) return;

        const figure = createFigure(match, isDark);
        insertAfter.after(figure);
        insertedCount++;
        images.splice(images.indexOf(match), 1);
      }
    });
  }
}

function findBestMatch(images, text) {
  let bestMatch = null;
  let bestScore = 0;

  for (const img of images) {
    let score = 0;
    for (const kw of img.keywords) {
      if (text.includes(kw.toLowerCase())) {
        score += kw.length; // Longer keyword matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = img;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}

function createFigure(img, isDark) {
  const figure = document.createElement('figure');
  figure.className = 'media-figure my-6 rounded-xl overflow-hidden border transition-shadow hover:shadow-lg ' +
    (isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-white');

  figure.innerHTML = `
    <div class="relative overflow-hidden" style="max-height: 360px;">
      <img src="${img.thumb}" alt="${img.caption}" loading="lazy"
        class="w-full object-contain" style="max-height: 360px;"
        onerror="this.closest('figure').style.display='none'">
    </div>
    <figcaption class="px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}">
      <p class="leading-relaxed">${img.caption}</p>
      <p class="mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}">
        Credit: ${img.credit} · ${img.license} ·
        <a href="${img.url}" target="_blank" rel="noopener" class="hover:text-blue-500 underline">Wikimedia Commons</a>
      </p>
    </figcaption>
  `;

  return figure;
}
