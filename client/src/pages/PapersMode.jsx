import React, { useState } from 'react';

const SECTIONS = [
  {
    id: 'framework',
    icon: '𓏏',
    label: 'Framework & Theory',
    papers: [
      {
        id: 1, title: 'Symbolic Stabilization as Civilizational Precursor', year: '2019',
        desc: 'The foundational DSSM thesis. Civilization is not invented — it is rehearsed. Demonstrates through cross-cultural comparison that symbolic saturation precedes and causes monumentality, writing, and state formation by centuries to millennia across every documented civilizational emergence.',
      },
      {
        id: 2, title: 'The Four-Stage Model of Symbolic Emergence', year: '2020',
        desc: 'Formal definition of the four DSSM stages with archaeological detection rules, duration windows, and CV thresholds. Introduces stage-specific neural substrates and material signatures. Establishes the canonical framework used in all subsequent DSSM analysis.',
      },
      {
        id: 3, title: 'The P7 Threshold: Community Size and Symbolic Externalization', year: '2020',
        desc: 'Analysis of why ~500 individuals marks the Stage 2→3 transition. At this population size, face-to-face coordination breaks down and symbolic systems must externalize into durable material substrates to maintain social coherence. Cross-validates against 11 independent civilizational sequences.',
      },
      {
        id: 4, title: 'Four Predicted Outcomes of Stage 4 Saturation', year: '2021',
        desc: 'Documents the four convergent outcomes when a symbolic system achieves full Stage 4: writing (in one of five functional forms), monumental architecture, proto-state administration, and collapse-resilience via symbolic redundancy. None of the four outcomes are inevitable — all four are predictable.',
      },
      {
        id: 5, title: 'Falsification Conditions for the Deep Symbolic Systems Model', year: '2021',
        desc: 'Establishes the empirical conditions that would falsify DSSM predictions: sites achieving Stage 3–4 without documented Stage 1–2 groundwork; writing emerging without prior portable anchor systems; monumentality appearing before symbolic saturation. No confirmed exceptions found in the literature as of 2023.',
      },
      {
        id: 6, title: 'DSSM and Standard Archaeological Models: A Comparative Analysis', year: '2022',
        desc: 'Situates the Deep Symbolic Systems Model within existing theoretical frameworks including social complexity theory, niche construction theory, and material engagement theory. Argues DSSM offers superior predictive power by treating symbolic behavior as causally primary rather than epiphenomenal.',
      },
    ],
  },
  {
    id: 'cognitive',
    icon: '𓂀',
    label: 'Cognitive Foundations',
    papers: [
      {
        id: 7, title: 'Working Memory Enhancement and the Origins of Proto-Symbolic Behavior', year: '2019',
        desc: 'Examines the neurological basis of Stage 1 behaviors. Ochre use, perforated shell ornaments, and geometric engraving correlate with enhanced episodic specificity and working memory consolidation. Proposes the Enhanced Working Memory Hypothesis as the cognitive engine of Stage 1.',
      },
      {
        id: 8, title: 'Pattern Completion and Procedural Memory in Ritualized Symbolic Repetition', year: '2020',
        desc: 'Stage 2 neural substrate analyzed through the lens of procedural memory consolidation and pattern completion circuits. High-fidelity ritual repetition reduces cognitive load and enables symbolic transmission across generations without writing or formal instruction.',
      },
      {
        id: 9, title: 'Cross-Modal Binding: The Neuroscience of Integrated Symbolic Systems', year: '2020',
        desc: 'Argues that Stage 3 emergence correlates with integration of visual, haptic, and auditory symbolic channels into unified cognitive schemas. Cross-modal binding enables architectural symbolism: a building becomes a mnemonic device only when multiple sensory channels reinforce the same symbolic content.',
      },
      {
        id: 10, title: 'The Coefficient of Variation as a Standardization Metric in Symbolic Archaeology', year: '2021',
        desc: 'Methodological paper establishing CV < 0.25 as the primary Stage 2 diagnostic and CV < 0.15 as the Stage 3 transition signal. Validated across six independent archaeological assemblages spanning 70,000 years. The CV approach transforms qualitative stage assessment into a quantitative measurement.',
      },
      {
        id: 11, title: 'Episodic Specificity and the Origins of Symbolic Meaning-Making', year: '2021',
        desc: 'Traces the emergence of meaning-making from episodic memory specificity. Sites with ochre use show evidence of memory-enhancement rituals tied to place-specific symbolic behaviors. Proposes that place-memory fusion is the cognitive foundation of all later territorial symbolism.',
      },
      {
        id: 12, title: 'Cognitive Load and the P7 Threshold: Why Face-to-Face Coordination Has a Ceiling', year: '2022',
        desc: 'Interdisciplinary paper connecting cognitive load theory with DSSM population thresholds. Demonstrates why symbolic externalization becomes mandatory at ~500 individuals: beyond this size, the cognitive cost of maintaining shared symbolic knowledge through face-to-face interaction exceeds available mental bandwidth.',
      },
    ],
  },
  {
    id: 'africa',
    icon: '𓃭',
    label: 'African Origins',
    papers: [
      {
        id: 13, title: 'Blombos Cave: The Earliest Documented Symbolic Record (100,000–70,000 BCE)', year: '2019',
        desc: 'Comprehensive DSSM analysis of the Blombos Cave assemblage. Ochre processing kits, engraved geometric ochre, and standardized shell beads constitute a complete Stage 1 signature. The assemblage predates any other known symbolic behavior by at least 30,000 years and establishes Africa as the definitive origin point of symbolic cognition.',
      },
      {
        id: 14, title: 'Pinnacle Point and the Emergence of Ochre Culture at 164,000 BCE', year: '2020',
        desc: 'Analysis of ochre use at Pinnacle Point, South Africa, as the earliest known Stage 1 evidence in the archaeological record. Situates this within the broader African Middle Stone Age symbolic revolution and argues that coastal resource predictability provided the ecological preconditions for sustained symbolic behavior.',
      },
      {
        id: 15, title: 'Qafzeh and the Levantine Symbolic Corridor at 90,000 BCE', year: '2020',
        desc: 'Documents shell ornament evidence at Qafzeh, Israel, connecting African symbolic origins with Levantine dispersal pathways. Stage 1 signatures in the earliest anatomically modern human populations outside Africa confirm that symbolic behavior was not an invention of the Out-of-Africa migration but an inheritance carried from it.',
      },
      {
        id: 16, title: 'The Forager-Mnemonic Pathway: Explaining Africa\'s Non-Urban Symbolic Traditions', year: '2021',
        desc: 'Addresses the paradox of Africa having the world\'s oldest symbolic record without producing independent urban civilizations. Demonstrates that Stage 2 can persist indefinitely without P7 threshold crossing. The forager-mnemonic pathway represents a stable cultural equilibrium — not failure, but an alternative symbolic endpoint.',
      },
      {
        id: 17, title: 'Australia\'s 65,000-Year Stage 2: The Longest Symbolic Tradition Without Urbanization', year: '2022',
        desc: 'Documents the extraordinary case of Australia as a Stage 2 steady-state system persisting for 65,000+ years — the world\'s longest continuous symbolic tradition. The absence of settled agriculture and P7 threshold sites explains the absence of Stage 3–4 outcomes. Australia is the definitive control case for DSSM theory.',
      },
    ],
  },
  {
    id: 'neareast',
    icon: '𓇼',
    label: 'Near East & Anatolia',
    papers: [
      {
        id: 18, title: 'Göbekli Tepe: Monumentality Without Prior Stage 2 Evidence?', year: '2019',
        desc: 'Critical re-examination of Göbekli Tepe through the DSSM lens. Argues the monument is not an anomaly but sits within a documented regional Stage 2 symbolic tradition that has not yet been fully excavated. The carved T-pillars represent Stage 2 portable anchor logic expressed at monumental scale — not Stage 3.',
      },
      {
        id: 19, title: 'Çatalhöyük: A Complete Stage 3 System Without Writing', year: '2020',
        desc: 'Detailed analysis of Çatalhöyük as the clearest example of Stage 3 symbolic saturation: murals, bull bucrania, standardized figurines, and domestic ritual sustained for 1,400 years without proceeding to writing or state formation. Confirms that Stage 4 outcomes are contingent, not inevitable.',
      },
      {
        id: 20, title: 'The Halafian Geometric Program: Mathematical Cognition Before Writing (6200–5500 BCE)', year: '2020',
        desc: 'Documents the Halafian pottery tradition as Stage 2 operating at the highest known standardization level (CV = 0.12). The flower petal count arithmetic (4, 8, 16, 32, 64) demonstrates systematic mathematical cognition 3,000 years before Sumerian numeracy. Stage 2 is intellectually rich — not a primitive precursor.',
      },
      {
        id: 21, title: 'Ubaid and the Emergence of Long-Distance Symbolic Networks (5900–4200 BCE)', year: '2021',
        desc: 'Analyzes the Ubaid horizon as the Stage 2→3 transition in Mesopotamia. First monumental temples, long-distance exchange networks, and social stratification emerge as symbolic systems cross the P7 threshold simultaneously across the Fertile Crescent. The Ubaid horizon represents Stage 3 going regional.',
      },
      {
        id: 22, title: 'Uruk: The World\'s First Stage 4 City (4000–3100 BCE)', year: '2021',
        desc: 'Full DSSM analysis of Uruk as the prototypical Stage 4 system. Population of ~80,000 at peak, administrative cuneiform writing, cylinder seal bureaucracy, and ziggurat monumentality analyzed through the four-stage lens. Uruk demonstrates that Stage 4 is an emergent system property, not a design.',
      },
      {
        id: 23, title: 'Shamanic Anchor or Communal Stabilizer: Göbekli Tepe Revisited', year: '2022',
        desc: 'Updated analysis of Göbekli Tepe\'s function within the DSSM framework. Proposes that the site served as a communal symbolic anchor — Stage 2 made temporarily monumental through seasonal aggregation — rather than a shamanic ritual center. The enclosures were not built to last; they were buried deliberately.',
      },
    ],
  },
  {
    id: 'egypt',
    icon: '𓊪',
    label: 'Egypt & North Africa',
    papers: [
      {
        id: 24, title: 'Qurta Petroglyphs and Stage 1 Symbolic Behavior in the Nile Valley (~10,000 BCE)', year: '2021',
        desc: 'Analysis of the Qurta petroglyphs as the earliest Nile Valley symbolic evidence. Figurative animal representations scored at FCP 3/12, confirming Stage 1 presence in the Nile corridor millennia before the Badarian ceramic tradition. Establishes the Nile Valley symbolic sequence as one of the best-documented DSSM progressions.',
      },
      {
        id: 25, title: 'The Badarian Ceramic Tradition: Stage 2 Groundwork on the Nile (5000–4000 BCE)', year: '2021',
        desc: 'Documents the Badarian period as the critical Stage 2 foundation for Egyptian civilization. First standardized ceramic tradition on the Nile, scored at FCP 4.5/12. Badarian ripple-burnished ware demonstrates CV-measurable symbolic standardization 2,000 years before Naqada expansion.',
      },
      {
        id: 26, title: 'Naqada I–II: Full Symbolic Saturation and the Predynastic Expansion (4000–3100 BCE)', year: '2022',
        desc: 'Comprehensive analysis of the Naqada sequence as Stage 3 completion. Painted pottery, prestige goods, burial differentiation, and inter-regional expansion analyzed through FCP scoring (8.5/12). The Naqada sequence represents the clearest documented case of Stage 3 building toward Stage 4 in the global archaeological record.',
      },
      {
        id: 27, title: 'Dynasty I and the Preservative Function of Egyptian Hieroglyphs', year: '2022',
        desc: 'Argues contra conventional theory that Egyptian hieroglyphic writing emerged as a preservative cap on an already-saturated Stage 3 symbolic system — not as a management tool for new administrative complexity. Writing froze what symbolic tradition had already established. Outcome 3 of the four Stage 4 outcomes.',
      },
      {
        id: 28, title: 'The Old Kingdom Pyramid Builders: Stage 4 Material Expression at Scale', year: '2023',
        desc: 'Analyzes the Old Kingdom (2700–2200 BCE) as the fullest expression of a Stage 4 DSSM system. The Great Pyramid interpreted as symbolic architecture expressing a symbolically saturated civilization — not an administrative achievement or labor-management showcase. Stage 4 builds monuments because it must, not because it can.',
      },
    ],
  },
  {
    id: 'asia',
    icon: '𓆏',
    label: 'South & East Asia',
    papers: [
      {
        id: 29, title: 'Mehrgarh IB: Stage 3 Entry at 6000 BCE in the Indus Corridor', year: '2020',
        desc: 'Documents Mehrgarh\'s Stage 3 transition through figurine production, standardized ornaments, and settlement nucleation. The earliest well-documented Stage 3 entry in South Asia, predating the Harappan Civilization by 3,500 years. Confirms DSSM\'s requirement that Stage 4 urban systems have deep Stage 1–3 roots.',
      },
      {
        id: 30, title: 'The Mehrgarh Sequence: 7,000 Years of Continuous Symbolic Accumulation (7000–4000 BCE)', year: '2021',
        desc: 'Extended analysis of the Mehrgarh occupation as the longest documented Stage 1–3 progression in the archaeological record. Demonstrates the gradualist nature of DSSM stage transitions: no sudden symbolic revolution, only accumulating stabilization. Mehrgarh is DSSM\'s most complete sequential case study.',
      },
      {
        id: 31, title: 'From Mehrgarh to Mohenjo-Daro: The Indus Valley Civilization as DSSM Stage 4', year: '2021',
        desc: 'Traces the complete DSSM arc from Mehrgarh\'s Stage 1 origins through full Harappan Stage 4. Notable for a Stage 4 system that developed without evidence of monumental royal authority, conquest ideology, or divine kingship — challenging assumptions about what Stage 4 necessarily looks like.',
      },
      {
        id: 32, title: 'Sri Lanka Microlithic Tradition: CV = 4.7% Over 20,000 Years — A Stage 2 Steady State', year: '2022',
        desc: 'Presents Sri Lanka\'s microlithic tradition as a documented Stage 2 steady-state system. Remarkable standardization (CV = 4.7%) maintained for 20,000 years without Stage 3 transition. The absence of P7 threshold sites across the island explains the absence of Stage 3 outcomes despite sophisticated symbolic production.',
      },
      {
        id: 33, title: 'Dragon-Turtle and Jade Bi: Stage 2 Symbolic Programs in Chinese Neolithic Communities', year: '2022',
        desc: 'Analysis of Chinese Neolithic sites (Jiahu, Hongshan, Liangzhu) as Stage 2 systems with distinctive portable anchor objects. Dragon-turtle oracle bones and jade bi discs function as Stage 2 symbolic anchors — portable, high-fidelity, cosmologically charged — preceding Shang Dynasty Stage 4 by 3,000 years.',
      },
    ],
  },
  {
    id: 'methodology',
    icon: '𓈖',
    label: 'Methodology & Field Tools',
    papers: [
      {
        id: 34, title: 'The Field Companion Protocol: A 12-Axis Symbolic Scoring System for DSSM Stage Assessment', year: '2022',
        desc: 'Technical methodology paper introducing the FCP 2D scoring system. Defines 12 weighted axes across material, cognitive, and social dimensions for quantitative DSSM stage assessment. The FCP converts qualitative archaeological description into a reproducible score (0–12) enabling cross-site comparison.',
      },
      {
        id: 35, title: 'Satellite and LiDAR Integration for Archaeological Stage Prediction', year: '2022',
        desc: 'Technical paper on remote sensing methodologies adapted for DSSM analysis. Demonstrates how satellite multispectral imagery and LiDAR terrain data identify Stage 2–3 transition signatures at landscape scale: settlement nucleation patterns, midden deposits, and architectural regularization visible from orbit.',
      },
      {
        id: 36, title: 'Excavation Zone Prediction: From Symbolic Landscape Signatures to Ground Truth', year: '2023',
        desc: 'Validates the satellite prediction methodology against excavated sites. Reports 78% accuracy in predicting primary deposit locations across 14 test sites in the Near East and South Asia. Establishes the DSSM satellite predictor as a cost-effective pre-excavation tool for resource-limited field teams.',
      },
      {
        id: 37, title: 'The DSSM Reasoning Engine: AI-Assisted Archaeological Analysis Using Large Language Models', year: '2023',
        desc: 'Technical paper describing the architecture of the DSSM Intelligence System. Discusses structured knowledge base injection, multi-mode querying, FCP scoring automation, and satellite integration. Argues that AI-assisted DSSM analysis democratizes access to the framework for researchers without specialist training in symbolic archaeology.',
      },
    ],
  },
];

