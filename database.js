const process = require('process')
const uri = process.env.MONGODB_URI
const { MongoClient } = require('mongodb')

const databaseName = 'nishkaam-database'
const collections = {
  blogs: 'blogs',
  otp: 'otp',
  admin: 'admin',
  products: 'products',
  messages: 'messages',
  users: 'users',
  verificationTokens: 'verificationTokens',
}

const client = new MongoClient(uri, {
  ssl: true,
})

async function connectDatabase() {
  try {
    await client.connect()
    console.log('Connected to MongoDB successfully! Database: ' + databaseName)
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

function getCollection(collectionName) {
  const validCollectionNames = Object.values(collections)

  if (!validCollectionNames.includes(collectionName)) {
    throw new Error(`Invalid collection name: ${collectionName}`)
  }

  return client.db(databaseName).collection(collectionName)
}

module.exports = {
  connectDatabase,
  getCollection,
}
