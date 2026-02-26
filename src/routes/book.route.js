const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// Import các Controllers
const bookController = require('../controllers/book.controller');
const reviewController = require('../controllers/review.controller');

// Import Middlewares
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Cấu hình Multer để lưu trữ ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/img'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 1. ROUTES CÔNG KHAI (Ai cũng có thể xem)
// ==========================================
router.get('/', bookController.getAllBooks);
router.get('/book/:id', bookController.getBookDetail);

// ==========================================
// 2. ROUTES DÀNH CHO USER ĐÃ ĐĂNG NHẬP
// ==========================================
// Gửi đánh giá sách (Chỉ cần đăng nhập là được)
router.post('/books/review', verifyToken, reviewController.addReview);

// ==========================================
// 3. ROUTES DÀNH CHO ADMIN (Quản lý hệ thống)
// ==========================================

// Trang danh sách sách dành cho admin
router.get('/admin', verifyToken, isAdmin, bookController.getAdminBooks);

// Thêm sách mới
router.get('/admin/add', verifyToken, isAdmin, bookController.getAddBook);
router.post('/admin/add', upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'pdf', maxCount: 1 }
]), bookController.postAddBook);

// Chỉnh sửa sách
router.get('/admin/edit/:id', verifyToken, isAdmin, bookController.getEditBook);
router.post('/admin/edit/:id', upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'pdf', maxCount: 1 }
]), bookController.postEditBook);

// Xóa và Khôi phục sách (Soft Delete)
router.get('/admin/delete/:id', verifyToken, isAdmin, bookController.deleteBook);

module.exports = router;