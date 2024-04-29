// auth.js

// Function to get the token from the session
function getTokenFromSession() {
  return '<%= session.token %>' // Assuming session.token holds the token value
}

// Function to make HTTP requests with the token in the headers
async function fetchWithToken(url, options) {
  const token = getTokenFromSession()
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, options)
  return response
}
