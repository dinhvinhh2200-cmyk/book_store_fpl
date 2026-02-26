const db = require('../config/db');

const Review = {

    countByBookId: async (bookId) => {
        const [rows] = await db.execute('SELECT COUNT(*) as total FROM reviews WHERE book_id = ?', [bookId]);
        return rows[0].total;
    },

    // Kiểm tra xem đã tồn tại đánh giá chưa
    checkExistingReview: async (book_id, user_id) => {
        const [rows] = await db.execute(
            'SELECT * FROM reviews WHERE book_id = ? AND user_id = ?',
            [book_id, user_id]
        );
        return rows.length > 0;
    },

    create: async (reviewData) => {
        const { book_id, user_id, rating, comment } = reviewData;
        const [result] = await db.execute(
            'INSERT INTO reviews (book_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [book_id, user_id, rating, comment]
        );
        return result;
    },

    getByBookId: async (bookId) => {
        const [rows] = await db.execute(
            `SELECT r.*, u.name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.book_id = ? 
             ORDER BY r.created_at DESC`,
            [bookId]
        );
        return rows;
    },

    // Lấy tất cả bình luận cho Admin
    getAllForAdmin: async () => {
        const [rows] = await db.execute(
            `SELECT r.*, u.name, b.title as book_title 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             JOIN books b ON r.book_id = b.id 
             ORDER BY r.created_at DESC`
        );
        return rows;
    },

    // Cập nhật trạng thái ẩn/hiện
    toggleVisibility: async (id, status) => {
        return await db.execute('UPDATE reviews SET is_hidden = ? WHERE id = ?', [status, id]);
    },

    // Chỉ lấy các bình luận không bị ẩn để hiện ra trang chi tiết sách
    getByBookIdActive: async (bookId) => {
        const [rows] = await db.execute(
            `SELECT r.*, u.name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.book_id = ? AND r.is_hidden = 0
             ORDER BY r.created_at DESC`,
            [bookId]
        );
        return rows;
    }
};

module.exports = Review;