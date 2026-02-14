/**
 * HTGAA Week 2 — Glossary Tooltip System
 * Hover over technical terms to see definitions.
 */

export const glossaryTerms = {
  // Sequencing
  'Sanger sequencing': 'First-generation DNA sequencing method using chain-terminating dideoxynucleotides (ddNTPs). Produces reads up to ~900bp with 99.99% accuracy.',
  'ddNTP': 'Dideoxynucleotide triphosphate — lacks the 3\'-OH group needed for chain extension, causing termination when incorporated during sequencing.',
  'NGS': 'Next-Generation Sequencing — massively parallel sequencing technologies that read millions of DNA fragments simultaneously.',
  'Illumina': 'Dominant NGS platform using sequencing-by-synthesis with fluorescent reversible terminators. Produces 150-300bp reads.',
  'flow cell': 'Glass slide with surface-bound oligonucleotides where Illumina sequencing occurs. DNA clusters form via bridge amplification.',
  'bridge amplification': 'Process on Illumina flow cells where DNA bends to hybridize with nearby surface oligos, creating clonal clusters.',
  'PacBio': 'Pacific Biosciences — long-read sequencing platform using single-molecule real-time (SMRT) technology in zero-mode waveguides.',
  'HiFi': 'PacBio High-Fidelity reads — circular consensus sequencing achieves >99.9% accuracy with 15-25kb reads.',
  'nanopore sequencing': 'Sequencing by measuring ionic current changes as DNA passes through a protein nanopore. Produces ultra-long reads (100kb+).',
  'MinION': 'Oxford Nanopore\'s portable sequencing device, the size of a USB drive. Enables real-time, field-deployable sequencing.',
  'chromatogram': 'Graph showing fluorescent signal intensities for each base call in Sanger sequencing. Peaks represent identified bases.',
  'read length': 'The number of bases determined from a single sequencing reaction. Ranges from ~150bp (Illumina) to >100kb (Nanopore).',

  // Synthesis
  'phosphoramidite': 'Protected nucleotide monomer used in chemical DNA synthesis. The 4-step coupling cycle builds DNA one base at a time.',
  'DMT': 'Dimethoxytrityl — acid-labile protecting group on the 5\'-OH of phosphoramidite monomers. Removed during detritylation step.',
  'coupling efficiency': 'Percentage of nucleotides successfully added in each synthesis cycle. Must be >99% for usable oligos.',
  'oligo': 'Short for oligonucleotide — a short single-stranded DNA molecule, typically 15-200 nucleotides long.',
  'Gibson assembly': 'One-pot isothermal method for joining DNA fragments with overlapping ends using exonuclease, polymerase, and ligase.',
  'gene synthesis': 'Chemical construction of a complete gene from oligonucleotides, without using a biological template.',
  'Twist Bioscience': 'Gene synthesis company using silicon-based chip technology to synthesize DNA at high throughput and low cost.',
  'error correction': 'Methods to remove synthesis errors from assembled DNA, including enzymatic (MutS) and selection-based approaches.',

  // Editing
  'CRISPR': 'Clustered Regularly Interspaced Short Palindromic Repeats — bacterial immune system adapted as a genome editing tool.',
  'Cas9': 'CRISPR-associated protein 9 — RNA-guided endonuclease that creates double-strand breaks at target DNA sequences.',
  'sgRNA': 'Single guide RNA — engineered fusion of crRNA and tracrRNA that directs Cas9 to its target sequence (~20nt complementarity).',
  'PAM': 'Protospacer Adjacent Motif — short DNA sequence (NGG for SpCas9) required adjacent to the target for Cas9 binding.',
  'NHEJ': 'Non-Homologous End Joining — error-prone DNA repair pathway that often introduces insertions or deletions (indels).',
  'HDR': 'Homology-Directed Repair — precise DNA repair using a donor template. Enables exact sequence changes but requires cell division.',
  'base editing': 'Precise single-base changes without double-strand breaks. CBEs convert C→T; ABEs convert A→G.',
  'prime editing': 'Versatile editing using Cas9 nickase fused to reverse transcriptase with a pegRNA template. Can make any small edit.',
  'pegRNA': 'Prime editing guide RNA — contains both the target-binding spacer and a template for the desired edit.',
  'RNP': 'Ribonucleoprotein — pre-assembled Cas9 protein + guide RNA complex. Preferred delivery for therapeutic editing.',
  'indel': 'Insertion or deletion mutation, commonly introduced by NHEJ repair of CRISPR-induced double-strand breaks.',
  'MAGE': 'Multiplex Automated Genome Engineering — technique for making many simultaneous edits across a genome using synthetic oligos.',
  'GRO': 'Genomically Recoded Organism — organism with systematically altered codon assignments, like C321.deltaA.',

  // Genetic Codes
  'codon': 'Three-nucleotide sequence in mRNA that specifies one amino acid (or stop signal) during translation.',
  'anticodon': 'Three-nucleotide sequence on tRNA that base-pairs with the mRNA codon during translation.',
  'wobble position': 'The third position of a codon where base-pairing is less stringent, allowing one tRNA to recognize multiple codons.',
  'degenerate code': 'The genetic code is degenerate because multiple codons can specify the same amino acid (64 codons → 20 amino acids).',
  'reading frame': 'One of three possible ways to read a nucleotide sequence as codons. Set by the position of the start codon (AUG).',
  'start codon': 'AUG — the codon that initiates translation. Encodes methionine and signals the ribosome to begin protein synthesis.',
  'stop codon': 'UAA, UAG, or UGA — codons that signal translation termination. Recognized by release factors, not tRNAs.',
  'codon optimization': 'Replacing rare codons with synonymous codons preferred by the host organism to improve protein expression.',
  'CAI': 'Codon Adaptation Index — metric scoring how well a gene\'s codon usage matches the host organism\'s preferences (0-1 scale).',
  'tRNA': 'Transfer RNA — small RNA (~76nt) that carries amino acids to the ribosome. Contains an anticodon that reads mRNA codons.',
  'inosine': 'Modified base in tRNA anticodon wobble position that can pair with U, C, or A, expanding decoding capacity.',
  'nsAA': 'Non-standard amino acid — synthetic amino acid incorporated into proteins using orthogonal tRNA/synthetase systems.',
  'orthogonal': 'In synthetic biology: a tRNA/synthetase pair that doesn\'t cross-react with the host\'s translation machinery.',

  // Gel Electrophoresis
  'gel electrophoresis': 'Technique for separating DNA fragments by size through an agarose matrix using an electric field.',
  'agarose': 'Polysaccharide from seaweed that forms the gel matrix. Concentration (0.5-2%) determines pore size and resolution range.',
  'restriction enzyme': 'Bacterial endonuclease that recognizes and cuts specific palindromic DNA sequences (4-8 bp recognition sites).',
  'palindrome': 'DNA sequence that reads the same on both strands in the 5\'→3\' direction. Essential for restriction enzyme recognition.',
  'sticky ends': 'Single-stranded overhangs left after restriction enzyme cutting. Enable directional ligation of compatible fragments.',
  'blunt ends': 'Flush DNA ends with no overhangs, produced by enzymes that cut at the same position on both strands.',
  'EcoRI': 'Common restriction enzyme from E. coli that recognizes GAATTC and produces 4-base 5\' sticky ends.',
  'DNA ladder': 'Standard mixture of DNA fragments of known sizes used as a reference for estimating unknown fragment sizes on gels.',
  'ethidium bromide': 'Fluorescent intercalating dye historically used to visualize DNA in gels. Being replaced by safer alternatives like SYBR Safe.',
  'loading dye': 'Colored solution added to DNA samples to visualize loading and track migration progress during electrophoresis.',

  // Central Dogma
  'central dogma': 'Principle that sequence information flows DNA → RNA → Protein. Information cannot flow from protein back to nucleic acid.',
  'transcription': 'Process of copying DNA into messenger RNA by RNA polymerase. First step of gene expression.',
  'translation': 'Process of reading mRNA codons to assemble a polypeptide chain on the ribosome.',
  'mRNA': 'Messenger RNA — carries the genetic code from DNA to ribosomes for protein synthesis.',
  'ribosome': 'Molecular machine (rRNA + protein) that reads mRNA and catalyzes peptide bond formation during translation.',
  'promoter': 'DNA sequence upstream of a gene that RNA polymerase binds to initiate transcription. Controls when/how much a gene is expressed.',
  'RBS': 'Ribosome Binding Site (Shine-Dalgarno sequence in bacteria) — mRNA sequence that recruits the ribosome for translation initiation.',
  'terminator': 'DNA/RNA sequence that signals RNA polymerase to stop transcription and release the mRNA.',
  'expression cassette': 'Minimal DNA unit for gene expression: Promoter → RBS → Start Codon → CDS → Stop Codon → Terminator.',
  'CDS': 'Coding Sequence — the portion of a gene that directly encodes the protein, from start codon to stop codon.',
  'polymerase': 'Enzyme that synthesizes nucleic acids from a template. DNA polymerase copies DNA; RNA polymerase makes mRNA.',
  'ligase': 'Enzyme that joins DNA fragments by forming phosphodiester bonds between adjacent nucleotides.',
  'plasmid': 'Small circular DNA molecule that replicates independently. Commonly used as a vector to carry genes into cells.',
  'vector': 'DNA molecule used to carry foreign genetic material into a host cell (e.g., plasmids, viral vectors, BACs).',
  'alternative splicing': 'Process where one pre-mRNA produces multiple mRNA variants by including/excluding different exons.',
  'post-translational modification': 'Chemical changes to a protein after translation: phosphorylation, glycosylation, ubiquitination, etc.',

  // General
  'PCR': 'Polymerase Chain Reaction — exponential amplification of DNA using thermal cycling: denature, anneal, extend.',
  'GC content': 'Percentage of guanine and cytosine bases in a DNA sequence. Affects stability, melting temperature, and synthesis difficulty.',
  'Tm': 'Melting temperature — temperature at which 50% of DNA duplexes denature into single strands.',
  'fluorophore': 'Molecule that absorbs light at one wavelength and emits at a longer wavelength. Used in sequencing and labeling.',
  'endonuclease': 'Enzyme that cuts within a nucleic acid strand (vs. exonuclease which degrades from the end).',
  'exonuclease': 'Enzyme that removes nucleotides from the end of a DNA/RNA strand. Used in Gibson assembly and error correction.',
  'bioorthogonal': 'Chemical reactions that proceed in living systems without interfering with native biochemistry (e.g., click chemistry).',
  'click chemistry': 'Selective chemical reactions (e.g., azide-alkyne cycloaddition) used to attach labels or drugs to proteins at specific sites.',
};

