/**
 * HTGAA Week 2 — Content Enhancer
 * Post-processes rendered HTML content to add visual richness:
 * - Callout boxes for key insights
 * - Enhanced tables with hover/sort
 * - Stat badges for numbers
 * - Inline diagrams at strategic points
 * - Expandable deep-dive sections
 * - DNA sequence formatting
 * - Visual subsection dividers
 */

export function enhanceContent(container) {
  if (!container || container.dataset.enhanced) return;
  container.dataset.enhanced = 'true';

  enhanceDeepDiveBoxes(container);
  enhanceTryItPrompts(container);
  enhanceCallouts(container);
  enhanceTables(container);
  enhanceStatNumbers(container);
  enhanceSequences(container);
  enhanceSubsectionHeaders(container);
  insertInlineDiagrams(container);
  enhanceKeyTerms(container);
  enhanceMetricHighlights(container);
  enhanceCodeBlocks(container);
  insertPullQuotes(container);
  insertImagePlaceholders(container);
}

/** Detect deep-dive / advanced / behind-the-scenes paragraphs and wrap in expandable boxes */
function enhanceDeepDiveBoxes(container) {
  const patterns = [
    { regex: /^<strong>Deep dive[:\s]/i, icon: '\uD83D\uDD2C', label: 'Deep Dive', cls: 'deep-dive-box--microscope' },
    { regex: /^<strong>Advanced[:\s]/i, icon: '\u26A1', label: 'Advanced', cls: 'deep-dive-box--advanced' },
    { regex: /^<strong>Behind the scenes[:\s]/i, icon: '\uD83D\uDD27', label: 'Behind the Scenes', cls: 'deep-dive-box--behind' },
  ];

  container.querySelectorAll('p').forEach(p => {
    const html = p.innerHTML.trim();
    for (const pat of patterns) {
      if (pat.regex.test(html)) {
        // Collect this paragraph and any immediately following paragraphs/lists that are part of the deep dive
        const contentEls = [p];
        let next = p.nextElementSibling;
        while (next && (next.tagName === 'P' || next.tagName === 'UL' || next.tagName === 'OL') &&
               !patterns.some(pp => pp.regex.test(next.innerHTML?.trim() || '')) &&
               !/^<strong>(Key |Important|Remember|Note|Fun fact|Example|Pro tip|Try it|Think about it|Challenge)/i.test(next.innerHTML?.trim() || '')) {
          // Stop if next paragraph starts with another special marker
          if (next.tagName === 'P' && /^<strong>[A-Z]/.test(next.innerHTML?.trim() || '')) break;
          contentEls.push(next);
          next = next.nextElementSibling;
        }

        // Build the deep-dive box
        const box = document.createElement('div');
        box.className = `deep-dive-box ${pat.cls}`;

        const header = document.createElement('button');
        header.className = 'deep-dive-box__header';
        header.setAttribute('aria-expanded', 'false');
        header.innerHTML = `
          <span class="deep-dive-box__icon">${pat.icon}</span>
          <span class="deep-dive-box__title">${pat.label}</span>
          <span class="deep-dive-box__hint">Click to expand</span>
          <span class="deep-dive-box__chevron">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        `;

        const body = document.createElement('div');
        body.className = 'deep-dive-box__body';

        // Strip the "Deep dive:" prefix from the first paragraph
        const firstP = contentEls[0];
        firstP.innerHTML = firstP.innerHTML.replace(pat.regex, '').replace(/^<\/strong>\s*/, '');

        contentEls.forEach(el => body.appendChild(el.cloneNode(true)));

        box.appendChild(header);
        box.appendChild(body);

        // Replace the original elements
        contentEls[0].parentNode.insertBefore(box, contentEls[0]);
        contentEls.forEach(el => el.remove());

        // Toggle behavior
        header.addEventListener('click', () => {
          const isExpanded = box.classList.toggle('deep-dive-box--expanded');
          header.setAttribute('aria-expanded', String(isExpanded));
          if (isExpanded) {
            body.style.maxHeight = body.scrollHeight + 'px';
          } else {
            body.style.maxHeight = '0px';
          }
        });

        break;
      }
    }
  });
}

