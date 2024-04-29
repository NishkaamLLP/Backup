/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const compression = require('compression')
const methodOverride = require('method-override')
const checkSession = require('./Middlewares/checkSession')
const helmet = require('helmet')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const app = express()
require('dotenv').config()
const { connectDatabase } = require('./database.js')

// Middleware setup
app.use(morgan('dev'))
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
      sameSite: 'strict',
    },
  }),
)
// Database connection
connectDatabase()

// Routes setup
app.use('/blogs', require('./routes/blogsRoutes'))
app.use('/api', require('./routes/adminRoutes'))
app.use('/api', require('./routes/usersRoutes'))

// Payment confirmation route
app.get('/paytm', (req, res) => {
  res.status(200).render('pay')
})

// Health check route
app.get('/ready', (req, res) => {
  res.status(200).render('index')
})

// Home route
app.get('/', (req, res) => {
  res.status(200).render('home', { message: '' })
})

app.get('/dashboard', checkSession, (req, res) => {
  res.render('admin')
})


// Forgot password route
app.get('/forgot', (req, res) => {
  res.status(200).render('forgot')
})

// Blog route
app.get('/admin/blog', checkSession, (req, res) => {
  res.status(200).render('createBlog')
})

// Add blog route
app.get('/admin/addBlog', checkSession, (req, res) => {
  // get token from cookies
  const authToken = req.cookies.authToken
  const response = {
    authToken: authToken,
    error: '',
  }
  // render the createBlog template and pass the authToken to it
  res
    .status(200)
    .render('createBlog', { response: response, session: req.session })
})

// Products route
app.get('/admin/products', checkSession, (req, res) => {
  res.status(200).render('products')
})

// Drafts route
app.get('/admin/addProduct', checkSession, (req, res) => {
  res.status(200).render('addProducts', { session: req.session })
})

// Verify OTP route
app.get('/verifyOtp', (req, res) => {
  res.status(200).render('verifyOtp')
})

// 404 route
app.use((req, res) => {
  res.status(404).render('404')
})

module.exports = app