/** Initialize glossary tooltips on a container */
export function initGlossaryTooltips(container) {
  if (!container) return;

  // Create tooltip element if not exists
  let tooltip = document.getElementById('glossary-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'glossary-tooltip';
    tooltip.className = 'glossary-tooltip';
    document.body.appendChild(tooltip);
  }

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = Object.keys(glossaryTerms).sort((a, b) => b.length - a.length);

  // Process each topic-content section
  container.querySelectorAll('.topic-content').forEach(section => {
    if (section.dataset.glossaryProcessed) return;
    section.dataset.glossaryProcessed = 'true';

    const processedTerms = new Set();

    // Walk through paragraphs and list items
    section.querySelectorAll('p, li, td').forEach(el => {
      // Skip elements inside code, headings, links, or already-processed terms
      if (el.closest('code, h1, h2, h3, h4, a, .glossary-term, .stat-badge, .callout, .sim-container')) return;

      for (const term of sortedTerms) {
        if (processedTerms.has(term.toLowerCase())) continue;

        // Case-insensitive search in text content
        const regex = new RegExp(`\\b(${escapeRegex(term)})\\b`, 'i');
        const match = el.textContent.match(regex);
        if (!match) continue;

        // Found the term — wrap first occurrence
        processedTerms.add(term.toLowerCase());

        // Use innerHTML replacement carefully
        const htmlRegex = new RegExp(`(?<![<\\w])\\b(${escapeRegex(term)})\\b(?![^<]*>)`, 'i');
        const newHtml = el.innerHTML.replace(htmlRegex, `<span class="glossary-term" data-glossary-term="${escapeHtml(term)}">$1</span>`);

        if (newHtml !== el.innerHTML) {
          el.innerHTML = newHtml;
        }
      }
    });
  });

  // Attach hover handlers (event delegation)
  container.addEventListener('mouseover', (e) => {
    const termEl = e.target.closest('.glossary-term');
    if (!termEl) return;

    const term = termEl.dataset.glossaryTerm;
    const definition = glossaryTerms[term];
    if (!definition) return;

    tooltip.innerHTML = `<strong class="text-blue-600 dark:text-blue-400">${escapeHtml(term)}</strong><br><span class="text-slate-600 dark:text-slate-300">${escapeHtml(definition)}</span>`;

    // Position tooltip
    const rect = termEl.getBoundingClientRect();
    const tooltipWidth = 300;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

    const above = rect.top > 200;
    tooltip.style.left = left + 'px';
    tooltip.style.maxWidth = tooltipWidth + 'px';

    if (above) {
      tooltip.style.top = 'auto';
      tooltip.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
    } else {
      tooltip.style.top = (rect.bottom + 8) + 'px';
      tooltip.style.bottom = 'auto';
    }

    tooltip.classList.add('visible');
  });

  container.addEventListener('mouseout', (e) => {
    const termEl = e.target.closest('.glossary-term');
    if (!termEl) return;
    tooltip.classList.remove('visible');
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
