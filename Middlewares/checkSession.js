// Middleware to check if session is set
const checkSession = (req, res, next) => {
  if (req.session && req.session.token) {
    // store token into sessionStorage on the client side
    res.locals.token = req.session.token
    res.locals.user = req.session.user
    // Pass session object to the template
    res.locals.session = req.session
    next()
  } else {
    res.redirect('/')
  }
}

module.exports = checkSession
