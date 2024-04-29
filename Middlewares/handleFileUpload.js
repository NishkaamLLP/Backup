const fs = require('fs')

const handleFileUpload = (file) => {
  return new Promise((resolve, reject) => {
    // Allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const uploadDir = '../public/images/'
    const originalName = file.originalname
    const mimetype = file.mimetype

    // Check if the file type is allowed
    if (!allowedTypes.includes(mimetype)) {
      reject('Unsupported file type')
      return
    }

    const timestamp = Date.now()
    const filename = `${timestamp}_${originalName}`
    const filePath = uploadDir + filename

    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        console.error('Error saving image:', err)
        reject('Internal Server Error: Error saving the image')
      } else {
        console.log('Image saved successfully')
        resolve(filename)
      }
    })
  })
}

module.exports = { handleFileUpload }
