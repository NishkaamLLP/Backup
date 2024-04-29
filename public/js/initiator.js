/* eslint-disable no-undef */

tinymce.init({
  selector: 'textarea',
  license_key: 'gpl',
})

const toggleDateInput = (e) => {
  e.preventDefault()

  var publishOption = document.getElementById('publish')
  var scheduleDiv = document.getElementById('scheduleDiv')

  if (publishOption.value === 'later') {
    scheduleDiv.classList.remove('hidden')
  } else {
    scheduleDiv.classList.add('hidden')
  }
}

// Adding event listener for the change event on the publish select element
document.getElementById('publish').addEventListener('change', toggleDateInput)
