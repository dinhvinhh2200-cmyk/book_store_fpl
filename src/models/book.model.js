const { create } = require('express-handlebars');
const db = require('../config/db')

const Book = {
    getAllActive: async () => {
        const [rows] = await db.execute('SELECT * FROM books'); 
        return rows;
    },

    // lay sach cho trang admin
    getAllForAdmin: async () => {
        const [rows] = await db.execute('SELECT * FROM books')
        return rows
    },

    // Hàm xóa vĩnh viễn sách khỏi database
    delete: async (id) => {
        const query = 'DELETE FROM books WHERE id = ?';
        return await db.execute(query, [id]);
    },


    // ham tạo mới sách
    create: async (data) => {
        // 1. Kiểm tra và lấy đúng tên biến từ Controller truyền sang
        // Controller truyền { title, author, description, image }
        const title = data.title ? data.title.trim() : null;
        const author = data.author || null;
        const description = data.description || null;
        const image_url = data.image || data.image_url || null; // Chấp nhận cả image hoặc image_url
        const pdf_url = data.pdf_url || null;

        // 2. Sửa lại câu lệnh SQL (Chữ INSERT viết đúng chuẩn)
        const query = 'INSERT INTO books (title, author, description, image_url, pdf_url) VALUES (?, ?, ?, ?, ?)';

        // 3. Thực thi với mảng các giá trị chắc chắn không bị undefined
        return await db.execute(query, [title, author, description, image_url, pdf_url]);
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
        const pdf_url = data.pdf_url || null; // Lấy thêm trường này từ data

        // Thêm pdf_url vào câu lệnh UPDATE
        const query = 'UPDATE books SET title = ?, author = ?, description = ?, image_url = ?, pdf_url = ? WHERE id = ?';
        return await db.execute(query, [title, author, description, image_url, pdf_url, id]);
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
    }
}
module.exports = Book

// viết hàm thêm sách vào database 