/** Detect try-it / think-about-it / challenge paragraphs and wrap in interactive prompt boxes */
function enhanceTryItPrompts(container) {
  const patterns = [
    { regex: /^<strong>Try it[:\s]/i, icon: '\u270F\uFE0F', label: 'Try It Yourself' },
    { regex: /^<strong>Think about it[:\s]/i, icon: '\uD83D\uDCA1', label: 'Think About It' },
    { regex: /^<strong>Challenge[:\s]/i, icon: '\uD83C\uDFC6', label: 'Challenge' },
  ];

  let promptCounter = 0;

  container.querySelectorAll('p').forEach(p => {
    const html = p.innerHTML.trim();
    for (const pat of patterns) {
      if (pat.regex.test(html)) {
        promptCounter++;
        const storageKey = `htgaa-tryit-${window.location.hash || 'page'}-${promptCounter}`;

        // Check if the next sibling is a hint paragraph (starts with <strong>Hint:</strong>)
        const nextEl = p.nextElementSibling;
        let hintHtml = null;
        let hintEl = null;
        if (nextEl && nextEl.tagName === 'P' && /^<strong>Hint[:\s]/i.test(nextEl.innerHTML.trim())) {
          hintHtml = nextEl.innerHTML.replace(/^<strong>Hint[:\s]*<\/strong>\s*/i, '');
          hintEl = nextEl;
        }

        // Strip the prefix from the prompt text
        const promptText = p.innerHTML.replace(pat.regex, '').replace(/^<\/strong>\s*/, '');

        // Build the try-it card
        const card = document.createElement('div');
        card.className = 'try-it-card';

        const savedNotes = localStorage.getItem(storageKey) || '';

        card.innerHTML = `
          <div class="try-it-card__header">
            <span class="try-it-card__icon">${pat.icon}</span>
            <span class="try-it-card__label">${pat.label}</span>
          </div>
          <div class="try-it-card__prompt">${promptText}</div>
          <div class="try-it-card__notes-area">
            <label class="try-it-card__notes-label" for="tryit-${promptCounter}">Your notes:</label>
            <textarea class="try-it-card__textarea" id="tryit-${promptCounter}" placeholder="Write your thoughts here..." rows="3">${savedNotes}</textarea>
          </div>
          ${hintHtml ? `
          <div class="try-it-card__hint-section">
            <button class="try-it-card__hint-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Reveal hint
            </button>
            <div class="try-it-card__hint-text hidden">${hintHtml}</div>
          </div>
          ` : ''}
        `;

        // Insert card and remove original elements
        p.parentNode.insertBefore(card, p);
        p.remove();
        if (hintEl) hintEl.remove();

        // Auto-save notes to localStorage
        const textarea = card.querySelector('.try-it-card__textarea');
        let saveTimeout;
        textarea.addEventListener('input', () => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
            localStorage.setItem(storageKey, textarea.value);
          }, 500);
        });

        // Hint reveal toggle
        const hintBtn = card.querySelector('.try-it-card__hint-btn');
        const hintText = card.querySelector('.try-it-card__hint-text');
        if (hintBtn && hintText) {
          hintBtn.addEventListener('click', () => {
            const showing = hintText.classList.toggle('hidden');
            hintBtn.textContent = showing ? 'Reveal hint' : 'Hide hint';
          });
        }

        break;
      }
    }
  });
}

/** Detect paragraphs with key phrases and wrap in styled callout boxes */
function enhanceCallouts(container) {
  const patterns = [
    { regex: /^<strong>Key (insight|concept|idea)[:\s]/i, cls: 'callout-insight', icon: '💡', label: 'Key Insight' },
    { regex: /^<strong>Important[:\s]/i, cls: 'callout callout-warning', icon: '⚠️', label: 'Important' },
    { regex: /^<strong>Remember[:\s]/i, cls: 'callout callout-tip', icon: '📌', label: 'Remember' },
    { regex: /^<strong>Note[:\s]/i, cls: 'callout callout-concept', icon: 'ℹ️', label: 'Note' },
    { regex: /^<strong>Fun fact[:\s]/i, cls: 'callout-fact', icon: '✨', label: 'Fun Fact' },
    { regex: /^<strong>Example[:\s]/i, cls: 'callout-example', icon: '🔬', label: 'Example' },
    { regex: /^<strong>Pro tip[:\s]/i, cls: 'callout callout-tip', icon: '💡', label: 'Pro Tip' },
  ];

  container.querySelectorAll('p').forEach(p => {
    const html = p.innerHTML.trim();
    for (const pat of patterns) {
      if (pat.regex.test(html)) {
        const wrapper = document.createElement('div');
        wrapper.className = pat.cls;
        wrapper.innerHTML = `<div class="flex items-start gap-2"><span class="text-lg flex-shrink-0 mt-0.5">${pat.icon}</span><div>${p.innerHTML}</div></div>`;
        p.replaceWith(wrapper);
        break;
      }
    }
  });
}

