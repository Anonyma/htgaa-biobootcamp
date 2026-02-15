import { store, TOPICS } from '../store.js';

// Discussion questions organized by topic and Bloom's taxonomy level
const DISCUSSION_QUESTIONS = {
  'sequencing': [
    {
      id: 'seq-comp-1',
      level: 'comprehension',
      question: 'Why did long-read sequencing (PacBio, Nanopore) take decades to develop after Sanger sequencing?',
      hints: [
        'What technical challenges does single-molecule sequencing present?',
        'How do the chemistry and detection methods differ from Sanger?',
        'What computational challenges arise from higher error rates?'
      ]
    },
    {
      id: 'seq-app-1',
      level: 'application',
      question: 'A hospital needs to rapidly sequence a patient\'s tumor DNA. Which sequencing platform would you recommend and why?',
      hints: [
        'What turnaround time is required for clinical decisions?',
        'What types of mutations are most important to detect?',
        'How does cost factor into the decision?'
      ]
    },
    {
      id: 'seq-ana-1',
      level: 'analysis',
      question: 'Compare the error profiles of Illumina vs. Nanopore sequencing. How does each handle homopolymer runs?',
      hints: [
        'What types of errors are most common in each platform?',
        'Why are homopolymers particularly challenging?',
        'How do coverage depth and error correction strategies differ?'
      ]
    },
    {
      id: 'seq-syn-1',
      level: 'synthesis',
      question: 'Design a sequencing strategy for a complete human genome assembly. What combination of technologies would you use?',
      hints: [
        'What are the complementary strengths of short-read and long-read sequencing?',
        'How would you handle repetitive regions and structural variants?',
        'What quality metrics would you target for a clinical-grade assembly?'
      ]
    }
  ],
  'synthesis': [
    {
      id: 'syn-comp-1',
      level: 'comprehension',
      question: 'Why does coupling efficiency matter so much for long oligonucleotide synthesis? Calculate the yield for a 200-mer at 99.0% vs 99.5% efficiency.',
      hints: [
        'How is overall yield calculated from per-step efficiency?',
        'What happens to failed coupling products?',
        'At what length does synthesis become impractical?'
      ]
    },
    {
      id: 'syn-app-1',
      level: 'application',
      question: 'You need to assemble a 5kb gene from synthetic oligos. Outline your strategy using Gibson Assembly.',
      hints: [
        'What length should your oligos be?',
        'How much overlap do you need between fragments?',
        'What quality control would you perform at each stage?'
      ]
    },
    {
      id: 'syn-ana-1',
      level: 'analysis',
      question: 'Why has the cost of gene synthesis dropped dramatically since 2000 while the cost of longer constructs remains high?',
      hints: [
        'What technological improvements have occurred in oligo synthesis?',
        'What are the limiting factors for longer constructs?',
        'How do economies of scale and automation play a role?'
      ]
    },
    {
      id: 'syn-syn-1',
      level: 'synthesis',
      question: 'If enzymatic DNA synthesis replaced phosphoramidite chemistry, what advantages and disadvantages would this bring?',
      hints: [
        'What are the current limitations of phosphoramidite chemistry?',
        'How might enzymatic synthesis improve sustainability?',
        'What new capabilities or constraints would emerge?'
      ]
    }
  ],
  'editing': [
    {
      id: 'edit-comp-1',
      level: 'comprehension',
      question: 'Explain why CRISPR-Cas9 causes double-strand breaks while base editors do not. What are the consequences of each?',
      hints: [
        'What is the mechanism of Cas9 nuclease activity?',
        'How do base editors chemically modify DNA instead?',
        'What repair pathways are triggered by each approach?'
      ]
    },
    {
      id: 'edit-app-1',
      level: 'application',
      question: 'You want to correct a single point mutation causing sickle cell disease. Which editing approach (Cas9+HDR, base editing, or prime editing) would you choose and why?',
      hints: [
        'What is the specific mutation (A→T in the HBB gene)?',
        'What are the efficiency and safety trade-offs of each method?',
        'How does the target cell type (hematopoietic stem cells) affect your choice?'
      ]
    },
    {
      id: 'edit-eth-1',
      level: 'ethics',
      question: 'Should germline editing be allowed for disease prevention? What about for enhancement? Where do you draw the line?',
      hints: [
        'What is the difference between somatic and germline editing?',
        'How do we define "disease" vs. "enhancement"?',
        'Who should make these decisions, and how?'
      ]
    },
    {
      id: 'edit-ana-1',
      level: 'analysis',
      question: 'Compare off-target effects across ZFNs, TALENs, and CRISPR. Why is CRISPR\'s specificity both a strength and a concern?',
      hints: [
        'How does the targeting mechanism differ between these tools?',
        'What determines specificity in each case?',
        'How has CRISPR\'s ease of use affected the field?'
      ]
    }
  ],
  'genetic-codes': [
    {
      id: 'code-comp-1',
      level: 'comprehension',
      question: 'Why is the genetic code described as "degenerate but not ambiguous"? Why is wobble pairing biologically important?',
      hints: [
        'What does degeneracy mean in terms of codon-to-amino-acid mapping?',
        'How many codons are there vs. how many amino acids?',
        'How does wobble pairing reduce the number of required tRNAs?'
      ]
    },
    {
      id: 'code-app-1',
      level: 'application',
      question: 'You\'re engineering a bacterium to incorporate an unnatural amino acid. What components do you need to add?',
      hints: [
        'What is an orthogonal tRNA/aminoacyl-tRNA synthetase pair?',
        'Which codon would you reassign (typically a stop codon)?',
        'How do you supply the unnatural amino acid to the cells?'
      ]
    },
    {
      id: 'code-ana-1',
      level: 'analysis',
      question: 'Why might expanding the genetic code beyond 4 bases be scientifically valuable? What are the biosafety implications?',
      hints: [
        'What new capabilities could additional base pairs provide?',
        'How might this enable biocontainment?',
        'What are the risks of engineered organisms escaping containment?'
      ]
    },
    {
      id: 'code-syn-1',
      level: 'synthesis',
      question: 'Design a biocontainment strategy using an expanded genetic code that makes an organism dependent on a synthetic amino acid.',
      hints: [
        'Which essential genes would you modify to require the unnatural amino acid?',
        'How would you prevent evolutionary escape (reversion mutations)?',
        'What failsafes would you include?'
      ]
    }
  ],
  'gel-electrophoresis': [
    {
      id: 'gel-comp-1',
      level: 'comprehension',
      question: 'Why does DNA migrate toward the positive electrode? How does fragment size affect migration rate?',
      hints: [
        'What is the charge of the DNA backbone?',
        'How does the gel matrix act as a sieve?',
        'Why is migration rate roughly inversely proportional to log(size)?'
      ]
    },
    {
      id: 'gel-app-1',
      level: 'application',
      question: 'You run a restriction digest and see one fewer band than expected. What could explain this result?',
      hints: [
        'Could two fragments be the same size?',
        'Could one fragment be too small or too large to visualize?',
        'Could the digest be incomplete or have star activity?'
      ]
    },
    {
      id: 'gel-ana-1',
      level: 'analysis',
      question: 'When would you choose agarose gel electrophoresis over capillary electrophoresis or PAGE?',
      hints: [
        'What size ranges is each method best suited for?',
        'What are the resolution vs. throughput trade-offs?',
        'What information does each method provide (size, sequence, quantity)?'
      ]
    },
    {
      id: 'gel-syn-1',
      level: 'synthesis',
      question: 'How would you design a gel art experiment? What factors determine the pattern you can create?',
      hints: [
        'How do you control where DNA appears in the gel?',
        'What role do well position, timing, and voltage play?',
        'How would you plan a multi-color or gradient design?'
      ]
    }
  ],
  'central-dogma': [
    {
      id: 'dogma-comp-1',
      level: 'comprehension',
      question: 'What are the essential components of a gene expression cassette and what does each do?',
      hints: [
        'What is the role of the promoter, RBS/5\'UTR, coding sequence, and terminator?',
        'How do regulatory elements control expression level and timing?',
        'What additional elements might be needed (selectable markers, tags)?'
      ]
    },
    {
      id: 'dogma-app-1',
      level: 'application',
      question: 'You want to express a human protein in E. coli. What modifications to the gene sequence would you make?',
      hints: [
        'Why is codon optimization important?',
        'How do you handle post-translational modifications?',
        'What tags or fusion partners might improve expression or purification?'
      ]
    },
    {
      id: 'dogma-ana-1',
      level: 'analysis',
      question: 'Compare cell-based and cell-free protein expression systems. When would you use each?',
      hints: [
        'What are the advantages of not needing living cells?',
        'How do yield, cost, and scalability compare?',
        'What types of proteins are particularly suited to cell-free systems?'
      ]
    },
    {
      id: 'dogma-syn-1',
      level: 'synthesis',
      question: 'Design a simple genetic circuit (e.g., an AND gate) using promoters, RBSs, and coding sequences.',
      hints: [
        'How can you use inducible promoters as inputs?',
        'What would the logic gate output (e.g., fluorescent protein)?',
        'How do you achieve AND logic (both inputs required)?'
      ]
    }
  ]
};

