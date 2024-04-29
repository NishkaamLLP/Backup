const process = require('process')
const { getCollection } = require('../database')
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

// Import Twilio
const client = require('twilio')(accountSid, authToken)

const sendOtp = async (phone, req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const timer = Date.now() + 600000

    const otpCollection = getCollection('otp')
    const otpData = {
      phone: phone,
      otp: otp,
      expires: timer,
    }

    await otpCollection.insertOne(otpData)

    client.messages
      .create({
        body: `Your Nishkaam Innovations Security Check OTP is ${otp}`,
        from: `${process.env.TWILIO_PHONE_NUMBER}`,
        to: phone,
      })
      .then((message) => {
        console.log('OTP sent successfully:', message.body)
      })
  } catch (error) {
    console.error('Error sending OTP:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  sendOtp,
}
