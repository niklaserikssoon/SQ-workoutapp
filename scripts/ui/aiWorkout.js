const API_URL = CONFIG.workoutApiUrl + 'api/v1/ai/generate-plan'

const aiBtn         = document.getElementById('ai-btn')
const aiSection     = document.getElementById('ai-section')
const optionsSection = document.getElementById('workout-options')
const aiBackBtn     = document.getElementById('ai-back-btn')
const generatePlanBtn = document.getElementById('generate-plan-btn')
const resultDiv     = document.getElementById('ai-result')
const planOutput    = document.getElementById('ai-plan-output')
const errorEl       = document.getElementById('ai-error')

function showAi() {
  optionsSection.hidden = true
  aiSection.hidden = false
  document.querySelector('.hero-header').hidden = true 
}

function hideAi() {
  aiSection.hidden = true
  optionsSection.hidden = false
  // Reset state
  resultDiv.hidden = true
  errorEl.hidden = true
  planOutput.textContent = ''
  errorEl.textContent = ''
  document.querySelector('.hero-header').hidden = false 
}

aiBtn?.addEventListener('click', showAi)
aiBackBtn?.addEventListener('click', hideAi)

generatePlanBtn?.addEventListener('click', async () => {
  const goal        = document.getElementById('ai-goal').value.trim()
  const fitnessLevel = document.getElementById('ai-level').value
  const daysPerWeek = Number(document.getElementById('ai-days').value)
  const equipment   = document.getElementById('ai-equipment').value.trim()

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

    const res = await fetch(API_URL, {
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
    planOutput.textContent = data.plan
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