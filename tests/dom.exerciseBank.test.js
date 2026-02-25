function renderExerciseBankDom() {
  document.body.innerHTML = `
    <header>
      <h1>Exercise Bank</h1>
      <nav aria-label="Primary navigation">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="exerciseBank.html">Workouts</a></li>
          <li><a href="#contact">exercise plans</a></li>
        </ul>
      </nav>
    </header>

    <section class="search-section">
      <input type="text" id="exercise-search" placeholder="Search for exercises..." />
      <button id="search-button">Search</button>
    </section>

    <section id="workout-display"></section>

    <dialog id="exercise-modal">
      <button id="modal-close" aria-label="Close modal">✕</button>
      <h2 id="modal-title"></h2>
      <img id="modal-image" alt="" />
      <p id="modal-overview"></p>
      <ol id="modal-instructions"></ol>
    </dialog>

    <button id="show-exercises">Show exercises</button>
  `
}

beforeEach(() => renderExerciseBankDom())

test('renders navbar links with correct href', () => {
  const links = [...document.querySelectorAll('nav[aria-label="Primary navigation"] a')]
  expect(links.map(a => a.getAttribute('href'))).toEqual(['index.html', 'exerciseBank.html', '#contact'])
})

test('renders search UI', () => {
  const input = document.getElementById('exercise-search')
  const btn = document.getElementById('search-button')
  expect(input).toBeTruthy()
  expect(input.getAttribute('placeholder')).toBe('Search for exercises...')
  expect(btn).toBeTruthy()
})

test('renders modal skeleton', () => {
  expect(document.getElementById('exercise-modal')).toBeTruthy()
  expect(document.getElementById('modal-close')?.getAttribute('aria-label')).toBe('Close modal')
  expect(document.getElementById('modal-title')).toBeTruthy()
  expect(document.getElementById('modal-instructions')).toBeTruthy()
})