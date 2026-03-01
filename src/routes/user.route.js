const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const reviewController = require('../controllers/review.controller');

router.get('/admin/reviews', isAdmin, reviewController.getAdminReviews);

// Áp dụng middleware bảo vệ: Chỉ Admin mới có quyền truy cập các route này
router.use(verifyToken, isAdmin);

// 2. Tự động thiết lập layout là 'admin' cho tất cả response render từ file này
router.use((req, res, next) => {
    res.locals.layout = 'admin'; 
    next();
});

// Đường dẫn: /admin/users
router.get('/admin/users', userController.index);

// Đường dẫn xóa mềm: /admin/users/delete/:id
// Dùng POST để bảo mật hơn thay vì GET
router.post('/admin/users/delete/:id', userController.softDelete);

// (Tùy chọn) Đường dẫn khôi phục user: /admin/users/restore/:id
router.post('/admin/users/restore/:id', userController.restore);

module.exports = router;