/** Enhance tables with hover states, responsive wrapping, and figure numbering */
function enhanceTables(container) {
  let figNum = 1;
  container.querySelectorAll('table').forEach(table => {
    if (table.closest('.enhanced-table')) return;

    // Wrap in responsive container
    const wrapper = document.createElement('div');
    wrapper.className = 'enhanced-table my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700';

    // Add figure caption
    const caption = document.createElement('div');
    caption.className = 'text-xs text-slate-400 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 font-medium';

    // Try to detect table topic from headers
    const firstHeader = table.querySelector('th');
    const headerText = firstHeader ? firstHeader.textContent.trim() : '';
    caption.textContent = `Table ${figNum++}${headerText ? ': ' + headerText + ' comparison' : ''}`;

    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(caption);
    wrapper.appendChild(table);

    // Add click-to-highlight rows
    table.querySelectorAll('tbody tr').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        table.querySelectorAll('tbody tr').forEach(r => r.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'));
        row.classList.toggle('bg-blue-50');
        row.classList.toggle('dark:bg-blue-900/20');
      });
    });

    // Make header columns sortable
    table.querySelectorAll('th').forEach((th, colIdx) => {
      th.style.cursor = 'pointer';
      th.title = 'Click to sort';
      th.addEventListener('click', () => {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isNumeric = rows.every(r => {
          const cell = r.cells[colIdx];
          return cell && !isNaN(parseFloat(cell.textContent.replace(/[^0-9.-]/g, '')));
        });

        const sorted = rows.sort((a, b) => {
          const aVal = a.cells[colIdx]?.textContent.trim() || '';
          const bVal = b.cells[colIdx]?.textContent.trim() || '';
          if (isNumeric) return parseFloat(bVal.replace(/[^0-9.-]/g, '')) - parseFloat(aVal.replace(/[^0-9.-]/g, ''));
          return aVal.localeCompare(bVal);
        });
        sorted.forEach(r => tbody.appendChild(r));
      });
    });
  });
}

/** Highlight important numbers with stat badges */
function enhanceStatNumbers(container) {
  // Find text nodes with numbers + units and wrap in stat badges
  const unitPatterns = [
    /(\d[\d,]*\.?\d*)\s*(%)/g,
    /(\d[\d,]*\.?\d*)\s*(bp|kb|Mb|Gb|nt|kDa|Da)/g,
    /(\$[\d,]+\.?\d*[MBK]?)/g,
    /(\d[\d,]*\.?\d*)\s*-fold/g,
    /(\d+)\s*(hours?|minutes?|seconds?|days?)/g,
  ];

  container.querySelectorAll('p, li, td').forEach(el => {
    // Only process text that's not already in a special element
    if (el.closest('.stat-badge, .callout, code, .enhanced-table caption, .inline-diagram, h2, h3, h4')) return;

    let html = el.innerHTML;
    let changed = false;

    // Bold + number pattern: <strong>99.5%</strong> or <strong>$200</strong>
    html = html.replace(/<strong>(\$?[\d,]+\.?\d*[%MBKbpkDa]*)<\/strong>/g, (match, num) => {
      changed = true;
      return `<span class="stat-badge">${num}</span>`;
    });

    // Only apply if we made a change
    if (changed) {
      el.innerHTML = html;
    }
  });
}

/** Format DNA/RNA sequences with color-coded bases */
function enhanceSequences(container) {
  container.querySelectorAll('code').forEach(code => {
    const text = code.textContent.trim();
    // Check if this looks like a DNA/RNA sequence (>6 chars, mostly ATGCU)
    if (text.length >= 6 && /^[ATGCUN\s-]+$/i.test(text)) {
      code.classList.add('dna-sequence');
      code.innerHTML = text.split('').map(base => {
        const b = base.toUpperCase();
        const cls = { A: 'base-a', T: 'base-t', G: 'base-g', C: 'base-c', U: 'base-t' }[b] || '';
        return cls ? `<span class="${cls}">${base}</span>` : base;
      }).join('');
    }
  });
}

/** Add decorative elements to h4 subsection headers */
function enhanceSubsectionHeaders(container) {
  let subIdx = 0;
  container.querySelectorAll('h4').forEach(h4 => {
    if (h4.dataset.enhanced) return;
    h4.dataset.enhanced = 'true';
    subIdx++;
  });
}

