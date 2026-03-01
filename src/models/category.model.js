const db = require('../config/db');

const Category = {
    // Lấy tất cả danh mục
    getAll: async () => {
        const [rows] = await db.execute('SELECT * FROM categories');
        return rows;
    },

    // Lấy chi tiết 1 danh mục
    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
        return rows[0];
    },

    // kiểm tra trùng tên danh mục 
    checkExists: async (name, id = null) => {
        let query = 'SELECT * FROM categories WHERE name = ?';
        let params = [name.trim()];

        if (id) {
            query += ' AND id != ?';
            params.push(id);
        }

        const [rows] = await db.execute(query, params);
        return rows.length > 0;
    },

    // Tạo mới danh mục
    create: async (name) => {
        const query = 'INSERT INTO categories (name) VALUES (?)';
        return await db.execute(query, [name]);
    },

    // Cập nhật danh mục
    update: async (id, name) => {
        const query = 'UPDATE categories SET name = ? WHERE id = ?';
        return await db.execute(query, [name.trim(), id]);
    },

    // Kiểm tra xem danh mục có đang chứa sách không
    countBooks: async (id) => {
        const query = 'SELECT COUNT(*) as count FROM books WHERE category_id = ?';
        const [rows] = await db.execute(query, [id]);
        return rows[0].count;
    },

    // Xóa danh mục
    delete: async (id) => {
        const query = 'DELETE FROM categories WHERE id = ?';
        return await db.execute(query, [id]);
    }
};

module.exports = Category;