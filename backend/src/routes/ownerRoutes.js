const express = require('express');
const {
  updatePassword,
  getOwnerDashboard
} = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all store owner routes with auth and STORE_OWNER role check
router.use(authenticateToken, authorizeRoles('STORE_OWNER'));

// Password API
router.put('/password', updatePassword);

// Dashboard API
router.get('/dashboard', getOwnerDashboard);

module.exports = router;