/** Insert inline SVG diagrams at strategic points based on content keywords */
function insertInlineDiagrams(container) {
  // Import diagrams module dynamically
  import('./diagrams.js').then(diagrams => {
    const sections = container.querySelectorAll('h4');

    // Map keywords to diagram functions
    const diagramMap = [
      { keywords: ['double helix', 'base pair', 'watson-crick', 'dna structure', 'nucleotide structure'], fn: 'svgDnaDoubleHelix' },
      { keywords: ['sanger sequencing', 'chain-termination', 'dideoxy', 'ddntp'], fn: 'svgSangerSequencing' },
      { keywords: ['illumina', 'bridge amplification', 'flow cell', 'sequencing by synthesis'], fn: 'svgIlluminaFlowCell' },
      { keywords: ['nanopore', 'minion', 'ionic current', 'protein pore'], fn: 'svgNanopore' },
      { keywords: ['pcr', 'polymerase chain reaction', 'denature', 'thermal cycl'], fn: 'svgPcrCycle' },
      { keywords: ['gel electrophoresis', 'agarose gel', 'running a gel', 'gel box'], fn: 'svgGelElectrophoresis' },
      { keywords: ['restriction enzyme', 'palindromic', 'ecori', 'recognition site', 'molecular scissors'], fn: 'svgRestrictionEnzyme' },
      { keywords: ['crispr', 'cas9', 'guide rna', 'sgrna', 'pam site'], fn: 'svgCrisprMechanism' },
      { keywords: ['expression cassette', 'promoter.*rbs', 'gene construct'], fn: 'svgExpressionCassette' },
      { keywords: ['central dogma', 'dna.*rna.*protein', 'transcription.*translation'], fn: 'svgTranscriptionTranslation' },
      { keywords: ['gibson assembly', 'overlap assembly', 'exonuclease.*polymerase.*ligase'], fn: 'svgGibsonAssembly' },
      { keywords: ['phosphoramidite', 'detritylation.*coupling', 'synthesis cycle', 'four-step cycle'], fn: 'svgPhosphoramidite' },
      { keywords: ['base edit', 'dcas9.*deaminase', 'cytosine.*thymine', 'abe.*cbe'], fn: 'svgBaseEditing' },
      { keywords: ['prime edit', 'pegrna', 'reverse transcriptase.*cas9'], fn: 'svgPrimeEditing' },
      { keywords: ['codon table', 'codon wheel', 'genetic code table', '64 codons', 'amino acid.*codon'], fn: 'svgCodonWheel' },
    ];

    const insertedDiagrams = new Set();

    sections.forEach(h4 => {
      // Get the text of this subsection (h4 + following siblings until next h4)
      let sectionText = h4.textContent.toLowerCase();
      let sibling = h4.nextElementSibling;
      while (sibling && sibling.tagName !== 'H4') {
        sectionText += ' ' + sibling.textContent.toLowerCase();
        sibling = sibling.nextElementSibling;
      }

      // Check which diagram matches
      for (const entry of diagramMap) {
        if (insertedDiagrams.has(entry.fn)) continue; // Only insert each diagram once

        const matches = entry.keywords.some(kw => {
          if (kw.includes('.*')) {
            return new RegExp(kw, 'i').test(sectionText);
          }
          return sectionText.includes(kw.toLowerCase());
        });

        if (matches && typeof diagrams[entry.fn] === 'function') {
          insertedDiagrams.add(entry.fn);

          // Insert after the first paragraph following this h4
          const firstP = h4.nextElementSibling;
          if (firstP) {
            const diagramDiv = document.createElement('div');
            diagramDiv.innerHTML = diagrams[entry.fn]();
            firstP.after(diagramDiv.firstElementChild || diagramDiv);
          }
          break; // Only one diagram per subsection
        }
      }
    });
  }).catch(err => {
    console.warn('Diagrams module not available:', err.message);
  });
}

/** Wrap first occurrence of vocabulary terms in highlighted spans */
function enhanceKeyTerms(container) {
  // Find strong tags that look like term definitions (bold followed by description)
  container.querySelectorAll('p').forEach(p => {
    if (p.closest('.callout, .callout-insight, .callout-fact, .callout-example')) return;

    const html = p.innerHTML;
    // Pattern: paragraph starting with <strong>Term</strong> followed by definition text
    if (/^<strong>[^<]{3,40}<\/strong>\s*(is|are|refers|means|describes|represents|involves|uses|was|were|can be|has been)/i.test(html)) {
      // This looks like a definition - highlight it
      if (!p.classList.contains('definition-highlight')) {
        p.classList.add('definition-highlight');
        p.style.borderLeft = '3px solid #8b5cf6';
        p.style.paddingLeft = '1rem';
        p.style.background = 'rgba(139, 92, 246, 0.04)';
        p.style.borderRadius = '0 0.5rem 0.5rem 0';
        p.style.padding = '0.75rem 1rem';
        p.style.marginBottom = '1.25rem';
      }
    }
  });
}