// Bloom's taxonomy levels with colors
const BLOOM_LEVELS = [
  { id: 'comprehension', label: 'Comprehension', color: 'blue', description: 'Understanding concepts and facts' },
  { id: 'application', label: 'Application', color: 'green', description: 'Using knowledge in new situations' },
  { id: 'analysis', label: 'Analysis', color: 'amber', description: 'Breaking down and examining information' },
  { id: 'synthesis', label: 'Synthesis', color: 'purple', description: 'Creating new ideas and solutions' },
  { id: 'ethics', label: 'Ethics', color: 'red', description: 'Evaluating moral and societal implications' }
];

// Get color for topic
function getTopicColor(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  return topic ? topic.color : 'slate';
}

// Get all questions as flat array with topic info
function getAllQuestions() {
  const questions = [];
  Object.entries(DISCUSSION_QUESTIONS).forEach(([topicId, topicQuestions]) => {
    const topic = TOPICS.find(t => t.id === topicId);
    topicQuestions.forEach(q => {
      questions.push({
        ...q,
        topicId,
        topicTitle: topic?.title || topicId,
        topicColor: topic?.color || 'slate'
      });
    });
  });
  return questions;
}

// Load saved responses from localStorage
function loadResponses() {
  try {
    const saved = localStorage.getItem('htgaa-week2-discussion-notes');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to load discussion responses:', e);
    return {};
  }
}

