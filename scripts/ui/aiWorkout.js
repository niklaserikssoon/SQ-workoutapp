const API_BASE = CONFIG.workoutApiUrl + 'api/v1/ai'

const aiBtn           = document.getElementById('ai-btn')
const aiSection       = document.getElementById('ai-section')
const optionsSection  = document.getElementById('workout-options')
const aiBackBtn       = document.getElementById('ai-back-btn')
const generatePlanBtn = document.getElementById('generate-plan-btn')
const resultDiv       = document.getElementById('ai-result')
const planOutput      = document.getElementById('ai-plan-output')
const errorEl         = document.getElementById('ai-error')

const saveAiPlanBtn     = document.getElementById('save-ai-plan-btn')
const aiSaveFeedback    = document.getElementById('ai-save-feedback')

const myAiPlansBtn      = document.getElementById('my-ai-plans-btn')
const aiPlansSection    = document.getElementById('ai-plans-section')
const aiPlansBackBtn    = document.getElementById('ai-plans-back-btn')
const aiPlansList       = document.getElementById('ai-plans-list')

let currentPlanData = null

function showAi() {
  optionsSection.hidden = true
  aiSection.hidden = false
  document.querySelector('.hero-header').hidden = true
}

function hideAi() {
  aiSection.hidden = true
  optionsSection.hidden = false
  resultDiv.hidden = true
  errorEl.hidden = true
  aiSaveFeedback.hidden = true
  planOutput.innerHTML = ''
  errorEl.textContent = ''
  currentPlanData = null
  document.querySelector('.hero-header').hidden = false
}

function showAiPlans() {
  optionsSection.hidden = true
  aiPlansSection.hidden = false
  document.querySelector('.hero-header').hidden = true
  loadAiPlans()
}

function hideAiPlans() {
  aiPlansSection.hidden = true
  optionsSection.hidden = false
  document.querySelector('.hero-header').hidden = false
}

async function loadAiPlans() {
  aiPlansList.innerHTML = '<p class="empty-state">Loading…</p>'

  const token = localStorage.getItem('token')
  if (!token) {
    aiPlansList.innerHTML = '<p class="empty-state">You must be logged in to view saved plans.</p>'
    return
  }

  try {
    const res = await fetch(`${API_BASE}/plans`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const plans = await res.json()

    if (!plans.length) {
      aiPlansList.innerHTML = '<p class="empty-state">No saved plans yet.</p>'
      return
    }

    aiPlansList.innerHTML = ''
    plans.forEach(p => {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = `
        <div class="saved-workout-header" style="margin-bottom: 0.5rem;">
          <span class="saved-workout-name">${p.goal ?? 'AI Plan'}</span>
          <span class="workout-date">${p.createdAt?.split('T')[0] ?? '—'}</span>
        </div>
      `
      const planContainer = document.createElement('div')
      renderPlan(planContainer, p.plan ?? p.content ?? '{}')
      wrapper.appendChild(planContainer)
      aiPlansList.appendChild(wrapper)
    })
  } catch (err) {
    aiPlansList.innerHTML = '<p class="empty-state">Could not load plans.</p>'
    console.error('Failed to load AI plans:', err)
  }
}

function renderPlan(container, plan) {
  try {
    const parsed = typeof plan === 'string' ? JSON.parse(plan) : plan
    const days = parsed.days ?? []

    container.innerHTML = days.map(day => `
      <div class="saved-workout-item">
        <div class="saved-workout-header">
          <span class="saved-workout-name">${day.name}</span>
        </div>
        <div class="saved-workout-table-wrapper">
          <table class="saved-workout-table">
            <thead>
              <tr><th>Exercise</th><th>Sets</th><th>Reps</th><th>Weight</th></tr>
            </thead>
            <tbody>
              ${day.exercises.map(ex => `
                <tr>
                  <td>${ex.name}</td>
                  <td>${ex.sets}</td>
                  <td>${ex.reps}</td>
                  <td>${ex.weight ?? '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `).join('')
  } catch {
    container.textContent = typeof plan === 'string' ? plan : JSON.stringify(plan)
  }
}

saveAiPlanBtn?.addEventListener('click', async () => {
  if (!currentPlanData) return

  const token = localStorage.getItem('token')
  if (!token) {
    aiSaveFeedback.textContent = 'You must be logged in to save.'
    aiSaveFeedback.className = 'feedback-error'
    aiSaveFeedback.hidden = false
    return
  }

  saveAiPlanBtn.disabled = true
  saveAiPlanBtn.textContent = 'Saving...'

  try {
    const res = await fetch(`${API_BASE}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
          goal: currentPlanData.goal,
          plan: typeof currentPlanData.plan === 'string'
            ? JSON.parse(currentPlanData.plan).days
            : (currentPlanData.plan.days ?? currentPlanData.plan)
        })
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    aiSaveFeedback.textContent = 'Plan saved! View it under My AI Plans.'
    aiSaveFeedback.className = 'feedback-success'
    aiSaveFeedback.hidden = false
    saveAiPlanBtn.textContent = 'Saved'
  } catch (err) {
    aiSaveFeedback.textContent = 'Could not save plan, try again.'
    aiSaveFeedback.className = 'feedback-error'
    aiSaveFeedback.hidden = false
    saveAiPlanBtn.disabled = false
    saveAiPlanBtn.textContent = 'Save Workout'
  }
})

aiBtn?.addEventListener('click', showAi)
aiBackBtn?.addEventListener('click', hideAi)
myAiPlansBtn?.addEventListener('click', showAiPlans)
aiPlansBackBtn?.addEventListener('click', hideAiPlans)

generatePlanBtn?.addEventListener('click', async () => {
  const goal         = document.getElementById('ai-goal').value.trim()
  const fitnessLevel = document.getElementById('ai-level').value
  const daysPerWeek  = Number(document.getElementById('ai-days').value)
  const equipment    = document.getElementById('ai-equipment').value.trim()

  if (!goal) {
    errorEl.textContent = 'Please enter a goal.'
    errorEl.hidden = false
    return
  }

  generatePlanBtn.disabled = true
  generatePlanBtn.textContent = 'Generating...'
  resultDiv.hidden = true
  errorEl.hidden = true

  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`${API_BASE}/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ goal, fitnessLevel, daysPerWeek, equipment }),
    })

    if (res.status === 401) throw new Error('You must be logged in.')
    if (res.status === 503) throw new Error('AI service timed out, try again.')
    if (!res.ok)            throw new Error('Something went wrong, try again later.')

    const data = await res.json()
    currentPlanData = { goal, fitnessLevel, daysPerWeek, equipment, plan: data.plan }
    renderPlan(planOutput, data.plan)
    aiSaveFeedback.hidden = true
    resultDiv.hidden = false
    resultDiv.scrollIntoView({ behavior: 'smooth' })

  } catch (err) {
    errorEl.textContent = err.message
    errorEl.hidden = false
  } finally {
    generatePlanBtn.disabled = false
    generatePlanBtn.textContent = 'Generate Plan'
  }
})
