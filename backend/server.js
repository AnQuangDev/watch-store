const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (trong thực tế nên dùng MongoDB, PostgreSQL, etc.)
let users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@watchstore.com",
    password: "123456", // password
    role: "admin", // admin, user
    permissions: ["read", "write", "delete", "manage_users"],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Regular User",
    email: "user@watchstore.com",
    password: "123456", // password
    role: "user",
    permissions: ["read"],
    createdAt: new Date().toISOString()
  }
];

// Utility functions
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid token. User not found.' });
    }
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid token.' });
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

// Permission-based access control middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Get user role and permissions
const getUserRole = (userId) => {
  const user = users.find(u => u.id === userId);
  return user ? { role: user.role, permissions: user.permissions } : null;
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Watch Store API is running!' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Họ tên phải có ít nhất 2 ký tự'
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email không hợp lệ'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user", // Default role for new registrations
      permissions: ["read"], // Default permissions for users
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    // Return user info (without password)
    const userInfo = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: newUser.permissions,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=3b82f6&color=fff&size=128&rounded=true&bold=true`
    };

    res.status(201).json({
      success: true,
      user: userInfo,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi đăng ký'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền email và mật khẩu'
      });
    }

    // Find user
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Check password
    let isPasswordValid = false;
    
    // Temporary: check for plain text passwords
    if (user.password === password) {
      isPasswordValid = true;
    } else {
      // Check hashed password
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user info (without password)
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128&rounded=true&bold=true`
    };

    res.json({
      success: true,
      user: userInfo,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi đăng nhập'
    });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy người dùng'
      });
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=128&rounded=true&bold=true`
    };

    res.json({
      success: true,
      user: userInfo
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra'
    });
  }
});

// Get all users (admin only)
app.get('/api/users', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const usersInfo = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      createdAt: user.createdAt,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`
    }));

    res.json({
      success: true,
      users: usersInfo,
      total: usersInfo.length,
      requestedBy: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra'
    });
  }
});

// Admin endpoints

// Update user role (admin only)
app.put('/api/admin/users/:id/role', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    // Validate role
    const validRoles = ['admin', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Valid roles: ${validRoles.join(', ')}`
      });
    }

    // Find user
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow changing own role
    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role'
      });
    }

    // Update role and permissions
    users[userIndex].role = role;
    users[userIndex].permissions = permissions || (role === 'admin' ? ['read', 'write', 'delete', 'manage_users'] : ['read']);

    const updatedUser = {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      role: users[userIndex].role,
      permissions: users[userIndex].permissions,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(users[userIndex].name)}&background=3b82f6&color=fff`
    };

    res.json({
      success: true,
      user: updatedUser,
      message: `User role updated to ${role}`
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi cập nhật role'
    });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', verifyToken, requireRole(['admin']), (req, res) => {
  try {
    const { id } = req.params;
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow deleting own account
    if (users[userIndex].id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);

    res.json({
      success: true,
      message: `User ${deletedUser.name} has been deleted`,
      deletedUser: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra khi xóa user'
    });
  }
});

// Get user permissions (for current user)
app.get('/api/auth/permissions', verifyToken, (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
        permissions: req.user.permissions
      }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Có lỗi xảy ra'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Watch Store API Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
