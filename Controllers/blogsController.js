const { getCollection } = require('../database.js')
const { ObjectId } = require('mongodb')
const { verifyAuthToken } = require('../Middlewares/jwtAuthorization.js')
const session = require('express-session')
const { stat } = require('fs')
//__________Create a new blog/any content type___________/
const createBlog = async (req, res) => {
  try {
    // Get the token from the request body
    const token = req.body.token
    if (!token || token === '') {
      const response = {
        message:
          'You are not authorized to create a blog post. Please login to continue.',
        blogTitle: req.body.title,
        blogContent: req.body.content,
        blogCategory: req.body.category,
        blogTags: req.body.tags,
        publishOption: req.body.publish,
        scheduleDate: req.body.scheduleDate,
      }
      return res.status(401).render('createBlog', {
        session: req.session,
        response: response,
      })
    }

    const decoded = await verifyAuthToken(token)
    req.user = decoded

    // check the publish option
    const publishOption = req.body.publish
    if (publishOption === 'later') {
      // check if the schedule date is provided and valid
      if (
        !req.body.scheduleDate ||
        new Date(req.body.scheduleDate) <= new Date()
      ) {
        const response = {
          message:
            'Invalid or missing schedule date. Please provide a future date to publish later.',
        }
        return res.status(400).render('createBlog', {
          session: req.session,
          response: response,
        })
      }
    }

    // validate the blog data
    const { title, content, category, tags } = req.body
    if (!title || !content || !category || !tags || !publishOption) {
      const response = {
        message:
          'Title, content, category, tags, and publish option are required.',
        blogTitle: title,
        blogContent: content,
        blogCategory: category,
        blogTags: tags,
        publishOption: publishOption,
        scheduleDate: new Date(req.body.scheduleDate),
      }
      return res.status(400).render('createBlog', {
        session: req.session,
        response: response,
      })
    }

    const blogsCollection = await getCollection('blogs')
    // separating tags by comma

    let scheduleDate
    if (publishOption === 'now') {
      scheduleDate = new Date()
    } else {
      scheduleDate = new Date(req.body.scheduleDate)
    }

    const blogData = {
      title,
      content,
      category,
      tags: req.body.tags.split(','),
      publishOption,
      scheduleDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (req.file) {
      blogData.image = req.file.filename
    }

    // Insert the blog data into the MongoDB collection
    const result = await blogsCollection.insertOne(blogData)

    const createdBlog = {
      message: 'Blog created successfully.',
      _id: result.insertedId,
      title: blogData.title,
      content: blogData.content,
      image: blogData.image,
      status: blogData.publishOption,
      date: blogData.scheduleDate,
    }

    res.status(201).render('blogCreated', {
      createdBlog: createdBlog,
      session: req.session,
    })
  } catch (error) {
    console.error('Error creating a blog:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// getting all blogs by an admin
const getAllBlogs = async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.session.token;

    if (!token || token === '') {
      return res.status(401).render('admin', { 
        message: 'Unauthorized to make this request',
        session: req.session
      });
    }

    // Verify the token
    const decoded = verifyAuthToken(token);
    req.user = decoded;

    const blogsCollection = getCollection('blogs');
    const blogs = await blogsCollection.find({}).toArray();

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = blogs.length;

    // Slice blogs array for pagination
    const paginatedBlogs = blogs.slice(startIndex, endIndex);

    return res.status(200).render('admin', {
      response: {
        requestTime: new Date().toISOString(),
        count: paginatedBlogs.length,
        message: 'Blogs retrieved successfully.',
      },
      blogs: paginatedBlogs,
      session: req.session,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

//____________Get All Blogs by category__________________/
const getBlogsByCategory = async (req, res) => {
  try {
    // Get the category from the request parameters
    const category = req.params.category

    // Check if the category is provided
    if (!category) {
      return res.status(400).json({ error: 'Category parameter is missing' })
    }

    // Convert the category to lowercase for a case-insensitive search
    const lowercaseCategory = category.toLowerCase()

    // Fetch blogs that match the category
    const blogsCollection = getCollection('blogs')
    const blogs = await blogsCollection
      .find({ category: lowercaseCategory })
      .toArray()

    // Check if any blogs were found
    if (blogs.length === 0) {
      return res
        .status(404)
        .json({ error: 'No blogs found for the specified category' })
    }

    // Customize the response format, including pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = blogs.length

    const paginatedBlogs = blogs.slice(startIndex, endIndex)

    const response = {
      metadata: {
        count: paginatedBlogs.length,
        total,
        page,
        message: 'Blogs retrieved successfully.',
      },
      blogs: paginatedBlogs,
      request: {
        type: 'GET',
        description: 'Get blogs by category',
        url: `/api/v1/ped/blogs/by-category/${category}`,
      },
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error fetching blogs by category:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

//___________Get a single blog by ID_____________________/
const getBlogById = async (req, res) => {
  try {
    const id = `${req.params.id}`
    if (!id) {
      return res.status(400).json({ error: 'Blog ID is missing' })
    }
    const blogsCollection = getCollection('blogs')
    const blog = await blogsCollection.findOne(new ObjectId(id))
    if (!blog) {
      return res.status(404).json({ error: 'Blog not available ' })
    }
    const formattedBlog = {
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      image: blog.image,
      ...blog,
    }

    res.status(200).json({
      blog: formattedBlog,
      request: {
        type: 'GET',
        description: 'You can still see all blogs',
        url: `/api/v1/ped/blogs`,
      },
    })
  } catch (error) {
    console.error('Error fetching a blogpost:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

//______________ Update an existing blog_________________/
const updateBlog = async (req, res) => {
  const token = req.headers.authorization
  const id = `${req.params.id}`
  const blogUpdatedData = {}
  const file = req.file
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    // Verify the token
    const decoded = await verifyAuthToken(token)
    req.user = decoded

    const blogsCollection = getCollection('blogs')

    if (typeof blogUpdatedData !== 'object' || blogUpdatedData === null) {
      return res.status(400).json({ error: 'Invalid update data' })
    }

    if (file) {
      blogUpdatedData.image = file.filename
    }

    for (const key in req.body) {
      blogUpdatedData[key] = req.body[key]
    }
    const updatedBlog = await blogsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: blogUpdatedData },
      { returnDocument: 'after' },
    )
    const formattedBlog = {
      _id: updatedBlog._id,
      ...updatedBlog,
    }

    if (updatedBlog === null) {
      return res
        .status(404)
        .json({ error: 'Blog not found, so it was not modified.' })
    }
    res.status(200).json({
      message: 'Blog updated successfully.',
      blog: formattedBlog,
    })
  } catch (error) {
    console.error('Error updating a blog:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

//______________ Delete a blog by ID_____________________/
const deleteBlog = async (req, res) => {
  const id = `${req.params.id}`
  const blogsCollection = getCollection('blogs')
  // Get the token to make sure it is an admin who wants to delete the blog
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Verify the token
    const decoded = await verifyAuthToken(token)
    req.user = decoded
    // Check if the user is an admin
    if (req.user.role === 'admin') {
      const blogsCollection = getCollection('blogs')
      const result = await blogsCollection.deleteOne({
        _id: new ObjectId(id),
      })
      // confirm if the blog was deleted  and send confirmation message
      if (result.deletedCount != 0) {
        return res.status(200).json({ message: 'Blog deleted successfully' })
      }

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ error: "Blog not found, can't perform delete" })
      }

      // Successful deletion with 204 status (No Content)
      res.status(204).end()
    }
    // User is the owner; proceed with deletion
    const result = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    })

    // send confirmation message
    if (result.deletedCount != 0) {
      return res.status(200).json({ message: 'Blog deleted successfully' })
    }

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Blog not found, can't perform delete" })
    }

    res.status(204).end()
  } catch (error) {
    console.error('Error deleting a blog:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

//__________Get all blogs with pagination_______________/
const getAllBlogsPaginated = async (req, res) => {
  try {
    const blogsCollection = getCollection('blogs')
    const page = parseInt(req.query.page) || 1
    const blogsPerPage = 10
    const skip = (page - 1) * blogsPerPage

    const blogs = await blogsCollection
      .find({})
      .skip(skip)
      .limit(blogsPerPage)
      .toArray()

    res.status(200).json({
      metadata: {
        count: blogs.length,
        message: 'List of all created blogs retrieved successfully.',
        page: page,
      },
      blogs: blogs,
    })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

//___________Get the top 10 popular blogs ______________/
const getTopBlogs = async (req, res) => {
  try {
    const blogsCollection = getCollection('blogs')

    // get the most 10 recent blogs
    const topBlogs = await blogsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    res.status(200).json({
      metadata: {
        count: topBlogs.length,
        message:
          'Top 10 blogs retrieved successfully. These are the most recent blogs.',
      },
      topBlogs: topBlogs,
    })
  } catch (error) {
    console.error('Error fetching top blogs:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogsByCategory,
  getBlogById,
  updateBlog,
  deleteBlog,
  getAllBlogsPaginated,
  getTopBlogs,
}
