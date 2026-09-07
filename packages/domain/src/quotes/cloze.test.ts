import { describe, expect, it } from 'vitest'
import { getClozeSegments, selectClozeWords, shouldUseCloze } from './cloze'

const SHORT_QUOTE = 'The only way to do great work is to love what you do.'

const LONG_QUOTE =
  'We are what we repeatedly do. Excellence, then, is not an act, but a habit. ' +
  'The things you do consistently, the tiny decisions that seem to mean nothing ' +
  'on any given day, are the things that quietly determine who you become over time.'

describe('shouldUseCloze', () => {
  it('a quote under 25 words never triggers cloze', () => {
    expect(SHORT_QUOTE.split(/\s+/).length).toBeLessThan(25)
    expect(shouldUseCloze(SHORT_QUOTE)).toBe(false)
  })

  it('a quote over 25 words triggers cloze', () => {
    expect(LONG_QUOTE.split(/\s+/).length).toBeGreaterThan(25)
    expect(shouldUseCloze(LONG_QUOTE)).toBe(true)
  })
})

describe('selectClozeWords', () => {
  it('picks 2-3 non-stopword tokens, longest first', () => {
    const words = selectClozeWords(LONG_QUOTE)

    expect(words.length).toBeGreaterThanOrEqual(2)
    expect(words.length).toBeLessThanOrEqual(3)

    // none of the picks should be a stopword
    for (const word of words) {
      expect(['the', 'we', 'is', 'a', 'an', 'do']).not.toContain(
        word.toLowerCase(),
      )
    }
  })
})

describe('getClozeSegments', () => {
  it('marks manually-set clozeWords as blanks and leaves the rest visible', () => {
    const segments = getClozeSegments(
      'Excellence is not an act, but a habit.',
      ['Excellence', 'habit'],
    )

    const blanks = segments.filter((segment) => segment.isBlank)
    expect(blanks.map((segment) => segment.text)).toEqual([
      'Excellence',
      'habit.',
    ])

    // reassembling the segments reproduces the original text
    expect(segments.map((segment) => segment.text).join('')).toBe(
      'Excellence is not an act, but a habit.',
    )
  })

  it('matches whole words case-insensitively', () => {
    const segments = getClozeSegments('Habits shape identity.', ['habits'])

    expect(
      segments.find((segment) => segment.text === 'Habits')?.isBlank,
    ).toBe(true)
  })

  it('returns the full text as one non-blank segment when no words are given', () => {
    expect(getClozeSegments(SHORT_QUOTE, [])).toEqual([
      { text: SHORT_QUOTE, isBlank: false },
    ])
  })
})
