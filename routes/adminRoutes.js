const express = require('express')
const router = express.Router()
// Import controllers
const adminController = require('../Controllers/adminController')
const {
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
} = adminController
// super Admin Signup
router.post('/Signup', superAdminSignup)
// Super Admin Login
router.post('/Login', superAdminLogin)
// Add Admin
router.post('/add', addAdmin)
// Delete Admin
router.delete('/delete/:id', deleteAdmin)
// Update Admin
router.put('/update/:id', updateAdmin)
// Get Admin
router.get('/get', getAdmin)
// Search Admin
router.get('/admins', searchAdmin)
// Suspend Admin
router.put('/suspend/:id', suspendAdmin)
// Unsuspend Admin
router.put('/unsuspend/:id', unsuspendAdmin)
// get suspended Admin
router.get('/suspended', getSuspendedAdmin)
// get active Admin
router.get('/active', getActiveAdmin)
// get Admin by id
router.get('/get/:id', getAdminById)
// verify otp
router.post('/verify', verifyOtp)

module.exports = router
