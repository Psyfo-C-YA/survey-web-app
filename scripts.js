function validateSurvey() {
  var checkboxes = document.getElementsByName('foodChoices');
  var isChecked = false;

  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      isChecked = true;
      break;
    }
  }

  if (!isChecked) {
    alert('Please select at least one favorite food.');
    return false;
  }

  return true;
}
