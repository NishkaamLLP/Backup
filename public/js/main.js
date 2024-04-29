// Check if redirect flag is set
// eslint-disable-next-line no-undef
if (redirect === 'true') {
  // Change the URL using the History API
  history.pushState({}, '', '/admin')
}
