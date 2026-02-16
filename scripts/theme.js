const toggle = document.getElementById('theme-toggle')

toggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark')

  const isDark = document.documentElement.classList.contains('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
})

if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark')
}
