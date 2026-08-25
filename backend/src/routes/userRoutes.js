const express = require('express');
const {
  updatePassword,
  getStores,
  submitRating
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all normal user routes with auth and NORMAL role check
router.use(authenticateToken, authorizeRoles('NORMAL'));

// Password API
router.put('/password', updatePassword);

// Store API (List & Search)
router.get('/stores', getStores);

// Rating API (Submit / Update rating)
router.post('/ratings', submitRating);

module.exports = router;
