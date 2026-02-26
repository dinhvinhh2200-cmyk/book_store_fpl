const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Trang đăng ký
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Trang đăng nhập (Gộp lại để xử lý cả query success)
router.get('/login', authController.showLogin); 

// Xử lý logic đăng nhập
router.post('/login', authController.login);

// Đăng xuất
router.get('/logout', authController.logout);

module.exports = router;