// controller to manage messsages 
const { getCollection } = require('../database.js')
const { ObjectId } = require('mongodb')
const {
    generateAuthToken,
    verifyAuthToken,
  } = require('../Middlewares/jwtAuthorization.js')


// get all messages
exports.getAllMessages = async (req, res) => {
    const messages = await getCollection('messages')
    const allMessages = await messages.find({}).toArray()
    res.send(allMessages)
}
// get message by id
exports.getMessageById = async (req, res) => {
    const messages = await getCollection('messages')
    const message = await messages.findOne({ _id: ObjectId(req.params.id) })
    res.send(message)
}
// create message
exports.createMessage = async (req, res) => {
    const messages = await getCollection('messages')
    const newMessage = await messages.insertOne(req.body)
    res.send(newMessage)
}
// delete the message by id
exports.deleteMessage = async (req, res) => {
    const messages = await getCollection('messages')
    const message = await messages.deleteOne({ _id: ObjectId(req.params.id) })
    res.send(message)
}

