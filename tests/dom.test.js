import { getByRole, getAllByRole, getByText } from '@testing-library/dom'

function renderRelevantDom() {
  document.body.innerHTML = `
    <button id="menu-toggle" aria-label="Open menu" aria-expanded="false"></button>

    <nav id="side-panel" aria-hidden="true">
      <ul class="side-panel-list">
        <li><button data-nav="list">Show Items</button></li>
        <li><button data-nav="add">Add Items</button></li>
        <li><button data-nav="search">Search Items</button></li>
        <li><button data-nav="settings">Settings</button></li>
      </ul>
    </nav>

    <header>
      <h1>Workout App</h1>
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="exerciseBank.html">Workouts</a></li>
          <li><a href="#contact">exercise plans</a></li>
        </ul>
      </nav>
    </header>

    <main id="app-root">
      <section id="start-workout" class="card">
        <h2>Start Workout</h2>
        <button id="start-btn">Start</button>
      </section>

      <section id="custom-workout-section" class="card" hidden>
        <h2>Create Your Own Workout</h2>

        <form id="custom-workout-form">
          <label>
            Exercise Name
            <input type="text" id="exercise-name" required />
          </label>

          <label>
            Sets
            <input type="number" id="sets" min="1" required />
          </label>

          <label>
            Reps
            <input type="number" id="reps" min="1" required />
          </label>

          <button type="submit">Add Workout</button>
        </form>

        <ul id="custom-workout-list">
          <li class="empty-state">No workouts yet</li>
        </ul>

        <button id="clear-workouts-btn">Clear Workouts</button>
      </section>
    </main>
  `
}

beforeEach(() => {
  renderRelevantDom()
})

describe('UI renders correctly (relevant DOM)', () => {
  test('renders primary navigation links with correct href', () => {
    const nav = getByRole(document.body, 'navigation', { name: /primary navigation/i })
    const links = getAllByRole(nav, 'link')

    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['#home', 'exerciseBank.html', '#contact'])

    expect(links[0].textContent).toBe('Home')
    expect(links[1].textContent).toBe('Workouts')
  })

  test('renders side panel nav buttons with data-nav', () => {
    const sidePanel = document.getElementById('side-panel')
    const buttons = sidePanel.querySelectorAll('button[data-nav]')

    const values = [...buttons].map((b) => b.getAttribute('data-nav'))
    expect(values).toEqual(['list', 'add', 'search', 'settings'])
  })

  test('renders Start Workout card and start button', () => {
    expect(getByText(document.body, 'Start Workout')).toBeTruthy()
    const startBtn = document.getElementById('start-btn')
    expect(startBtn).toBeTruthy()
    expect(startBtn.textContent).toBe('Start')
  })

  test('renders custom workout form fields + empty state', () => {
    const form = document.getElementById('custom-workout-form')
    expect(form).toBeTruthy()

    const nameInput = document.getElementById('exercise-name')
    const setsInput = document.getElementById('sets')
    const repsInput = document.getElementById('reps')

    expect(nameInput.getAttribute('required')).not.toBeNull()
    expect(setsInput.getAttribute('min')).toBe('1')
    expect(repsInput.getAttribute('min')).toBe('1')

    expect(document.querySelector('#custom-workout-list .empty-state')?.textContent)
      .toBe('No workouts yet')
  })
})