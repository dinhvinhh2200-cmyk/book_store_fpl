const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Áp dụng middleware cho tất cả route danh mục admin
router.use(verifyToken, isAdmin);

router.get('/', categoryController.listCategories);
router.post('/add', categoryController.addCategory);
router.get('/delete/:id', categoryController.deleteCategory);

module.exports = router;