const authService = require('./auth.service');

class AuthController {
  // POST /auth/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required',
        });
      }

      const result = await authService.login(username, password);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  // POST /auth/verify-token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      const decoded = authService.verifyToken(token);
      
      return res.status(200).json({
        success: true,
        user: decoded,
        message: 'Token is valid',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  }

  // POST /auth/users (admin only)
  async createUser(req, res) {
    try {
      const user = await authService.createUser(req.body);
      return res.status(201).json({
        success: true,
        user,
        message: 'User created successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /auth/users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await authService.getAllUsers();
      return res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /auth/users/:userId (admin only)
  async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      const user = await authService.updateUser(userId, req.body);
      return res.status(200).json({
        success: true,
        user,
        message: 'User updated successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /auth/users/:userId (admin only)
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      await authService.deleteUser(userId);
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AuthController();