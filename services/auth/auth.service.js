const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./auth.model');

class AuthService {
  // Generate JWT token
  generateToken(user) {
    const payload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Login user
  async login(username, password) {
    try {
      // Check if it's the admin login from environment
      if (username === process.env.ADMIN_USERNAME) {
        const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (isValidPassword) {
          const adminUser = {
            userId: 1,
            username: process.env.ADMIN_USERNAME,
            role: 'admin',
          };
          const token = this.generateToken(adminUser);
          return {
            success: true,
            token,
            user: adminUser,
            message: 'Login successful',
          };
        }
      }

      // Check database users
      const user = await User.findOne({ username, isActive: true });
      if (!user) {
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid username or password',
        };
      }

      // Update last login
      await User.updateOne(
        { userId: user.userId },
        { 
          lastLogin: new Date(),
          modifiedDate: new Date(),
        }
      );

      const token = this.generateToken(user);
      
      return {
        success: true,
        token,
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role,
        },
        message: 'Login successful',
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Create new user (admin only)
  async createUser(userData) {
    try {
      const { username, password, role = 'user' } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Get next user ID
      const lastUser = await User.findOne().sort({ userId: -1 });
      const nextUserId = lastUser ? lastUser.userId + 1 : 2; // Start from 2 (1 is admin)

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const user = new User({
        userId: nextUserId,
        username,
        passwordHash,
        role,
        createdDate: new Date(),
        modifiedDate: new Date(),
      });

      await user.save();

      return {
        userId: user.userId,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        createdDate: user.createdDate,
      };
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  // Get all users
  async getAllUsers() {
    return await User.find({ isActive: true })
      .select('-passwordHash')
      .sort({ createdDate: -1 });
  }

  // Update user
  async updateUser(userId, userData) {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        throw new Error('User not found');
      }

      const updateData = {
        ...userData,
        modifiedDate: new Date(),
      };

      // If password is being updated, hash it
      if (userData.password) {
        updateData.passwordHash = await this.hashPassword(userData.password);
        delete updateData.password;
      }

      await User.updateOne({ userId }, updateData);
      
      const updatedUser = await User.findOne({ userId }).select('-passwordHash');
      return updatedUser;
    } catch (error) {
      throw new Error(`User update failed: ${error.message}`);
    }
  }

  // Delete user (deactivate)
  async deleteUser(userId) {
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        throw new Error('User not found');
      }

      await User.updateOne(
        { userId },
        { 
          isActive: false,
          modifiedDate: new Date(),
        }
      );

      return true;
    } catch (error) {
      throw new Error(`User deletion failed: ${error.message}`);
    }
  }
}

module.exports = new AuthService();