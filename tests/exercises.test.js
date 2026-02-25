/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals'
import {
  getExercises,
  addExercise,
  deleteExercise,
  getItems,
} from '../scripts/storage/exercises.js'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeExercise(overrides = {}) {
  return {
    id: 'ex-1',
    name: 'Push Up',
    category: 'Strength',
    muscles: ['Chest', 'Triceps'],
    ...overrides,
  }
}

// ─── Setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()

  // Silence window.confirm noise in tests — default to true (confirmed)
  window.confirm = jest.fn(() => true)

  // Silence document.dispatchEvent noise — still works, just suppressed
  jest.spyOn(document, 'dispatchEvent')
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ─── CRUD: getExercises ──────────────────────────────────────────────────────

describe('getExercises', () => {
  test('returns empty array when localStorage is empty', () => {
    expect(getExercises()).toEqual([])
  })

  test('returns parsed exercises from localStorage', () => {
    const exercises = [
      makeExercise(),
      makeExercise({ id: 'ex-2', name: 'Squat' }),
    ]
    localStorage.setItem('exercises', JSON.stringify(exercises))
    expect(getExercises()).toEqual(exercises)
  })

  test('returns empty array when localStorage value is null', () => {
    localStorage.removeItem('exercises')
    expect(getExercises()).toEqual([])
  })
})

// ─── CRUD: addExercise ───────────────────────────────────────────────────────

describe('addExercise', () => {
  test('adds a new exercise to an empty list', () => {
    const exercise = makeExercise()
    addExercise(exercise)
    expect(getExercises()).toHaveLength(1)
    expect(getExercises()[0]).toEqual(exercise)
  })

  test('adds multiple exercises and preserves all of them', () => {
    addExercise(makeExercise({ id: 'ex-1', name: 'Push Up' }))
    addExercise(makeExercise({ id: 'ex-2', name: 'Squat' }))
    addExercise(makeExercise({ id: 'ex-3', name: 'Lunge' }))
    expect(getExercises()).toHaveLength(3)
  })

  test('returns the exercise that was added', () => {
    const exercise = makeExercise()
    const result = addExercise(exercise)
    expect(result).toEqual(exercise)
  })

  test('persists exercise to localStorage', () => {
    const exercise = makeExercise()
    addExercise(exercise)
    const stored = JSON.parse(localStorage.getItem('exercises'))
    expect(stored).toEqual([exercise])
  })

  test('dispatches exercisesUpdated event after adding', () => {
    addExercise(makeExercise())
    expect(document.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'exercisesUpdated' })
    )
  })
})

// ─── CRUD: deleteExercise ────────────────────────────────────────────────────

describe('deleteExercise', () => {
  test('deletes exercise by id when user confirms', () => {
    window.confirm = jest.fn(() => true)
    addExercise(makeExercise({ id: 'ex-1' }))
    addExercise(makeExercise({ id: 'ex-2', name: 'Squat' }))

    const result = deleteExercise('ex-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-2')
  })

  test('does not delete when user cancels confirmation', () => {
    window.confirm = jest.fn(() => false)
    addExercise(makeExercise({ id: 'ex-1' }))

    const result = deleteExercise('ex-1')
    // Returns current list unchanged
    expect(result).toHaveLength(1)
  })

  test('returns updated list after deletion', () => {
    window.confirm = jest.fn(() => true)
    addExercise(makeExercise({ id: 'ex-1' }))
    addExercise(makeExercise({ id: 'ex-2', name: 'Squat' }))
    addExercise(makeExercise({ id: 'ex-3', name: 'Lunge' }))

    const result = deleteExercise('ex-2')
    expect(result).toHaveLength(2)
    expect(result.find((ex) => ex.id === 'ex-2')).toBeUndefined()
  })

  test('returns full list unchanged when id does not exist', () => {
    window.confirm = jest.fn(() => true)
    addExercise(makeExercise({ id: 'ex-1' }))

    const result = deleteExercise('nonexistent-id')
    expect(result).toHaveLength(1)
  })

  test('dispatches exercisesUpdated event after deletion', () => {
    window.confirm = jest.fn(() => true)
    addExercise(makeExercise({ id: 'ex-1' }))
    deleteExercise('ex-1')
    expect(document.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'exercisesUpdated' })
    )
  })

  test('does NOT dispatch event when user cancels', () => {
    window.confirm = jest.fn(() => false)
    addExercise(makeExercise({ id: 'ex-1' }))
    document.dispatchEvent.mockClear()
    deleteExercise('ex-1')
    expect(document.dispatchEvent).not.toHaveBeenCalled()
  })
})

// ─── Data Manipulation: getItems ─────────────────────────────────────────────

describe('getItems', () => {
  test('returns empty array when no items in localStorage', () => {
    expect(getItems()).toEqual([])
  })

  test('returns items sorted by createdAt descending (newest first)', () => {
    const items = [
      { id: '1', name: 'Oldest', createdAt: 1000 },
      { id: '2', name: 'Newest', createdAt: 3000 },
      { id: '3', name: 'Middle', createdAt: 2000 },
    ]
    localStorage.setItem('items', JSON.stringify(items))

    const result = getItems()
    expect(result[0].name).toBe('Newest')
    expect(result[1].name).toBe('Middle')
    expect(result[2].name).toBe('Oldest')
  })

  test('returns single item as array', () => {
    const items = [{ id: '1', name: 'Solo', createdAt: 1000 }]
    localStorage.setItem('items', JSON.stringify(items))
    expect(getItems()).toHaveLength(1)
  })
})

// ─── Validation tests ────────────────────────────────────────────────────────

describe('Data validation behaviour', () => {
  test('addExercise stores exercise with all expected fields intact', () => {
    const exercise = makeExercise({
      id: 'ex-99',
      name: 'Deadlift',
      category: 'Strength',
      muscles: ['Back', 'Legs'],
    })
    addExercise(exercise)
    const stored = getExercises().find((ex) => ex.id === 'ex-99')
    expect(stored).toMatchObject({
      id: 'ex-99',
      name: 'Deadlift',
      category: 'Strength',
      muscles: ['Back', 'Legs'],
    })
  })

  test('addExercise does not mutate the original exercise object', () => {
    const exercise = makeExercise()
    const original = { ...exercise }
    addExercise(exercise)
    expect(exercise).toEqual(original)
  })

  test('getExercises does not return a reference to the stored array', () => {
    addExercise(makeExercise({ id: 'ex-1' }))
    const list1 = getExercises()
    list1.push({ id: 'injected' })
    const list2 = getExercises()
    expect(list2).toHaveLength(1) // Mutation of returned array should not affect storage
  })
})
