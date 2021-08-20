export default form => (
  Array.from(form.querySelectorAll('input, select, textarea, button')).reduce((values, input) => {
    const name = input.name || input.id;
    const tagName = input.tagName.toLowerCase();
    if (tagName === 'input') {
      const type = input.type.toLowerCase();
      if (type === 'checkbox' && input.checked) {
        values[name] = (values[name] || []).concat([input.value]);
      } else if (type === 'radio' && input.checked) {
        values[name] = input.value;
      } else if (type === 'number') {
        values[name] = input.valueAsNumber;
      } else if (type === 'file') {
        if (input.multiple) {
          values[name] = input.files;
        } else {
          values[name] = input.files[0];
        }
      } else if (type === 'date') {
        values[name] = input.valueAsDate;
      } else if (type === 'button') {
        // ignore buttons; the submit handler should be checking on it if the clicked button is needed.
      } else {
        values[name] = input.value;
      }
    } else if (tagName === 'select') {
      const getOptValue = option => option => option.value || option.textContent.trim();
      if (input.multiple) {
        values[name] = Array.from(input.selectedOptions).map(getOptValue);
      } else {
        values[name] = input.selectedIndex === -1 ? null : getOptValue(input.options[input.selectedIndex]);
      }
    } else if (tagName === 'textarea' || tagName === 'button') {
      values[name] = input.value;
    }
    return values;
  }, {})
);