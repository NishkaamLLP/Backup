// make a request to fetch all blogs
const fetchBlogs = async () => {
  const response = await fetch('/blogs/blogs')
  const data = await response.json()
  console.log(data)
}
