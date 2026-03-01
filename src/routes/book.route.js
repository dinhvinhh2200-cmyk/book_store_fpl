const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// Import các Controllers
const bookController = require('../controllers/book.controller');
const reviewController = require('../controllers/review.controller');

// Import Middlewares
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const authMiddleware = require('../middlewares/auth.middleware');

// THAY BẰNG ĐOẠN NÀY (Copy logic từ app.js sang để đảm bảo phân loại):
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, path.join(__dirname, '../public/pdf')); // Lưu vào public/pdf
        } else {
            cb(null, path.join(__dirname, '../public/img')); // Lưu vào public/img
        }
    },
    filename: function (req, file, cb) {
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

router.get('/books/read/:id', authMiddleware.verifyToken, bookController.readBook);

module.exports = router;