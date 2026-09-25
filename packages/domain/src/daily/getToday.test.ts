import { describe, expect, it } from 'vitest'
import { getCurrentPhase, getToday } from './getToday'
import type { TodayPractice } from '../types'

const practice: TodayPractice = {
  id: 'practice-1',
  index: 6,
  type: 'ACT',
  title: 'Score your day',
  body: 'List everything you do in a normal day.',
  minutes: 15,
  sourceTitle: 'Atomic Habits',
  sourceAuthor: 'James Clear',
}

describe('getToday', () => {
  it('pending: hasn\'t done anything today, a practice is queued up', () => {
    const result = getToday({
      hadActivityToday: false,
      practice,
      completedPractice: null,
    })

    expect(result).toEqual({
      dayState: 'pending',
      newPractice: practice,
      completedPractice: null,
    })
  })

  it('satisfied: already active today, and today\'s completed practice is known — keep it, not null', () => {
    const result = getToday({
      hadActivityToday: true,
      practice: null,
      completedPractice: practice,
    })

    expect(result).toEqual({
      dayState: 'satisfied',
      newPractice: null,
      completedPractice: practice,
    })
  })

  it('satisfied: active today but no specific completed practice on record (e.g. a quote review) — falls back to null', () => {
    const result = getToday({
      hadActivityToday: true,
      practice: null,
      completedPractice: null,
    })

    expect(result).toEqual({
      dayState: 'satisfied',
      newPractice: null,
      completedPractice: null,
    })
  })

  it('empty: no activity, no practice available at all', () => {
    const result = getToday({
      hadActivityToday: false,
      practice: null,
      completedPractice: null,
    })

    expect(result).toEqual({
      dayState: 'empty',
      newPractice: null,
      completedPractice: null,
    })
  })

  it('satisfied takes priority even when a practice is somehow also present', () => {
    const result = getToday({
      hadActivityToday: true,
      practice,
      completedPractice: practice,
    })

    expect(result.dayState).toBe('satisfied')
    expect(result.newPractice).toBeNull()
  })
})

describe('getCurrentPhase', () => {
  const phases = [
    { id: 'p1', index: 1, name: 'Foundations', startIndex: 1, endIndex: 5 },
    { id: 'p2', index: 2, name: 'Momentum', startIndex: 6, endIndex: 10 },
  ]

  it('finds the phase containing the given index', () => {
    expect(getCurrentPhase(7, phases)?.name).toBe('Momentum')
  })

  it('returns null when no phase contains the index', () => {
    expect(getCurrentPhase(99, phases)).toBeNull()
  })
})
