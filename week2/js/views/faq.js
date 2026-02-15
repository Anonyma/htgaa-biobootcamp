import { store, TOPICS } from '../store.js';

function createFaqView() {
  const faqs = [
    // About the Course
    {
      category: 'About the Course',
      color: 'blue',
      questions: [
        {
          q: 'What is HTGAA?',
          a: 'HTGAA stands for "How to Grow (Almost) Anything," an MIT course taught by George Church and other leading researchers. It covers fundamental bioengineering topics including DNA manipulation, gene editing, protein engineering, and synthetic biology. The course emphasizes hands-on learning and applies computational and engineering principles to biological systems.'
        },
        {
          q: 'What does Week 2 cover?',
          a: 'Week 2 focuses on three core DNA manipulation techniques: <strong>Reading</strong> (sequencing methods like Illumina, PacBio, and Nanopore), <strong>Writing</strong> (DNA synthesis and assembly techniques), and <strong>Editing</strong> (CRISPR and other gene editing tools). Supporting topics include genetic codes, gel electrophoresis, restriction enzymes, and the central dogma of molecular biology.'
        },
        {
          q: 'How should I approach the homework?',
          a: 'Start by reading through all the study materials to understand the concepts. Then work through each homework part sequentially—they build on each other. For Part 1 (gel art), experiment with different restriction enzyme combinations in Benchling. For Part 2 (primer design), carefully follow the steps for reverse translation and codon optimization. For Part 3 (essay), use your understanding from the readings to make informed predictions.'
        },
        {
          q: 'Do I need a biology background?',
          a: 'No! This course is designed for people from diverse backgrounds—computer science, engineering, design, and more. The study guide covers all necessary prerequisites, from basic molecular biology to technical details. If you encounter unfamiliar terms, check the glossary or use the search function to find relevant sections.'
        }
      ]
    },

    // DNA Sequencing
    {
      category: 'DNA Sequencing',
      color: 'green',
      questions: [
        {
          q: 'What\'s the difference between short-read and long-read sequencing?',
          a: '<strong>Short-read sequencing</strong> (Illumina, ~150-300bp) provides high accuracy (>99.9%), massive throughput (billions of reads), and low cost per base. However, it struggles with repetitive regions and requires computational assembly. <strong>Long-read sequencing</strong> (PacBio HiFi, Nanopore, 10-100kb+) can span entire genes or repetitive elements, simplifying assembly and revealing structural variants. Modern long-read methods now achieve >99% accuracy.'
        },
        {
          q: 'Why can\'t we just read DNA like a book?',
          a: 'DNA is incredibly small—the double helix is only ~2 nanometers wide, and individual bases are separated by ~0.34nm. At this molecular scale, we can\'t simply "look" at the sequence with microscopes. Instead, we use indirect methods: converting base identity into light signals (Illumina), electrical signals (Nanopore), or chemical reactions (Sanger sequencing). Each method cleverly translates molecular information into measurable signals.'
        },
        {
          q: 'Which sequencing platform should I use for my project?',
          a: '<strong>Illumina:</strong> Best for high-throughput applications like RNA-seq, ChIP-seq, variant calling in well-characterized genomes. <strong>PacBio HiFi:</strong> Ideal for de novo genome assembly, phasing haplotypes, detecting structural variants, or sequencing full-length transcripts. <strong>Oxford Nanopore:</strong> Great for portable/real-time applications, ultra-long reads (>100kb), direct RNA/DNA sequencing, and rapid pathogen identification. Consider cost, accuracy needs, and read length requirements.'
        },
        {
          q: 'What is sequencing by synthesis?',
          a: 'Sequencing by synthesis (SBS) is the approach used by Illumina platforms. DNA fragments are amplified into clusters on a flow cell. Then, fluorescently-labeled nucleotides (reversible terminators) are added one at a time. After each incorporation, the flow cell is imaged to detect which base was added based on fluorescence color. The fluorophore and blocking group are then removed, and the cycle repeats. This generates millions of short reads simultaneously.'
        },
        {
          q: 'What is coverage depth and why does it matter?',
          a: 'Coverage (or depth) is the average number of times each base in the genome is sequenced. For example, 30X coverage means each position is read ~30 times on average. Higher coverage increases confidence in variant calls, helps distinguish real mutations from sequencing errors, and enables detection of low-frequency variants. Typical targets: 30-50X for human genome sequencing, 10-20X for bacterial genomes, 100X+ for rare variant detection.'
        },
        {
          q: 'What are sequencing adapters?',
          a: 'Adapters are short, synthetic DNA sequences ligated to both ends of DNA fragments during library preparation. They serve multiple purposes: (1) provide primer binding sites for PCR amplification, (2) allow fragments to bind to the flow cell, (3) contain barcodes/indexes for sample multiplexing, and (4) enable paired-end sequencing by providing sequencing primer binding sites on both ends.'
        }
      ]
    },

    // DNA Synthesis
    {
      category: 'DNA Synthesis',
      color: 'purple',
      questions: [
        {
          q: 'Why is there a length limit on synthetic DNA?',
          a: 'Chemical DNA synthesis has ~99.5% coupling efficiency per step. This means only 99.5% of molecules successfully add each nucleotide. After 200 steps: (0.995)^200 ≈ 37% full-length product. Errors also accumulate—with 1/200 error rate, a 1kb gene averages 5 errors. This is why direct synthesis is limited to ~200nt oligos, and longer sequences require assembly of multiple fragments with error correction.'
        },
        {
          q: 'What is Gibson Assembly?',
          a: 'Gibson Assembly is a method to join multiple DNA fragments in a single isothermal reaction (typically 50°C for 1 hour). Fragments are designed with 20-40bp overlapping ends. The reaction contains: (1) <strong>5\' exonuclease</strong> to create 3\' overhangs, (2) <strong>DNA polymerase</strong> to fill in gaps, and (3) <strong>DNA ligase</strong> to seal nicks. It can join 2-15 fragments simultaneously without restriction sites or scars, making it ideal for building complex constructs.'
        },
        {
          q: 'How much does gene synthesis cost?',
          a: 'As of 2025, gene synthesis costs approximately <strong>$0.05-0.10 per base pair</strong> for standard sequences from commercial providers. A typical 1-5kb gene costs $100-500. Prices drop significantly for bulk orders. Complex sequences (repetitive regions, extreme GC content, secondary structures) may cost more or require special handling. Turn-around time is typically 5-15 business days. Synthesis + cloning into a vector costs slightly more.'
        },
        {
          q: 'What is error correction in synthesis?',
          a: 'Error correction reduces the error rate from ~1/200bp to ~1/10,000bp or better. Common methods: (1) <strong>MutS binding:</strong> MutS protein binds to mismatches; correct sequences are selectively amplified. (2) <strong>Sequencing-based selection:</strong> Synthesize many copies, sequence them, and select error-free clones. (3) <strong>Enzymatic error correction:</strong> Use enzymes that preferentially degrade error-containing sequences. This is critical for long genes where even rare errors are unacceptable.'
        },
        {
          q: 'What is the phosphoramidite method?',
          a: 'The phosphoramidite method is the standard for chemical DNA synthesis. It builds DNA 3\'→5\' (opposite of natural synthesis) on a solid support. Each cycle: (1) <strong>Deprotection:</strong> remove 5\'-DMT protecting group, (2) <strong>Coupling:</strong> add protected phosphoramidite nucleotide, (3) <strong>Capping:</strong> block failed sequences, (4) <strong>Oxidation:</strong> convert phosphite to stable phosphate. Cycles repeat to extend the chain. Finally, the oligo is cleaved from the support and deprotected.'
        },
        {
          q: 'Can I design any sequence I want?',
          a: 'Almost, but some sequences are problematic: (1) <strong>Repetitive sequences:</strong> Direct repeats >20bp can cause assembly failures or deletion, (2) <strong>Extreme GC content:</strong> Very high (>75%) or low (<25%) GC regions are hard to synthesize, (3) <strong>Secondary structures:</strong> Strong hairpins or G-quadruplexes can block synthesis, (4) <strong>Toxic sequences:</strong> Some sequences are toxic to E. coli during cloning. Synthesis companies will flag problematic regions and suggest modifications.'
        }
      ]
    },

    // Gene Editing (CRISPR)
    {
      category: 'Gene Editing',
      color: 'red',
      questions: [
        {
          q: 'How does CRISPR know where to cut?',
          a: 'CRISPR targeting relies on <strong>base pairing</strong>. The guide RNA (sgRNA) contains a 20-nucleotide sequence complementary to the target DNA. The Cas9 protein unwinds the DNA and allows the guide RNA to base-pair with one strand. Cas9 also checks for a <strong>PAM sequence</strong> (NGG for SpCas9) immediately adjacent to the target. Only when both the guide matches AND the PAM is present will Cas9 make a double-strand break 3bp upstream of the PAM.'
        },
        {
          q: 'What\'s the difference between NHEJ and HDR?',
          a: '<strong>NHEJ (Non-Homologous End Joining):</strong> Fast, active in all cell cycle phases, but error-prone. The broken ends are directly ligated, often with small insertions or deletions (indels). Used for gene knockouts. <strong>HDR (Homology-Directed Repair):</strong> Uses a provided DNA template with homology arms flanking the break. Precise, can insert/replace sequences, but only active in S/G2 phases and much less efficient (1-10% vs 50-90% for NHEJ).'
        },
        {
          q: 'Can CRISPR cure genetic diseases?',
          a: 'Yes, CRISPR is in clinical trials for many genetic diseases. <strong>Casgevy</strong> (exagamglogene autotemcel) was FDA-approved in 2023 for sickle cell disease and beta-thalassemia—the first CRISPR therapy. It works by editing patient blood stem cells ex vivo to reactivate fetal hemoglobin. Trials are ongoing for Duchenne muscular dystrophy, cystic fibrosis, certain cancers, and inherited blindness. Challenges include delivery, off-target effects, and immune responses.'
        },
        {
          q: 'What are off-target effects?',
          a: 'Off-target effects occur when Cas9 cuts at sites similar to the intended target. The guide RNA can tolerate 1-5 mismatches, especially in the 5\' region (PAM-distal). This creates unwanted mutations elsewhere in the genome, a major safety concern for therapeutic applications. Mitigation strategies: (1) carefully design guides with minimal off-target predictions, (2) use high-fidelity Cas9 variants (SpCas9-HF1, eSpCas9), (3) deliver as RNP rather than plasmid to limit exposure time, (4) validate by whole-genome sequencing.'
        },
        {
          q: 'What are base editors and prime editors?',
          a: '<strong>Base editors</strong> fuse catalytically-dead Cas9 (dCas9) to a deaminase enzyme. They convert C→T (cytosine base editor, CBE) or A→G (adenine base editor, ABE) without making double-strand breaks, avoiding NHEJ errors. <strong>Prime editors</strong> fuse dCas9 to reverse transcriptase and use a prime editing guide RNA (pegRNA) to write new sequences directly, enabling insertions, deletions, and all 12 base-to-base conversions. They\'re more versatile than base editors but more complex.'
        },
        {
          q: 'How do I design a good guide RNA?',
          a: 'Good guide RNA design: (1) Target a unique 20nt sequence followed by NGG PAM, (2) Aim for 40-60% GC content, (3) Avoid polyT (>4 Ts in a row—transcription terminator), (4) Check for off-targets using tools like Benchling, CRISPRscan, or CHOPCHOP, (5) If possible, target early in the gene (for knockouts), (6) Validate predicted cutting efficiency scores (higher is better), (7) Design 2-3 guides per target and test empirically.'
        }
      ]
    },

    // Genetic Codes
    {
      category: 'Genetic Codes',
      color: 'yellow',
      questions: [
        {
          q: 'Why are there 64 codons but only 20 amino acids?',
          a: 'With 4 bases (A, C, G, T/U) and 3-letter codons, there are 4³ = 64 possible combinations. Only 20 standard amino acids are encoded (plus start and stop signals). The code is <strong>degenerate</strong> or <strong>redundant</strong>—multiple codons encode the same amino acid. For example, leucine has 6 codons. This redundancy provides robustness: many mutations in the third codon position are "silent" and don\'t change the protein sequence.'
        },
        {
          q: 'What is codon optimization?',
          a: 'Codon optimization means replacing codons with synonymous codons preferred by the host organism. Different species have different tRNA abundances—rare codons slow translation or cause errors. For high expression in E. coli, use E. coli-preferred codons. For mammalian cells, use human codon preferences. Modern optimization also considers: mRNA secondary structure, avoiding rare di-codons, regulatory sequences, and GC content. Tools like IDT Codon Optimization or Benchling automate this.'
        },
        {
          q: 'Can we add new amino acids to the genetic code?',
          a: 'Yes! <strong>Genetic code expansion</strong> uses amber suppression technology. The amber stop codon (UAG) is repurposed to encode an unnatural amino acid (UAA). You provide: (1) an orthogonal aminoacyl-tRNA synthetase that charges a tRNA with the UAA, (2) an orthogonal tRNA with CUA anticodon, (3) the UAA in the growth medium. Now UAG incorporates the UAA instead of stopping translation. Over 200 UAAs have been incorporated, enabling new chemical functionalities (click chemistry, fluorophores, post-translational modifications).'
        },
        {
          q: 'What is wobble base pairing?',
          a: 'Wobble base pairing explains how one tRNA can recognize multiple codons. The third codon position (3\' end) can form non-Watson-Crick pairs with the tRNA anticodon. For example, a tRNA with a G in the wobble position can pair with both C and U in the codon. This is why fewer than 61 tRNAs are needed to decode all sense codons. Inosine (I) in the wobble position can pair with U, C, or A, providing even more flexibility.'
        }
      ]
    },

    // Gel Electrophoresis
    {
      category: 'Gel Electrophoresis',
      color: 'indigo',
      questions: [
        {
          q: 'Why do smaller DNA fragments move faster?',
          a: 'Agarose gel electrophoresis separates DNA by size. The gel is a meshwork of agarose fibers with pores. When an electric field is applied, negatively-charged DNA migrates toward the positive electrode. <strong>Smaller fragments</strong> navigate through the pores more easily, while <strong>larger fragments</strong> encounter more resistance and move slower. The relationship is approximately logarithmic—fragment size vs. distance migrated plots as a straight line on semi-log paper.'
        },
        {
          q: 'What concentration of agarose should I use?',
          a: '<strong>0.5-0.8%:</strong> Large fragments (5-50kb), good for separating plasmids or genomic DNA digests. <strong>1.0%:</strong> General purpose, separates 0.5-10kb range, most common for routine cloning. <strong>1.5-2.0%:</strong> Small fragments (50-1000bp), good for PCR products or small restriction fragments. Higher percentage = smaller pores = better resolution of small fragments but poorer resolution of large ones. For very small fragments (<100bp), use polyacrylamide gels instead.'
        },
        {
          q: 'What is a restriction enzyme?',
          a: 'Restriction enzymes (restriction endonucleases) are proteins that recognize specific 4-8bp DNA sequences and cut the backbone. They evolved in bacteria as a defense against viral DNA. <strong>Type II</strong> enzymes are most common in cloning—they cut at defined positions within/near the recognition site. Some produce <strong>sticky ends</strong> (overhangs) that facilitate ligation. Others produce <strong>blunt ends</strong>. Examples: EcoRI (G↓AATTC), BamHI (G↓GATCC), PstI (CTGCA↓G). Over 4,000 restriction enzymes are known.'
        },
        {
          q: 'Why does my gel look smeared?',
          a: 'Common causes of smeared gels: (1) <strong>DNA degradation:</strong> Use fresh DNA, keep on ice, avoid freeze-thaw cycles, check for nuclease contamination. (2) <strong>Overloading:</strong> Too much DNA (>500ng per lane) causes smearing—dilute your sample. (3) <strong>Voltage too high:</strong> Excessive heat denatures DNA—run at 5V/cm or lower. (4) <strong>Incomplete digestion:</strong> Restriction enzymes need optimal conditions (correct buffer, temperature, time). (5) <strong>Gel too old:</strong> Agarose gels degrade over time—make fresh gels.'
        },
        {
          q: 'What is the DNA ladder for?',
          a: 'The DNA ladder (size marker) is a mixture of DNA fragments of known sizes run alongside your samples. By comparing the migration distance of your bands to the ladder bands, you can estimate the size of your fragments. Common ladders: 1kb ladder (0.5-10kb in 1kb increments), 100bp ladder (100-1500bp), λ DNA/HindIII (125bp-23kb). Always run a ladder on every gel to enable size estimation and confirm the gel ran correctly.'
        }
      ]
    },

    // Central Dogma & Expression
    {
      category: 'Central Dogma & Expression',
      color: 'pink',
      questions: [
        {
          q: 'What is an expression cassette?',
          a: 'An expression cassette is the minimal set of genetic elements needed to express a protein: <strong>Promoter</strong> (initiates transcription) → <strong>RBS/Kozak</strong> (ribosome binding) → <strong>Start codon</strong> (ATG) → <strong>Coding sequence</strong> (your gene) → <strong>Stop codon</strong> (TAA/TAG/TGA) → <strong>Terminator</strong> (ends transcription). Additional elements may include: tags (His, FLAG), protease cleavage sites, localization signals, and regulatory sequences. The cassette is inserted into a vector backbone for replication and selection.'
        },
        {
          q: 'What\'s the difference between prokaryotic and eukaryotic expression?',
          a: '<strong>Prokaryotic (E. coli, bacteria):</strong> Fast growth (30min doubling), inexpensive, high yields, simple media. But: no post-translational modifications, inclusion bodies common for eukaryotic proteins, no glycosylation. <strong>Eukaryotic (yeast, mammalian, insect):</strong> Proper protein folding, post-translational modifications (phosphorylation, glycosylation), secretion pathways. But: slower (24h doubling for mammalian), expensive media, lower yields. Choose based on protein requirements.'
        },
        {
          q: 'What is a His-tag?',
          a: 'A His-tag (polyhistidine tag) is a sequence of 6-10 histidine residues added to the N- or C-terminus of a protein. Histidine\'s imidazole side chain binds to nickel or cobalt ions. This enables <strong>affinity chromatography purification:</strong> lysate is passed over a nickel-charged resin, His-tagged protein binds, contaminants wash away, then protein is eluted with imidazole or low pH. It\'s small (1kDa for 6xHis), rarely affects function, and highly efficient. Other tags: FLAG, Strep, MBP, GST.'
        },
        {
          q: 'Why do we need terminators?',
          a: 'Terminators signal the end of transcription. Without them, RNA polymerase continues transcribing into downstream genes, creating aberrant transcripts, interfering with neighboring genes, and reducing expression. In bacteria, terminators are often rho-independent (form hairpin structure that dissociates polymerase). In eukaryotes, terminators involve polyadenylation signals. Strong terminators ensure clean transcript ends, prevent read-through, and improve expression predictability. Multiple terminators can be used in series for increased reliability.'
        },
        {
          q: 'What is IPTG and why is it used?',
          a: 'IPTG (isopropyl β-D-1-thiogalactopyranoside) is a molecular mimic of lactose used to induce expression from the lac operon. It binds to the lac repressor, causing it to release from the operator, allowing transcription. IPTG is used (instead of lactose) because: (1) it\'s not metabolized by E. coli, so concentration stays constant, (2) it induces uniformly, (3) it\'s stable in media. Typical concentration: 0.1-1mM. After adding IPTG, cells are grown 3-4 more hours to accumulate protein.'
        }
      ]
    },

    // Homework-Specific
    {
      category: 'Homework Help',
      color: 'teal',
      questions: [
        {
          q: 'What is gel art?',
          a: 'Gel art is the practice of creating artistic patterns in agarose gels by strategically choosing restriction enzymes and DNA templates. Different restriction enzymes cut at different frequencies, producing characteristic band patterns. By loading different digests in adjacent lanes, you can create patterns, letters, or images. For Week 2 homework Part 1, you\'ll design a gel pattern in Benchling by choosing restriction enzymes and predicting the resulting bands.'
        },
        {
          q: 'How do I use Benchling for virtual digest?',
          a: 'In Benchling: (1) Import your DNA sequence or use a plasmid from the registry, (2) Click the <strong>Scissors icon</strong> or go to Tools → Digest, (3) Select one or more restriction enzymes, (4) Click "Run Digest" to see cut sites annotated on your sequence, (5) Click "Simulate Gel" to visualize the band pattern. Adjust enzyme combinations to create your desired pattern. Export the gel image for your homework submission.'
        },
        {
          q: 'What is reverse translation?',
          a: 'Reverse translation converts a protein (amino acid) sequence back to a DNA (nucleotide) sequence. Since the genetic code is degenerate, there are many possible DNA sequences for any protein. For example, the amino acid Leu can be encoded by 6 different codons. The naive approach picks any valid codon; <strong>optimized reverse translation</strong> chooses codons based on host organism preference, avoids problematic sequences, and optimizes GC content. Use tools like Benchling or IDT for this.'
        },
        {
          q: 'How do I design primers for my synthesis cassette?',
          a: 'For Week 2 homework Part 2: (1) Start with the target protein sequence, (2) Perform reverse translation with codon optimization for your host organism, (3) Add required elements: start codon (ATG) at the beginning, stop codon (TAA/TAG/TGA) at the end, restriction sites on flanks if needed, (4) Check the sequence length—if >200bp, you\'ll need to design overlapping oligos for assembly, (5) Verify your sequence doesn\'t contain internal restriction sites that would interfere with cloning.'
        },
        {
          q: 'What should I include in my Week 2 essay?',
          a: 'For Part 3, discuss the future of DNA reading, writing, and editing. Consider: (1) <strong>Technical advances:</strong> Will long-read sequencing replace short-read? What are the limits of synthesis cost reduction? (2) <strong>Applications:</strong> Personalized medicine, synthetic organisms, climate solutions? (3) <strong>Ethical concerns:</strong> Designer babies, bioweapons, equity of access? (4) <strong>Your vision:</strong> What would you build if these technologies were free/easy? Support arguments with examples from the readings. Aim for 800-1200 words.'
        }
      ]
    }
  ];

  let currentFilters = new Set();
  let searchQuery = '';
  let expandedQuestions = new Set();

  return {
    render() {
      const allCategories = [...new Set(faqs.map(cat => cat.category))];

      return `
        <div class="max-w-5xl mx-auto space-y-6">
          <!-- Header -->
          <div class="flex items-start gap-4">
            <div class="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
              <i data-lucide="help-circle" class="w-8 h-8"></i>
            </div>
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h1>
              <p class="text-slate-600 dark:text-slate-400 mt-1">Common questions about Week 2 topics—DNA reading, writing, and editing</p>
            </div>
          </div>

          <!-- Search and Filters -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <!-- Search bar -->
            <div class="relative">
              <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
              <input
                type="text"
                id="faq-search"
                placeholder="Search questions..."
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <!-- Category filters -->
            <div class="flex flex-wrap gap-2">
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300 self-center">Filter by category:</span>
              ${allCategories.map(cat => {
                const catData = faqs.find(f => f.category === cat);
                return `
                  <button
                    class="faq-category-filter px-3 py-1.5 text-sm font-medium rounded-lg border transition-all"
                    data-category="${cat}"
                    data-color="${catData.color}"
                  >
                    ${cat}
                  </button>
                `;
              }).join('')}
              <button
                id="faq-clear-filters"
                class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>

          <!-- FAQ Categories -->
          <div id="faq-container" class="space-y-6">
            ${faqs.map(category => `
              <div class="faq-category" data-category="${category.category}">
                <div class="flex items-center gap-3 mb-4">
                  <div class="h-8 w-1 bg-${category.color}-500 rounded-full"></div>
                  <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${category.category}</h2>
                  <span class="faq-count text-sm text-slate-500 dark:text-slate-400">(${category.questions.length} questions)</span>
                </div>

                <div class="space-y-3">
                  ${category.questions.map((item, idx) => {
                    const id = `faq-${category.category.replace(/\s+/g, '-')}-${idx}`;
                    return `
                      <div class="faq-item bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden" data-question="${item.q.toLowerCase()}" data-answer="${item.a.toLowerCase()}">
                        <button
                          class="faq-question w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                          data-faq-id="${id}"
                        >
                          <span class="font-semibold text-slate-900 dark:text-white">${item.q}</span>
                          <i data-lucide="chevron-down" class="faq-chevron w-5 h-5 text-slate-400 flex-shrink-0 transition-transform"></i>
                        </button>
                        <div class="faq-answer hidden px-6 pb-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                          ${item.a}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- No results message -->
          <div id="faq-no-results" class="hidden text-center py-12">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <i data-lucide="search-x" class="w-8 h-8 text-slate-400"></i>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">No questions found</h3>
            <p class="text-slate-600 dark:text-slate-400">Try a different search term or clear your filters</p>
          </div>

          <!-- Help footer -->
          <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
            <div class="flex items-start gap-4">
              <div class="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <i data-lucide="message-circle" class="w-6 h-6 text-purple-600 dark:text-purple-400"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Still have questions?</h3>
                <p class="text-slate-600 dark:text-slate-300 mb-4">
                  If you didn't find what you're looking for, try these resources:
                </p>
                <div class="flex flex-wrap gap-3">
                  <a href="https://htgaa.org" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                    HTGAA Website
                  </a>
                  <a href="https://benchling.com" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <i data-lucide="external-link" class="w-4 h-4"></i>
                    Benchling Help
                  </a>
                  <button class="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <i data-lucide="book-open" class="w-4 h-4"></i>
                    Back to Study Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    mount(container) {
      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Get elements
      const searchInput = container.querySelector('#faq-search');
      const categoryFilters = container.querySelectorAll('.faq-category-filter');
      const clearFiltersBtn = container.querySelector('#faq-clear-filters');
      const faqQuestions = container.querySelectorAll('.faq-question');
      const noResults = container.querySelector('#faq-no-results');
      const faqContainer = container.querySelector('#faq-container');

      // Update filter button styles
      function updateFilterButtons() {
        categoryFilters.forEach(btn => {
          const category = btn.dataset.category;
          const color = btn.dataset.color;
          const isActive = currentFilters.has(category);

          if (isActive) {
            btn.className = `faq-category-filter px-3 py-1.5 text-sm font-medium rounded-lg border border-${color}-500 bg-${color}-500 text-white`;
          } else {
            btn.className = `faq-category-filter px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-${color}-500 hover:text-${color}-600 dark:hover:text-${color}-400 transition-all`;
          }
        });
      }

      // Filter FAQs
      function filterFaqs() {
        const query = searchQuery.toLowerCase();
        let visibleCount = 0;

        container.querySelectorAll('.faq-category').forEach(categoryEl => {
          const category = categoryEl.dataset.category;
          const categoryVisible = currentFilters.size === 0 || currentFilters.has(category);

          let categoryItemCount = 0;

          categoryEl.querySelectorAll('.faq-item').forEach(item => {
            const question = item.dataset.question;
            const answer = item.dataset.answer;
            const matchesSearch = !query || question.includes(query) || answer.includes(query);
            const visible = categoryVisible && matchesSearch;

            item.style.display = visible ? 'block' : 'none';
            if (visible) {
              categoryItemCount++;
              visibleCount++;
            }
          });

          // Update category count
          const countEl = categoryEl.querySelector('.faq-count');
          if (countEl) {
            countEl.textContent = `(${categoryItemCount} question${categoryItemCount !== 1 ? 's' : ''})`;
          }

          // Hide category if no visible items
          categoryEl.style.display = categoryItemCount > 0 ? 'block' : 'none';
        });

        // Show/hide no results message
        if (visibleCount === 0) {
          faqContainer.classList.add('hidden');
          noResults.classList.remove('hidden');
        } else {
          faqContainer.classList.remove('hidden');
          noResults.classList.add('hidden');
        }

        // Re-initialize icons for visible elements
        if (window.lucide) {
          window.lucide.createIcons();
        }
      }

      // Search input handler
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterFaqs();
      });

      // Category filter handlers
      categoryFilters.forEach(btn => {
        btn.addEventListener('click', () => {
          const category = btn.dataset.category;
          if (currentFilters.has(category)) {
            currentFilters.delete(category);
          } else {
            currentFilters.add(category);
          }
          updateFilterButtons();
          filterFaqs();
        });
      });

      // Clear filters handler
      clearFiltersBtn.addEventListener('click', () => {
        currentFilters.clear();
        searchQuery = '';
        searchInput.value = '';
        updateFilterButtons();
        filterFaqs();
      });

      // FAQ accordion handlers
      faqQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
          const faqId = btn.dataset.faqId;
          const item = btn.closest('.faq-item');
          const answer = item.querySelector('.faq-answer');
          const chevron = btn.querySelector('.faq-chevron');

          const isExpanded = expandedQuestions.has(faqId);

          if (isExpanded) {
            expandedQuestions.delete(faqId);
            answer.classList.add('hidden');
            chevron.style.transform = 'rotate(0deg)';
          } else {
            expandedQuestions.add(faqId);
            answer.classList.remove('hidden');
            chevron.style.transform = 'rotate(180deg)';
          }
        });
      });

      // "Back to Study Guide" button handler
      const backBtn = container.querySelector('button:has(.book-open)');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          store.setView('topics');
        });
      }

      // Initialize filter buttons
      updateFilterButtons();
    }
  };
}

export { createFaqView };
