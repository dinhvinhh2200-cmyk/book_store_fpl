const db = require('../config/db')

const User = {
    // Tìm người dùng theo email (để login)
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND is_deleted = 0', [email]);
        return rows[0];
    },

    findByUsername: async (username) => {
        const cleanName = username ? username.trim() : ''
        const query = 'SELECT * FROM users WHERE name = ?'
        const [rows] = await db.execute(query, [cleanName])
        return rows[0]
    },

    // Tạo mới tài khoản
    create: async (userData) => {
        const name = userData.name ? userData.name.trim() : null
        const email =  userData.email || null
        const password = userData.password || null
        const [result] = await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password])
        return result.insertId
    },

    // Lấy tất cả người dùng chưa bị xóa
    getAllActive: async () => {
        // Đổi username -> name
        const [rows] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE is_deleted = 0');
        return rows;
    },

    // Lấy tất cả (cho Admin quản lý)
    getAll: async () => {
        // Đổi username -> name
        const [rows] = await db.query('SELECT id, name, email, role, is_deleted FROM users');
        return rows;
    },

    // Tìm user theo ID
    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND is_deleted = 0', [id]);
        return rows[0];
    },

    // Xóa mềm
    softDelete: async (id) => {
        const [result] = await db.query('UPDATE users SET is_deleted = 1 WHERE id = ?', [id]);
        return result;
    },

    // Khôi phục
    restore: async (id) => {
        const [result] = await db.query('UPDATE users SET is_deleted = 0 WHERE id = ?', [id]);
        return result;
    }
}

module.exports = User