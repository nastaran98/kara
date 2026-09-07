// Naive cloze selection for long quotes (KARA-45). Recalling a long passage
// verbatim is a losing game; recalling its hinge words is achievable and is
// what actually lets someone produce the idea in conversation.

const CLOZE_WORD_COUNT_THRESHOLD = 25

const MAX_CLOZE_WORDS = 3

// Small, deliberately unambitious — this is a first pass meant to be
// overridden per quote via `clozeWords`, not a real NLP pipeline.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'so', 'because', 'as', 'of',
  'to', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'into', 'over',
  'after', 'before', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'it', 'its', 'that', 'this', 'these', 'those', 'you', 'your',
  'i', 'we', 'they', 'he', 'she', 'them', 'his', 'her', 'our', 'not', 'do',
  'does', 'did', 'have', 'has', 'had', 'what', 'who', 'which', 'when',
  'where', 'than', 'then', 'there', 'here', 'will', 'would', 'can',
  'could', 'should', 'just', 'also', 'more', 'most', 'no', 'yes',
])

function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, '')
}

export function shouldUseCloze(text: string): boolean {
  return words(text).length > CLOZE_WORD_COUNT_THRESHOLD
}

// Picks 2–3 of the longest non-stopword tokens as the cloze targets.
// Ties broken by first appearance; a token already picked isn't picked twice.
export function selectClozeWords(text: string): string[] {
  const candidates = words(text)
    .map((raw) => ({ raw, key: normalize(raw) }))
    .filter(({ key }) => key.length > 0 && !STOPWORDS.has(key))

  const seen = new Set<string>()
  const unique = candidates.filter(({ key }) => {
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const byLengthDesc = [...unique].sort(
    (a, b) => b.key.length - a.key.length,
  )

  // Aim for 3, but never fewer than 2 when the quote has them to give —
  // a quote long enough to qualify for cloze almost always does.
  return byLengthDesc.slice(0, MAX_CLOZE_WORDS).map(({ raw }) => raw)
}

export type ClozeSegment = {
  text: string
  isBlank: boolean
}

// Splits the quote into renderable segments, marking which ones are the
// hidden words — same fragment-stays-in-place interaction as the main
// review reveal (KARA-42), not a flip. Matching is whole-word and
// case-insensitive so "Habits" blanks out for a clozeWord of "habits".
export function getClozeSegments(
  text: string,
  clozeWords: string[],
): ClozeSegment[] {
  if (clozeWords.length === 0) {
    return [{ text, isBlank: false }]
  }

  const targets = new Set(clozeWords.map(normalize))

  const tokens = text.split(/(\s+)/)

  return tokens
    .filter((token) => token.length > 0)
    .map((token) => ({
      text: token,
      isBlank: !/^\s+$/.test(token) && targets.has(normalize(token)),
    }))
}
