const API_URL = CONFIG.workoutApiUrl + 'api/v1/ai/generate-plan'

const btn = document.getElementById('ai-btn')

btn?.addEventListener('click', () => {
  const startSection = document.getElementById('start-workout')
  const heroPanel = startSection?.parentElement

  if (document.getElementById('ai-section')) return

  const section = document.createElement('section')
  section.id = 'ai-section'
  section.classList.add('card')
  section.innerHTML = `
        <h2 class="section-heading">AI Workout Plan</h2>
        <p class="section-subtitle">Tell us about your goals and we'll generate a plan for you.</p>

        <label for="ai-goal">Goal</label>
        <input type="text" id="ai-goal" placeholder="Ex: Build muscle, lose weight, improve cardio" />

        <label for="ai-level">Fitness Level</label>
        <select id="ai-level">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
        </select>

        <label for="ai-days">Days per week</label>
        <input type="number" id="ai-days" min="1" max="7" value="3" />

        <label for="ai-equipment">Equipment (optional)</label>
        <input type="text" id="ai-equipment" placeholder="Ex: Dumbbells, barbell, none" />

        <button class="btn-accent" id="generate-plan-btn">Generate Plan</button>

        <div id="ai-result" hidden>
            <h3 class="subheading">Your Plan</h3>
            <pre id="ai-plan-output"></pre>
        </div>

        <p id="ai-error" hidden style="color: red;"></p>
        <button class="btn-secondary" id="ai-back-btn">⬅ Back</button>
    `

  startSection.hidden = true
  heroPanel.appendChild(section)
  // Style form fields to stack vertically
  section.querySelectorAll('label').forEach(label => {
    label.style.display = 'block'
    label.style.marginTop = '0.75rem'
    label.style.marginBottom = '0.25rem'
    label.style.color = '#ffffff'
    label.style.fontWeight = '600'
  })
  section.querySelectorAll('input, select').forEach(input => {
    input.style.display = 'block'
    input.style.width = '100%'
    input.style.marginBottom = '0.5rem'
    input.style.boxSizing = 'border-box'
  })
  const subtitle = section.querySelector('.section-subtitle')
  if (subtitle) subtitle.style.color = '#cccccc'
  const subheading = section.querySelector('.subheading')
  if (subheading) subheading.style.color = '#ffffff'
  // Make hero grow to fit content
  const heroImage = document.querySelector('.hero-image')
  if (heroImage) heroImage.style.minHeight = section.scrollHeight + 100 + 'px'

  document.getElementById('ai-back-btn').addEventListener('click', () => {
    section.remove()
    startSection.hidden = false
    const heroImage = document.querySelector('.hero-image')
  if (heroImage) heroImage.style.minHeight = ''
  })

  document
    .getElementById('generate-plan-btn')
    .addEventListener('click', async () => {
      const goal = document.getElementById('ai-goal').value.trim()
      const fitnessLevel = document.getElementById('ai-level').value
      const daysPerWeek = Number(document.getElementById('ai-days').value)
      const equipment = document.getElementById('ai-equipment').value.trim()

      const generateBtn = document.getElementById('generate-plan-btn')
      const resultDiv = document.getElementById('ai-result')
      const planOutput = document.getElementById('ai-plan-output')
      const errorEl = document.getElementById('ai-error')

      if (!goal) {
        errorEl.textContent = 'Please enter a goal.'
        errorEl.hidden = false
        return
      }

      generateBtn.disabled = true
      generateBtn.textContent = 'Generating...'
      resultDiv.hidden = true
      errorEl.hidden = true

      try {
        const token = localStorage.getItem('token')

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goal, fitnessLevel, daysPerWeek, equipment }),
        })

        if (res.status === 401) throw new Error('You must be logged in.')
        if (res.status === 503)
          throw new Error('AI service timed out, try again.')
        if (!res.ok) throw new Error('Something went wrong, try again later.')

        const data = await res.json()
        planOutput.textContent = data.plan
        planOutput.style.whiteSpace = 'pre-wrap'
        planOutput.style.wordBreak = 'break-word'
        planOutput.style.overflowWrap = 'break-word'
        planOutput.style.maxWidth = '100%'
        planOutput.style.overflowX = 'hidden'
        planOutput.style.fontFamily = 'inherit'
        resultDiv.hidden = false
        // Update hero height now that plan content is visible
        setTimeout(() => {
          const heroSection = document.querySelector('.hero-section')
          const heroImage = document.querySelector('.hero-image')
          if (heroImage) {
            heroImage.style.height = 'auto'
            heroImage.style.minHeight = '100%'
          }
          if (heroSection) heroSection.style.minHeight = section.scrollHeight + 300 + 'px'
        }, 200)
        resultDiv.scrollIntoView({ behavior: 'smooth' })
      } catch (err) {
        errorEl.textContent = err.message
        errorEl.hidden = false
      } finally {
        generateBtn.disabled = false
        generateBtn.textContent = 'Generate Plan'
      }
    })
})
