const express = require('express')
const upload = require('../multerConfig.js')
const router = express.Router()
const blogsController = require('../Controllers/blogsController.js')
const checkSession = require('../Middlewares/checkSession.js')

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsPaginated,
  getTopBlogs,
  getBlogsByCategory,
} = blogsController
// Route to create a new blog
router.post('/',  upload.single('image'), createBlog, checkSession)

// Route to get all blogs with pagination
router.get('/blogs/paginated', getAllBlogsPaginated)

// Route to get all blogs
router.get('/blogs', getAllBlogs)
// Route for getting blogs by category
router.get('/blogs/by-category/:category', getBlogsByCategory)

// Route to get a single blog by ID with input validation
router.get('/blogs/:id', getBlogById)

// Route to update an existing blog with rate limiting and file upload
router.put('/blogs/:id', updateBlog, checkSession)

// Route to delete a blog by ID
router.delete('/blogs/:id', deleteBlog)

// Route to get top 10 blogs with most likes and comments
router.get('/top-blogs', getTopBlogs)

// Route for searching blog by writter name

module.exports = router
