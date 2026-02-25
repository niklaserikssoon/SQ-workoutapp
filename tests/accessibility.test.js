import fs from 'fs'
import path from 'path'
import { axe } from 'jest-axe'

// ─── Helper to load HTML files ───────────────────────────────────────────────

function loadHTML(filename) {
  const filePath = path.join(process.cwd(), 'src', filename)
  return fs.readFileSync(filePath, 'utf8')
}

// ─── index.html ──────────────────────────────────────────────────────────────

describe('Accessibility: index.html', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = loadHTML('index.html')
  })

  test('has no critical WCAG violations', async () => {
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  }, 15000)

  test('menu toggle button has aria-label', () => {
    const menuToggle = document.getElementById('menu-toggle')
    expect(menuToggle).not.toBeNull()
    expect(menuToggle.getAttribute('aria-label')).toBeTruthy()
  })

  test('theme toggle button has aria-label', () => {
    const themeToggle = document.getElementById('theme-toggle')
    expect(themeToggle).not.toBeNull()
    expect(themeToggle.getAttribute('aria-label')).toBeTruthy()
  })

  test('side panel has aria-hidden attribute', () => {
    const sidePanel = document.getElementById('side-panel')
    expect(sidePanel).not.toBeNull()
    expect(sidePanel.getAttribute('aria-hidden')).toBe('true')
  })

  test('main landmark exists', () => {
    const main = document.querySelector('main')
    expect(main).not.toBeNull()
  })

  test('hero image has alt text', () => {
    const heroImage = document.querySelector('.hero-image')
    expect(heroImage).not.toBeNull()
    expect(heroImage.getAttribute('alt')).toBeTruthy()
  })

  test('workout input has an associated label', () => {
    const input = document.getElementById('workout-input')
    const label = document.querySelector('[for="workout-input"]')
    expect(input).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('page has a single h1', () => {
    const h1s = document.querySelectorAll('h1')
    expect(h1s.length).toBe(1)
  })
})

// ─── exerciseBank.html ────────────────────────────────────────────────────────

describe('Accessibility: exerciseBank.html', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = loadHTML('exerciseBank.html')
  })

  test('has no critical WCAG violations', async () => {
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  }, 15000)

  test('search input has an associated label', () => {
    const input = document.getElementById('exercise-search')
    const label = document.querySelector('[for="exercise-search"]')
    expect(input).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('menu toggle button has aria-label', () => {
    const menuToggle = document.getElementById('menu-toggle')
    expect(menuToggle).not.toBeNull()
    expect(menuToggle.getAttribute('aria-label')).toBeTruthy()
  })

  test('theme toggle button has aria-label', () => {
    const themeToggle = document.getElementById('theme-toggle')
    expect(themeToggle).not.toBeNull()
    expect(themeToggle.getAttribute('aria-label')).toBeTruthy()
  })

  test('modal close button has aria-label', () => {
    const closeBtn = document.getElementById('modal-close')
    expect(closeBtn).not.toBeNull()
    expect(closeBtn.getAttribute('aria-label')).toBeTruthy()
  })

  test('page has a single h1', () => {
    const h1s = document.querySelectorAll('h1')
    expect(h1s.length).toBe(1)
  })

  test('main landmark exists', () => {
    const main = document.querySelector('main')
    expect(main).not.toBeNull()
  })
})

// ─── edit-item.html ───────────────────────────────────────────────────────────

describe('Accessibility: edit-item.html', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = loadHTML('edit-item.html')
  })

  test('has no critical WCAG violations', async () => {
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  }, 15000)

  test('session name input has a unique label', () => {
    const input = document.getElementById('name')
    const labels = document.querySelectorAll('[for="name"]')
    expect(input).not.toBeNull()
    expect(labels.length).toBe(1)
  })

  test('exercise select has an associated label', () => {
    const select = document.getElementById('exercise')
    const label = document.querySelector('[for="exercise"]')
    expect(select).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('duration input has an associated label', () => {
    const input = document.getElementById('duration')
    const label = document.querySelector('[for="duration"]')
    expect(input).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('status div has role and aria-live', () => {
    const status = document.getElementById('status')
    expect(status).not.toBeNull()
    expect(status.getAttribute('role')).toBe('status')
    expect(status.getAttribute('aria-live')).toBe('polite')
  })

  test('page has a single h1', () => {
    const h1s = document.querySelectorAll('h1')
    expect(h1s.length).toBe(1)
  })

  test('main landmark exists', () => {
    const main = document.querySelector('main')
    expect(main).not.toBeNull()
  })
})

// ─── items-list.html ──────────────────────────────────────────────────────────

describe('Accessibility: items-list.html', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = loadHTML('items-list.html')
  })

  test('has no critical WCAG violations', async () => {
    const results = await axe(document.body)
    expect(results).toHaveNoViolations()
  }, 15000)

  test('category select has an associated label', () => {
    const select = document.getElementById('category')
    const label = document.querySelector('[for="category"]')
    expect(select).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('muscle group input has an associated label', () => {
    const input = document.getElementById('muscleGroup')
    const label = document.querySelector('[for="muscleGroup"]')
    expect(input).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('equipment select has an associated label', () => {
    const select = document.getElementById('equipment')
    const label = document.querySelector('[for="equipment"]')
    expect(select).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('level select label matches input id (case sensitive)', () => {
    const select = document.getElementById('level')
    const label = document.querySelector('[for="level"]')
    expect(select).not.toBeNull()
    expect(label).not.toBeNull()
  })

  test('page has a visually hidden h1', () => {
    const h1 = document.querySelector('h1')
    expect(h1).not.toBeNull()
    expect(h1.classList.contains('visually-hidden')).toBe(true)
  })

  test('main landmark exists', () => {
    const main = document.querySelector('main')
    expect(main).not.toBeNull()
  })
})
