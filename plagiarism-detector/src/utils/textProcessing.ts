// Sample reference texts for our demonstration
export const REFERENCE_TEXTS = [
  "Artificial intelligence is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction.",
  "Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.",
  "Natural Language Processing is a branch of artificial intelligence that deals with the interaction between computers and humans using natural language.",
  "Deep learning is part of a broader family of machine learning methods based on artificial neural networks with representation learning.",
  "Computer vision is an interdisciplinary field that deals with how computers can gain high-level understanding from digital images or videos.",
];

// Simple text similarity function using Dice's coefficient
export function compareTwoStrings(str1: string, str2: string): number {
  // Quick check for identical strings or null inputs
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // Convert to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  // Convert strings to sets of character pairs (bigrams)
  const pairs1 = extractBigrams(s1);
  const pairs2 = extractBigrams(s2);

  // Find intersection and calculate Dice's coefficient
  const intersection = new Set([...pairs1].filter(pair => pairs2.has(pair)));
  const dice = (2 * intersection.size) / (pairs1.size + pairs2.size);

  return dice;
}

// Helper function to extract bigrams from a string
function extractBigrams(str: string): Set<string> {
  const bigrams = new Set<string>();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.substring(i, i + 2));
  }
  return bigrams;
}

// Simple tokenizer for browser use
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

// Simple stemmer for browser use (very basic implementation)
export function stem(word: string): string {
  const lowerWord = word.toLowerCase();

  // Remove common suffixes (very basic implementation)
  const suffixes = ['ing', 'ly', 'ed', 's', 'er', 'est', 'es'];

  for (const suffix of suffixes) {
    if (lowerWord.length > suffix.length + 3 && lowerWord.endsWith(suffix)) {
      return lowerWord.slice(0, lowerWord.length - suffix.length);
    }
  }

  return lowerWord;
}

// Function to analyze text for plagiarism
export function analyzePlagiarism(text: string) {
  const processedText = text.toLowerCase();

  // Compare with reference texts
  const matches = REFERENCE_TEXTS.map((refText, index) => {
    const similarity = compareTwoStrings(processedText, refText.toLowerCase());
    return {
      id: index,
      score: similarity,
      text: refText,
    };
  }).sort((a, b) => b.score - a.score);

  // Calculate overall plagiarism score based on highest match
  const plagiarismScore = Math.round(matches[0].score * 100);

  // Create highlighted text
  const tokens = tokenize(text);
  const highlightedParts: string[] = [];

  for (const token of tokens) {
    const tokenStem = stem(token.toLowerCase());

    // Check if token appears in high-similarity reference texts
    const isPlagiarized = matches
      .filter(m => m.score > 0.3)
      .some(match => {
        const refTokens = tokenize(match.text.toLowerCase());
        return refTokens.some(refToken =>
          stem(refToken) === tokenStem
        );
      });

    if (isPlagiarized) {
      highlightedParts.push(`<mark>${token}</mark>`);
    } else {
      highlightedParts.push(token);
    }
  }

  const highlightedText = highlightedParts.join(' ');

  return {
    plagiarismScore,
    highlightedText,
    matchedSources: matches.filter(m => m.score > 0.1),
  };
}
