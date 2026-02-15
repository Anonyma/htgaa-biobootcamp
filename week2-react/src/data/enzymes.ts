export interface Enzyme {
  name: string;
  recognition: string;
  cutSense: number;
  cutAnti: number;
  overhang: 'blunt' | 'sticky-5prime' | 'sticky-3prime';
  temperature: number;
  buffer: string;
  source: string;
  notes: string;
}

export const enzymes: Enzyme[] = [
  { name: "EcoRI", recognition: "GAATTC", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "EcoRI Buffer", source: "Escherichia coli RY13", notes: "Most commonly used restriction enzyme. Leaves 4-base 5' overhang." },
  { name: "HindIII", recognition: "AAGCTT", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "NEBuffer 2.1", source: "Haemophilus influenzae Rd", notes: "Leaves 4-base 5' overhang (AGCT)." },
  { name: "BamHI", recognition: "GGATCC", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "BamHI Buffer", source: "Bacillus amyloliquefaciens H", notes: "Leaves 4-base 5' overhang (GATC). Compatible ends with BglII, BclI, MboI." },
  { name: "KpnI", recognition: "GGTACC", cutSense: 5, cutAnti: 1, overhang: "sticky-3prime", temperature: 37, buffer: "NEBuffer 1.1", source: "Klebsiella pneumoniae OK8", notes: "Leaves 4-base 3' overhang. One of few common enzymes producing 3' overhangs." },
  { name: "EcoRV", recognition: "GATATC", cutSense: 3, cutAnti: 3, overhang: "blunt", temperature: 37, buffer: "NEBuffer 3.1", source: "Escherichia coli J62 pLG74", notes: "Produces blunt ends. Useful for blunt-end cloning." },
  { name: "SacI", recognition: "GAGCTC", cutSense: 5, cutAnti: 1, overhang: "sticky-3prime", temperature: 37, buffer: "NEBuffer 1.1", source: "Streptomyces achromogenes", notes: "Leaves 4-base 3' overhang." },
  { name: "SalI", recognition: "GTCGAC", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "NEBuffer 3.1", source: "Streptomyces albus G", notes: "Leaves 4-base 5' overhang (TCGA). Compatible ends with XhoI." },
  { name: "NotI", recognition: "GCGGCCGC", cutSense: 2, cutAnti: 6, overhang: "sticky-5prime", temperature: 37, buffer: "NEBuffer 3.1", source: "Nocardia otitidis-caviarum", notes: "8-base cutter (rare cutter). Useful for mapping large DNA fragments." },
  { name: "XhoI", recognition: "CTCGAG", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "NEBuffer 3.1", source: "Xanthomonas holcicola", notes: "Leaves 4-base 5' overhang (TCGA). Compatible ends with SalI." },
  { name: "PstI", recognition: "CTGCAG", cutSense: 5, cutAnti: 1, overhang: "sticky-3prime", temperature: 37, buffer: "NEBuffer 3.1", source: "Providencia stuartii 164", notes: "Leaves 4-base 3' overhang." },
  { name: "SmaI", recognition: "CCCGGG", cutSense: 3, cutAnti: 3, overhang: "blunt", temperature: 25, buffer: "NEBuffer 4", source: "Serratia marcescens Sb", notes: "Produces blunt ends. Optimal temperature 25 C (not 37 C)." },
  { name: "XbaI", recognition: "TCTAGA", cutSense: 1, cutAnti: 5, overhang: "sticky-5prime", temperature: 37, buffer: "NEBuffer 2.1", source: "Xanthomonas badrii", notes: "Leaves 4-base 5' overhang (CTAG)." },
];

export const LAMBDA_EXCERPT = 'GACCTGAATTCAAAGGATCCGAATTCTAGAAGCTTGATATCGTCGACGAGCTCGGTACCTTAAGAATTCGGCC';