/** Extract key metrics from paragraphs and display as visual highlight strips */
function enhanceMetricHighlights(container) {
  // Find paragraphs that contain multiple bold stats in sequence — turn into metric cards
  container.querySelectorAll('p').forEach(p => {
    if (p.closest('.callout, .callout-insight, .metric-strip, .definition-highlight, table')) return;

    const boldEls = p.querySelectorAll('strong');
    const statBoldCount = Array.from(boldEls).filter(b => {
      return /^\$?[\d,.]+/.test(b.textContent.trim()) || /\d+%/.test(b.textContent.trim());
    }).length;

    // If paragraph has 3+ bold stats, convert to a metric strip
    if (statBoldCount >= 3) {
      const strip = document.createElement('div');
      strip.className = 'metric-strip';
      strip.innerHTML = `<div class="metric-strip-inner">${p.innerHTML}</div>`;
      p.replaceWith(strip);
    }
  });
}

/** Detect impactful sentences and style them as pull quotes */
function insertPullQuotes(container) {
  // Patterns that indicate an impactful/surprising statement
  const impactPatterns = [
    /\$[\d,.]+\s*(billion|million|trillion)/i,
    /million-fold/i,
    /billion-fold/i,
    /International Space Station/i,
    /human genome/i,
    /revolution/i,
    /for the first time/i,
    /changed.*forever/i,
    /breakthrough/i,
    /Nobel Prize/i,
    /transformed/i,
    /entire genome/i,
    /every cell/i,
    /single molecule/i,
    /one million/i,
    /cost.*dropped.*from/i,
    /faster than/i,
    /smaller than/i,
  ];

  const pullQuoteSet = new Set();
  let pullQuoteCount = 0;
  const maxPullQuotes = 2; // Limit to 2 per content block to avoid overdoing it

  container.querySelectorAll('p').forEach(p => {
    if (pullQuoteCount >= maxPullQuotes) return;
    if (p.closest('.callout, .callout-insight, .callout-fact, .callout-example, .metric-strip, .definition-highlight, .pull-quote, table, blockquote')) return;

    const text = p.textContent.trim();
    if (text.length < 40 || text.length > 300) return; // Good pull-quote length

    const isImpactful = impactPatterns.some(pat => pat.test(text));
    if (!isImpactful) return;

    // Avoid duplicate content
    const key = text.slice(0, 50);
    if (pullQuoteSet.has(key)) return;
    pullQuoteSet.add(key);

    // Create pull quote
    const quote = document.createElement('div');
    quote.className = 'pull-quote';
    quote.innerHTML = p.innerHTML;
    p.replaceWith(quote);
    pullQuoteCount++;
  });
}

/** Insert styled image placeholders after the first paragraph of each h4 subsection */
function insertImagePlaceholders(container) {
  const h4s = container.querySelectorAll('h4');
  let placeholderCount = 0;
  const maxPlaceholders = 1; // Only 1 per section (media-loader replaces with real images)

  h4s.forEach(h4 => {
    if (placeholderCount >= maxPlaceholders) return;

    // Find the first <p> after this h4
    let sibling = h4.nextElementSibling;
    while (sibling && sibling.tagName !== 'P' && sibling.tagName !== 'H4' && sibling.tagName !== 'H3') {
      sibling = sibling.nextElementSibling;
    }
    if (!sibling || sibling.tagName !== 'P') return;

    // Don't insert if there's already a diagram or image nearby
    const nextEl = sibling.nextElementSibling;
    if (nextEl && (nextEl.classList.contains('inline-diagram') || nextEl.classList.contains('image-placeholder') || nextEl.tagName === 'IMG')) return;

    // Generate a relevant caption from the h4 text
    const caption = `Illustration: ${h4.textContent.trim()}`;

    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:inline-block;opacity:0.35">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
      <div class="placeholder-caption">${caption}</div>
    `;
    sibling.after(placeholder);
    placeholderCount++;
  });
}

/** Ensure pre/code blocks that contain JSON-like data don't show as raw text */
function enhanceCodeBlocks(container) {
  container.querySelectorAll('pre > code').forEach(code => {
    const text = code.textContent.trim();
    // If it looks like JSON data (starts with { and has quoted keys), hide it
    // since it should have been rendered as a chart
    if (text.startsWith('{') && text.includes('"') && text.length > 100) {
      const pre = code.parentElement;
      pre.style.display = 'none';
      const notice = document.createElement('p');
      notice.className = 'text-sm text-slate-400 italic py-2';
      notice.textContent = '(Visualization loading...)';
      pre.after(notice);
    }
  });
}