// Save response to localStorage
function saveResponse(questionId, text) {
  try {
    const responses = loadResponses();
    responses[questionId] = text;
    localStorage.setItem('htgaa-week2-discussion-notes', JSON.stringify(responses));
  } catch (e) {
    console.error('Failed to save discussion response:', e);
  }
}

// Count words in text
function countWords(text) {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function createDiscussionView() {
  let currentTopicFilter = 'all';
  let currentLevelFilter = 'all';
  let responses = {};

  return {
    render() {
      const allQuestions = getAllQuestions();

      return `
        <div class="max-w-5xl mx-auto px-4 py-8">
          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <i data-lucide="message-circle" class="w-6 h-6 text-white"></i>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Discussion Prompts</h1>
                <p class="text-slate-600 dark:text-slate-400">Critical thinking questions for study groups and self-reflection</p>
              </div>
            </div>
          </div>

          <!-- Filter Bar -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
            <div class="space-y-4">
              <!-- Topic Filter -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Topic
                </label>
                <div class="flex flex-wrap gap-2">
                  <button data-topic-filter="all" class="topic-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-900 text-white">
                    All Topics
                  </button>
                  ${TOPICS.map(topic => `
                    <button data-topic-filter="${topic.id}" class="topic-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600">
                      <i data-lucide="${topic.icon}" class="w-4 h-4 inline-block mr-1"></i>
                      ${topic.title}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Level Filter -->
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Filter by Bloom's Level
                </label>
                <div class="flex flex-wrap gap-2">
                  <button data-level-filter="all" class="level-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-900 text-white">
                    All Levels
                  </button>
                  ${BLOOM_LEVELS.map(level => `
                    <button data-level-filter="${level.id}" class="level-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-${level.color}-100 text-${level.color}-700 hover:bg-${level.color}-200" title="${level.description}">
                      ${level.label}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Random Question Button -->
              <div class="flex justify-end">
                <button id="random-question-btn" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-700 transition-all flex items-center gap-2">
                  <i data-lucide="shuffle" class="w-4 h-4"></i>
                  Random Question
                </button>
              </div>
            </div>
          </div>

          <!-- Questions Grid -->
          <div id="questions-container" class="space-y-4">
            ${allQuestions.map(q => this.renderQuestionCard(q)).join('')}
          </div>

          <!-- Empty State -->
          <div id="empty-state" class="hidden text-center py-12">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
            </div>
            <p class="text-slate-600 dark:text-slate-400">No questions match your filters</p>
          </div>
        </div>
      `;
    },

    renderQuestionCard(question) {
      const savedResponse = responses[question.id] || '';
      const wordCount = countWords(savedResponse);
      const levelInfo = BLOOM_LEVELS.find(l => l.id === question.level);

      return `
        <div class="question-card bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
             data-question-id="${question.id}"
             data-topic="${question.topicId}"
             data-level="${question.level}">
          <!-- Header -->
          <div class="flex items-start gap-3 mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-${question.topicColor}-100 text-${question.topicColor}-600 dark:bg-${question.topicColor}-900/30 dark:text-${question.topicColor}-400 rounded-full px-3 py-0.5 text-xs font-medium">
                  ${question.topicTitle}
                </span>
                <span class="bg-${levelInfo.color}-100 text-${levelInfo.color}-700 dark:bg-${levelInfo.color}-900/30 dark:text-${levelInfo.color}-400 rounded-full px-3 py-0.5 text-xs font-medium" title="${levelInfo.description}">
                  ${levelInfo.label}
                </span>
              </div>
              <p class="text-lg font-medium text-slate-900 dark:text-white leading-relaxed">
                ${question.question}
              </p>
            </div>
          </div>

          <!-- Think About It Section -->
          <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <button class="hints-toggle flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" data-question-id="${question.id}">
              <i data-lucide="lightbulb" class="w-4 h-4"></i>
              Think About It
              <i data-lucide="chevron-down" class="w-4 h-4 ml-auto transition-transform"></i>
            </button>
            <div class="hints-content hidden mt-3 pl-6 space-y-2" data-question-id="${question.id}">
              ${question.hints.map(hint => `
                <div class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <i data-lucide="corner-down-right" class="w-4 h-4 mt-0.5 flex-shrink-0"></i>
                  <span>${hint}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- My Response Section -->
          <div class="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                My Response
              </label>
              <span class="word-count text-xs text-slate-500 dark:text-slate-400" data-question-id="${question.id}">
                ${wordCount} words
              </span>
            </div>
            <textarea
              class="response-textarea w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-y min-h-[100px]"
              data-question-id="${question.id}"
              placeholder="Type your thoughts here... Your response will be saved automatically."
            >${savedResponse}</textarea>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Load saved responses
      responses = loadResponses();

      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Topic filter buttons
      container.querySelectorAll('.topic-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentTopicFilter = btn.dataset.topicFilter;

          // Update button styles
          container.querySelectorAll('.topic-filter-btn').forEach(b => {
            if (b === btn) {
              b.className = 'topic-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-900 text-white';
            } else {
              b.className = 'topic-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600';
            }
          });

          this.filterQuestions(container);
        });
      });

      // Level filter buttons
      container.querySelectorAll('.level-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          currentLevelFilter = btn.dataset.levelFilter;

          // Update button styles
          container.querySelectorAll('.level-filter-btn').forEach(b => {
            const level = BLOOM_LEVELS.find(l => l.id === b.dataset.levelFilter);
            if (b === btn) {
              b.className = 'level-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-900 text-white';
            } else if (level) {
              b.className = `level-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-${level.color}-100 text-${level.color}-700 hover:bg-${level.color}-200`;
            } else {
              b.className = 'level-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600';
            }
          });

          this.filterQuestions(container);
        });
      });

      // Random question button
      const randomBtn = container.querySelector('#random-question-btn');
      if (randomBtn) {
        randomBtn.addEventListener('click', () => {
          const visibleCards = Array.from(container.querySelectorAll('.question-card'))
            .filter(card => card.style.display !== 'none');

          if (visibleCards.length > 0) {
            const randomCard = visibleCards[Math.floor(Math.random() * visibleCards.length)];
            randomCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight the card briefly
            randomCard.style.transition = 'all 0.3s ease';
            randomCard.style.transform = 'scale(1.02)';
            randomCard.style.boxShadow = '0 8px 30px rgba(139, 92, 246, 0.3)';

            setTimeout(() => {
              randomCard.style.transform = '';
              randomCard.style.boxShadow = '';
            }, 1000);
          }
        });
      }

      // Hints toggle
      container.querySelectorAll('.hints-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
          const questionId = btn.dataset.questionId;
          const hintsContent = container.querySelector(`.hints-content[data-question-id="${questionId}"]`);
          const chevron = btn.querySelector('[data-lucide="chevron-down"]');

          if (hintsContent) {
            const isHidden = hintsContent.classList.contains('hidden');
            hintsContent.classList.toggle('hidden');

            if (chevron) {
              chevron.style.transform = isHidden ? 'rotate(180deg)' : '';
            }
          }
        });
      });

      // Response textareas with auto-save
      container.querySelectorAll('.response-textarea').forEach(textarea => {
        const questionId = textarea.dataset.questionId;

        textarea.addEventListener('input', () => {
          const text = textarea.value;
          const wordCount = countWords(text);

          // Update word count
          const wordCountSpan = container.querySelector(`.word-count[data-question-id="${questionId}"]`);
          if (wordCountSpan) {
            wordCountSpan.textContent = `${wordCount} words`;
          }

          // Save to localStorage
          saveResponse(questionId, text);
          responses[questionId] = text;
        });
      });
    },

    filterQuestions(container) {
      const cards = container.querySelectorAll('.question-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const topic = card.dataset.topic;
        const level = card.dataset.level;

        const topicMatch = currentTopicFilter === 'all' || topic === currentTopicFilter;
        const levelMatch = currentLevelFilter === 'all' || level === currentLevelFilter;

        if (topicMatch && levelMatch) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show/hide empty state
      const emptyState = container.querySelector('#empty-state');
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.classList.remove('hidden');
        } else {
          emptyState.classList.add('hidden');
        }
      }
    }
  };
}

export { createDiscussionView };
