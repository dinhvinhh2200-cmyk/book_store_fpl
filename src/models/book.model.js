const { create } = require('express-handlebars');
const db = require('../config/db')

const Book = {
    getAllActive: async () => {
        const [rows] = await db.execute('SELECT * FROM books WHERE is_deleted = 0');
        return rows;
    },

    // Hàm ngừng phục vụ (ẩn sách)
    softDelete: async (id) => {
        const query = 'UPDATE books SET is_deleted = 1 WHERE id = ?';
        return await db.execute(query, [id]);
    },

    // lay sach cho trang admin
    // Cập nhật hàm getAllForAdmin trong src/models/book.model.js
    getAllForAdmin: async () => {
        const query = `
        SELECT books.*, categories.name AS category_name 
        FROM books 
        LEFT JOIN categories ON books.category_id = categories.id
    `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // Hàm xóa vĩnh viễn sách khỏi database
    delete: async (id) => {
        const query = 'DELETE FROM books WHERE id = ?';
        return await db.execute(query, [id]);
    },


    // ham tạo mới sách
    create: async (data) => {
        // 1. Kiểm tra và lấy đúng tên biến từ Controller truyền sang
        // Bổ sung lấy category_id từ đối tượng data
        const title = data.title ? data.title.trim() : null;
        const author = data.author || null;
        const description = data.description || null;
        const image_url = data.image || data.image_url || null;
        const pdf_url = data.pdf_url || null;
        const category_id = data.category_id || null; // Lấy category_id

        // 2. Cập nhật câu lệnh SQL để thêm cột category_id
        const query = 'INSERT INTO books (title, author, description, image_url, pdf_url, category_id) VALUES (?, ?, ?, ?, ?, ?)';

        // 3. Thực thi với mảng các giá trị bao gồm category_id
        return await db.execute(query, [title, author, description, image_url, pdf_url, category_id]);
    },

    getById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id])
        return rows[0]
    },

    update: async (id, data) => {
        const title = data.title ? data.title.trim() : null;
        const author = data.author || null;
        const description = data.description || null;
        const image_url = data.image_url || null;
        const pdf_url = data.pdf_url || null;
        const category_id = data.category_id || null; // Nhận category_id từ controller

        // Cập nhật câu lệnh SQL thêm trường category_id
        const query = 'UPDATE books SET title = ?, author = ?, description = ?, image_url = ?, pdf_url = ?, category_id = ? WHERE id = ?';
        return await db.execute(query, [title, author, description, image_url, pdf_url, category_id, id]);
    },

    async getBookById(id) {
        const [rows] = await db.execute('SELECT * FROM books WHERE id = ?', [id])
        return rows[0]
    },

    // Tìm sách theo tên nhưng loại trừ ID hiện tại
    async findByNameExcludingId(title, id) {
        const cleanTitle = title ? title.trim() : ''
        const [rows] = await db.execute(
            'SELECT * FROM books WHERE title = ? AND id != ?',
            [cleanTitle, id]
        );
        return rows[0];
    },

    // Thêm hàm này vào trong class Book
    async findByName(title) {
        const cleanTitle = title ? title.trim() : ''
        const [rows] = await db.execute('SELECT * FROM books WHERE title = ?', [cleanTitle]);
        return rows[0]; // Trả về sách nếu tìm thấy, ngược lại là undefined
    },

    // Hàm tìm kiếm sách theo tiêu đề
    searchByName: async (keyword) => {
        const query = 'SELECT * FROM books WHERE title LIKE ?';
        const [rows] = await db.execute(query, [`%${keyword}%`]);
        return rows;
    },

    // lấy tất cả danh mục để hiển thị lên giao diện 
    getAllCategories: async () => {
        const [rows] = await db.execute('SELECT * FROM categories');
        return rows;
    },

    // tìm kiếm sách theo từ khóa và danh mục
    searchByFilter: async (keyword, categoryId) => {
        // Thêm điều kiện is_deleted = 0 vào ngay từ đầu
        let query = 'SELECT * FROM books WHERE is_deleted = 0';
        let params = [];

        if (keyword) {
            query += ' AND title LIKE ?';
            params.push(`%${keyword}%`);
        }

        if (categoryId) {
            query += ' AND category_id = ?';
            params.push(categoryId);
        }

        const [rows] = await db.execute(query, params);
        return rows;
    },

    // 2. THÊM MỚI: Hàm phục hồi sách (Hiện lại)
    restore: async (id) => {
        const query = 'UPDATE books SET is_deleted = 0 WHERE id = ?';
        return await db.execute(query, [id]);
    }
}
module.exports = Book

// viết hàm thêm sách vào database 