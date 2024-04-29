/* eslint-disable no-undef */
const { getCollection } = require('../database.js')
const {
  generateAuthToken,
  verifyAuthToken,
} = require('../Middlewares/jwtAuthorization.js')
const { hashInputData } = require('../Middlewares/hashInputData.js')
// const { sendOtp } = require("../Middlewares/smsOtp.js");
const bcrypt = require('bcrypt')
const transporter = require('../Middlewares/nodemailerFunction.js')

// superadmin signup
const superAdminSignup = async (req, res) => {
  try {
    const adminCollection = getCollection('admin')
    const hashedPassword = await hashInputData(req.body.password)
    const adminData = {
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
      role: 'superadmin',
      privilege: 'all',
      phone: req.body.phone,
    }

    // Verify if an admin with the provided email, phone, or username already exists
    const existingAdmin = await adminCollection.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone },
        { username: req.body.username },
      ],
    })

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists.' })
    }

    // Insert the data into the admin collection
    await adminCollection.insertOne(adminData)
    return res.status(200).json({ message: 'Admin added successfully' })
  } catch (error) {
    console.error('Error adding admin:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
// admin login
const superAdminLogin = async (req, res) => {
  try {
    const adminCollection = getCollection('admin')
    const admin = await adminCollection.findOne({ email: req.body.email })

    if (!admin) {
      return res.status(404).render('home', {
        message: 'Invalid email or password. Please try again.',
      })
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      admin.password,
    )

    if (!isPasswordValid) {
      return res.status(401).render('home', {
        message: 'Invalid email or password. Please try again.',
      })
    }

    const user = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      privilege: admin.privilege,
    }

    const token = generateAuthToken(user)

    // Store the token in the session
    req.session.token = token
    req.session.user = user
    // save to the client's  sessionStorage
    res.cookie('user', user, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    })

    // Redirect to dashboard
    res.redirect('/dashboard')
  } catch (error) {
    console.error('Error logging in admin:', error)
    res.status(500).render('home', {
      message:
        'We are facing some internal server error. Please try again later.',
    })
  }
}

// verfiy otp
const verifyOtp = async (req, res) => {
  try {
    const otpCollection = getCollection('otp')
    const otpData = await otpCollection.findOne({ otp: req.body.otp })
    if (!otpData) {
      return res.status(404).json({ error: 'Invalid OTP.' })
    }
    // check the expiry time of otp and if it has expired delete the otp
    if (otpData.expires < Date.now()) {
      await otpCollection.deleteOne({ otp: req.body.otp })
      return res.status(400).json({ error: 'OTP has expired.' })
    }
    const token = req.body.token
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized.' })
    }
    res.status(200).json({ message: 'OTP verified successfully.' })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

const addAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized.' })
    }
    // Decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized.' })
    }

    const adminCollection = getCollection('admin')
    const hashedPassword = await hashInputData(req.body.password)
    const adminData = {
      email: req.body.email,
      password: hashedPassword,
      username: req.body.username,
      role: req.body.role,
      privilege: req.body.privilege, 
      phone: req.body.phone,
    }

    // Verify if an admin with the provided email, phone, or username already exists
    const existingAdmin = await adminCollection.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone },
        { username: req.body.username },
      ],
    })

    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin already exists.' })
    }

    // Insert the data into the admin collection
    await adminCollection.insertOne(adminData)
    return res.status(200).json({ message: 'Admin added successfully' })
  } catch (error) {
    console.error('Error adding admin:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

// delete the admin from the admin collection
const deleteAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.findOne({ email: req.body.email })
    if (!data) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    // delete the admin from the admin collection
    else {
      await adminCollection.deleteOne({ email: req.body.email })
      res.status(200).json({ message: 'Admin deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// update the admin in the admin collection
const updateAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.findOne({ email: req.body.email })
    if (!data) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    // update the admin in the admin collection
    else {
      await adminCollection.updateOne(
        { email: req.body.email },
        { $set: req.body },
      )
      res.status(200).json({ message: 'Admin updated successfully' })
    }
  } catch (error) {
    console.error('Error updating admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// get the admin from the admin collection
const getAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.find().toArray()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error getting admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// search the admin in the admin collection
const searchAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // Decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    // Search for an admin using either email, phone, or username
    const existingAdmin = await adminCollection.findOne({
      $or: [
        { email: req.body.email },
        { phone: req.body.phone },
        { username: req.body.username },
      ],
    })
    if (!existingAdmin) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    res.status(200).json(existingAdmin)
  } catch (error) {
    console.error('Error searching admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

// suspend the admin in the admin collection
const suspendAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.findOne({ email: req.body.email })
    if (!data) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    // suspend the admin in the admin collection
    else {
      await adminCollection.updateOne(
        { email: req.body.email },
        { $set: { status: 'suspended' } },
      )
      const emailMessage = `Your account has been suspended, you don't have access to the
         portal unless unsuspended by the Nishkaam Innovations.
         `
      // Send the verification link to the user's email
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'ACCOUNT SUSPENDED',
        text: `${emailMessage}`,
      }

      // Send mail with defined transport object
      await transporter.sendMail(mailOptions)
      res.status(200).json({
        message:
          'The user is notified about the suspension of the account through email.',
      })
    }
  } catch (error) {
    console.error('Error suspending admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
//unsuspend the admin in the admin collection
const unsuspendAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.findOne({ email: req.body.email })
    if (!data) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    // unsuspend the admin in the admin collection
    else {
      await adminCollection.updateOne(
        { email: req.body.email },
        { $set: { status: 'active' } },
      )
      const emailMessage = `Your account has been unsuspended, You are now having the access back tohe Nishkaam Innovations.
        `
      // Send the verification link to the user's email
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'ACCOUNT SUSPENDED',
        text: `${emailMessage}`,
      }

      // Send mail with defined transport object
      await transporter.sendMail(mailOptions)
      res.status(200).json({
        message:
          'The user is notified about the suspension of the account through email.',
      })
    }
  } catch (error) {
    console.error('Error unsuspending admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// get the suspended admin from the admin collection
const getSuspendedAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.find({ status: 'suspended' }).toArray()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error getting suspended admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// get the active admin from the admin collection
const getActiveAdmin = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.find({ status: 'active' }).toArray()
    res.status(200).json(data)
  } catch (error) {
    console.error('Error getting active admin:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
// get the admin by id from the admin collection
const getAdminById = async (req, res) => {
  try {
    const token = req.header('Authorization')
    const decoded = verifyAuthToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // decode the token and check if the admin is superadmin
    if (decoded.role !== 'superadmin') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    const adminCollection = getCollection('admin')
    const data = await adminCollection.findOne({ _id: req.params.id })
    if (!data) {
      return res.status(404).json({ error: 'Admin not found' })
    }
    res.status(200).json(data)
  } catch (error) {
    console.error('Error getting admin by id:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}

module.exports = {
  superAdminSignup,
  superAdminLogin,
  addAdmin,
  deleteAdmin,
  updateAdmin,
  getAdmin,
  searchAdmin,
  suspendAdmin,
  unsuspendAdmin,
  getSuspendedAdmin,
  getActiveAdmin,
  getAdminById,
  verifyOtp,
}
