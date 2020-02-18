setTimeout(() => {

  const skills = [].slice.call(document.querySelectorAll('.js-rank'))

  const animationTime = 2000 
  const animationSteps = 20

  const finalValues = skills.map(skill => 
    Math.round(parseInt(skill.getAttribute('data-rank'), 10) / 12 * 100))
  const pendingValues = skills.map(skill => 24)
  const stepValues = finalValues.map(finalValue => Math.floor(finalValue / animationSteps))

  skills.forEach((skill, i) => {
    const value = finalValues[i]
    skill.style = `width: ${value}%;`
  })

  let i = 0
  let interval = setInterval(() => {
    if (i < animationSteps) {
      skills.forEach((skill, i) => {
        const newValue = pendingValues[i] + stepValues[i]
        skill.innerHTML = `${newValue - 24}%`
        pendingValues[i] = newValue
      })
    } else {
      skills.forEach((skill, i) => {
        skill.innerHTML = `${finalValues[i]}%`
        clearInterval(interval)
      })
    }
    i++
  }, animationTime / animationSteps)
}, 500)