const s = {
  page: { paddingTop: '0.5rem' },
  header: {
    textAlign: 'center',
    padding: '1.5rem 0 1rem',
    borderBottom: '1px solid #2d1800',
    marginBottom: '1.25rem',
  },
  glyph: { fontSize: '2rem', display: 'block', marginBottom: '0.4rem', opacity: 0.85 },
  title: { color: '#d4a017', fontSize: '1.35rem', fontWeight: 'bold', letterSpacing: '0.08em', marginBottom: '0.25rem' },
  subtitle: { color: '#6b5030', fontSize: '0.78rem', letterSpacing: '0.06em', fontStyle: 'italic' },

  navWrap: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
    padding: '0.75rem',
    background: '#110900',
    border: '1px solid #2d1800',
    borderRadius: '10px',
  },
  navBtn: (active) => ({
    padding: '0.45rem 0.9rem',
    background: active ? 'linear-gradient(135deg, #3d2000, #5c3300)' : 'transparent',
    border: active ? '1px solid #d4a017' : '1px solid #2d1800',
    borderRadius: '6px',
    color: active ? '#f0c040' : '#7a6040',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontFamily: 'inherit',
    letterSpacing: '0.05em',
    fontWeight: active ? 'bold' : 'normal',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  }),

  sectionHeader: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.6rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #2d1800',
  },
  sectionTitle: { color: '#e8d5a3', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.06em' },
  sectionCount: { color: '#5a4020', fontSize: '0.75rem' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '0.65rem',
  },

  paperWrap: { position: 'relative' },

  paperCard: (hovered) => ({
    background: hovered ? '#201200' : '#150c00',
    border: hovered ? '1px solid #d4a017' : '1px solid #2d1800',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    cursor: 'default',
    transition: 'all 0.18s',
    boxShadow: hovered ? '0 0 16px rgba(212,160,23,0.12)' : 'none',
  }),

  paperTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.45rem',
  },
  paperNum: {
    fontSize: '0.65rem',
    color: '#5a4020',
    letterSpacing: '0.08em',
    fontFamily: "'Courier New', monospace",
  },
  paperYear: {
    fontSize: '0.65rem',
    color: '#5a4020',
    fontFamily: "'Courier New', monospace",
  },
  paperTitle: {
    color: '#d4a017',
    fontSize: '0.82rem',
    lineHeight: '1.4',
    fontWeight: 'bold',
  },

  tooltip: {
    position: 'absolute',
    bottom: 'calc(100% + 10px)',
    left: 0,
    right: 0,
    background: '#1a0d00',
    border: '1px solid #8b6914',
    borderRadius: '8px',
    padding: '0.8rem 0.9rem',
    color: '#c8a870',
    fontSize: '0.76rem',
    lineHeight: '1.65',
    zIndex: 100,
    pointerEvents: 'none',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.7)',
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: '-6px',
    left: '24px',
    width: '10px',
    height: '10px',
    background: '#1a0d00',
    border: '1px solid #8b6914',
    borderTop: 'none',
    borderLeft: 'none',
    transform: 'rotate(45deg)',
  },
};

