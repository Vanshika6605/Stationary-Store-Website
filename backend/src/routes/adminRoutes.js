const express = require('express');
const {
  getDashboardStats,
  addUser,
  getUsers,
  addStore,
  getStores
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Apply auth & ADMIN authorization middleware to all admin routes
router.use(authenticateToken, authorizeRoles('ADMIN'));

// Dashboard Stats API
router.get('/dashboard', getDashboardStats);

// User Management APIs
router.post('/users', addUser);
router.get('/users', getUsers);

// Store Management APIs
router.post('/stores', addStore);
router.get('/stores', getStores);

module.exports = router;
