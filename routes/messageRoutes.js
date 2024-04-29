// the routes for the messages
const express = require('express')
const router = express.Router()
const {
    getAllMessages,
    getMessageById,
    createMessage,
    deleteMessage,
} = require('../Controllers/messageController.js')
// route to get message
router.get('/', getAllMessages)
// route to get message by id
router.get('/:id', getMessageById)
// route to create message
router.post('/', createMessage)
// route to delete message
router.delete('/:id', deleteMessage)
module.exports = router