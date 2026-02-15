import { Chrono } from 'react-chrono';

export function HistoryTimeline() {
  const items = [
    {
      title: "1977",
      cardTitle: "Sanger Sequencing",
      cardSubtitle: "The First Generation",
      cardDetailedText: "Frederick Sanger develops the chain-termination method, allowing the first accurate reading of DNA sequences. This method dominated for 30 years and won him a Nobel Prize."
    },
    {
      title: "1990",
      cardTitle: "Human Genome Project Begins",
      cardSubtitle: "The Big Science Era",
      cardDetailedText: "An international research effort to sequence and map all of the genes - together known as the genome - of members of our species, Homo sapiens."
    },
    {
      title: "2003",
      cardTitle: "Completion of HGP",
      cardSubtitle: "3 Billion Base Pairs",
      cardDetailedText: "The project was completed two years ahead of schedule. The total cost was approx $3 billion, or ~$1 per base pair."
    },
    {
      title: "2005",
      cardTitle: "Next-Generation Sequencing (NGS)",
      cardSubtitle: "454 Life Sciences & Solexa",
      cardDetailedText: "Introduction of massively parallel sequencing. Solexa (later acquired by Illumina) introduced the bridge amplification and reversible terminator chemistry that dominates today."
    },
    {
      title: "2014",
      cardTitle: "The $1,000 Genome",
      cardSubtitle: "Illumina HiSeq X Ten",
      cardDetailedText: "Illumina announced the HiSeq X Ten system, delivering the first $1,000 genome, making population-scale genomics a reality."
    },
    {
      title: "2016",
      cardTitle: "Nanopore Sequencing",
      cardSubtitle: "Oxford Nanopore MinION",
      cardDetailedText: "The first portable, real-time sequencer. It reads DNA by measuring changes in electrical conductivity as the strand passes through a biological pore."
    },
    {
      title: "2022",
      cardTitle: "The $100 Genome?",
      cardSubtitle: "Ultima & Element Biosciences",
      cardDetailedText: "New entrants promise to drive costs down even further, potentially reaching the $100 genome benchmark and democratizing access to clinical genomics."
    }
  ];

  return (
    <div className="w-full h-[600px] flex items-center justify-center font-sans">
      <div className="w-full h-full max-w-5xl">
        <Chrono
          items={items}
          mode="HORIZONTAL"
          disableNavOnKey={false}
          theme={{
            primary: '#3b82f6', // Tailwind blue-500
            secondary: '#eff6ff', // Tailwind blue-50
            cardBgColor: '#ffffff',
            cardForeColor: '#334155',
            titleColor: '#0f172a',
            titleColorActive: '#1e40af',
          }}
          slideShow
          slideItemDuration={4000}
          cardHeight={200} // Custom type fix might be needed here depending on version, but standard prop
        />
      </div>
    </div>
  );
}
