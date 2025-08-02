const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateToken, requireAdmin } = require('./auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/verify-token', authController.verifyToken);

// Protected routes (admin only)
router.post('/users', authenticateToken, requireAdmin, authController.createUser);
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.put('/users/:userId', authenticateToken, requireAdmin, authController.updateUser);
router.delete('/users/:userId', authenticateToken, requireAdmin, authController.deleteUser);

module.exports = router;