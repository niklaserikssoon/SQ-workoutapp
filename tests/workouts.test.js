/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals'
import workoutService from '../scripts/storage/workouts.js'

const { getWorkouts, addWorkout, updateWorkout, getWorkoutById, saveWorkouts } =
  workoutService

describe('workoutService', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  test('getWorkouts returns empty array if nothing in LocalStorage', () => {
    expect(getWorkouts()).toEqual([])
  })
  test('saveWorkouts stores workouts in LocalStorage', () => {
    const workouts = [{ id: '1', name: 'Run' }]
    saveWorkouts(workouts)
    expect(JSON.parse(localStorage.getItem('workouts'))).toEqual(workouts)
  })
  test('addWorkout adds a workout to LocalStorage', () => {
    addWorkout({ id: '1', name: 'Run' })
    addWorkout({ id: '2', name: 'Swim' })
    const stored = getWorkouts()
    expect(stored).toHaveLength(2)
    expect(stored[0].id).toBe('2')
    expect(stored[1].id).toBe('1')
  })
  test('updateWorkout updates existing workout', () => {
    addWorkout({ id: '1', name: 'Run', duration: 30 })
    updateWorkout({ id: '1', name: 'Run', duration: 45 })
    const updated = getWorkoutById('1')
    expect(updated.duration).toBe(45)
  })
  test('getWorkoutById returns correct workout', () => {
    addWorkout({ id: '1', name: 'Run' })
    addWorkout({ id: '2', name: 'Swim' })
    const w = getWorkoutById('2')
    expect(w.name).toBe('Swim')
  })
  test('updateWorkout does not add new workout if id not found', () => {
    addWorkout({ id: '1', name: 'Run' })
    updateWorkout({ id: '999', name: 'Fake' })
    const workouts = getWorkouts()
    expect(workouts).toHaveLength(1)
    expect(workouts[0].id).toBe('1')
  })
})