export default function PapersMode() {
  const [activeSection, setActiveSection] = useState('framework');
  const [hoveredId, setHoveredId]         = useState(null);

  const section = SECTIONS.find(sec => sec.id === activeSection);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.glyph}>𓂀</span>
        <div style={s.title}>PAPER LIBRARY</div>
        <div style={s.subtitle}>37 encoded papers · the Deep Symbolic Systems Model · Anthony Vondoom</div>
      </div>

      <div style={s.navWrap}>
        {SECTIONS.map(sec => (
          <button
            key={sec.id}
            style={s.navBtn(activeSection === sec.id)}
            onClick={() => { setActiveSection(sec.id); setHoveredId(null); }}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      <div style={s.sectionHeader}>
        <div style={s.sectionTitle}>{section.icon} {section.label}</div>
        <div style={s.sectionCount}>{section.papers.length} papers — hover to read abstract</div>
      </div>

      <div style={s.grid}>
        {section.papers.map(paper => (
          <div
            key={paper.id}
            style={s.paperWrap}
            onMouseEnter={() => setHoveredId(paper.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {hoveredId === paper.id && (
              <div style={s.tooltip}>
                {paper.desc}
                <div style={s.tooltipArrow} />
              </div>
            )}
            <div style={s.paperCard(hoveredId === paper.id)}>
              <div style={s.paperTop}>
                <span style={s.paperNum}>PAPER {paper.id}</span>
                <span style={s.paperYear}>{paper.year}</span>
              </div>
              <div style={s.paperTitle}>{paper.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
