const db = require('../config/db');

const Reading = {
    // Ghi nhận người dùng đã đọc sách
    addToHistory: async (userId, bookId) => {
        const query = 'INSERT IGNORE INTO reading_history (user_id, book_id) VALUES (?, ?)';
        return await db.execute(query, [userId, bookId]);
    },

    // Kiểm tra xem người dùng đã đọc cuốn sách này chưa
    hasRead: async (userId, bookId) => {
        const [rows] = await db.execute(
            'SELECT * FROM reading_history WHERE user_id = ? AND book_id = ?',
            [userId, bookId]
        );
        return rows.length > 0;
    },

    hasAnyRead: async (bookId) => {
        const [rows] = await db.execute(
            'SELECT id FROM reading_history WHERE book_id = ? LIMIT 1',
            [bookId]
        );
        return rows.length > 0;
    }
};

module.exports = Reading;