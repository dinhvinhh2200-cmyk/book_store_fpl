const Book = require('../models/book.model');
const Review = require('../models/review.model');

// Sửa lại hàm getAllBooks trong src/controllers/book.controller.js
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search || ''; // Lấy từ khóa từ query string (?search=abc)
        let books;

        if (keyword) {
            // Nếu có từ khóa thì lọc theo tên
            books = await Book.searchByName(keyword.trim());
        } else {
            // Nếu không có thì lấy tất cả
            books = await Book.getAllActive();
        }

        res.render('home', {
            books,
            keyword // Gửi lại từ khóa để hiển thị trên thanh tìm kiếm
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy dữ liệu sách');
    }
};

exports.getAdminBooks = async (req, res) => {
    try {
        const books = await Book.getAllForAdmin();
        res.render('admin/list-books', {
            layout: 'admin',
            books
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy dữ liệu sách');
    }
};

exports.getAddBook = (req, res) => {
    res.render('admin/add-book');
};

// SỬA TẠI ĐÂY: Đổi 'export const' thành 'exports.postAddBook'
exports.postAddBook = async (req, res) => {
    try {
        const title = req.body.title ? req.body.title.trim() : '';
        const { author, description } = req.body;

        // Kiểm tra trùng tên
        const existingBook = await Book.findByName(title);
        if (existingBook) {
            // Render lại trang add-book kèm thông báo lỗi
            return res.render('admin/add-book', {
                layout: 'admin',
                errorMessage: 'Tiêu đề sách này đã tồn tại!',
                oldData: { ...req.body, title } // Giữ lại dữ liệu đã nhập để người dùng không phải viết lại
            });
        }

        // ... logic Multer lấy file ...
        const image = req.files['image'] ? req.files['image'][0].filename : '';
        const pdf_url = req.files['pdf'] ? req.files['pdf'][0].filename : '';

        await Book.create({ title, author, description, image, pdf_url });
        res.redirect('/admin');
    } catch (error) {
        res.status(500).send('Lỗi máy chủ');
    }
};

// Thay thế postSoftDelete và xóa bỏ postRestore
exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;

        // 1. Kiểm tra xem sách có bình luận nào không
        const reviewCount = await Review.countByBookId(bookId);

        if (reviewCount > 0) {
            // Nếu có bình luận, không cho xóa vĩnh viễn
            const books = await Book.getAllForAdmin();
            return res.render('admin/list-books', {
                layout: 'admin',
                books,
                errorMessage: 'Không thể xóa sách này vì đã có khách hàng bình luận!'
            });
        }

        // 2. Nếu không có bình luận, tiến hành XÓA CỨNG
        await Book.delete(bookId);
        res.redirect('/admin');

    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ khi thực hiện xóa sách');
    }
};

exports.getEditBook = async (req, res) => {
    try {
        const book = await Book.getById(req.params.id);
        res.render('admin/edit-book', { book, layout: 'admin' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy thông tin sách');
    }
};

exports.postEditBook = async (req, res) => {
    try {
        const { id } = req.params;
        const title = req.body.title ? req.body.title.trim() : '';
        const { author, description } = req.body;

        // 1. Kiểm tra xem tiêu đề mới có trùng với sách khác không
        const duplicateBook = await Book.findByNameExcludingId(title, id);
        if (duplicateBook) {
            // Lấy lại thông tin sách hiện tại để hiển thị lại form
            const book = await Book.getById(id);
            return res.render('admin/edit-book', {
                layout: 'admin',
                book: { ...book, title, author, description }, // Giữ lại các giá trị user vừa nhập sai
                errorMessage: 'Tiêu đề sách này đã được sử dụng bởi một sách khác!'
            });
        }

        const book = await Book.getById(id);
        const image_url = (req.files && req.files['image']) ? req.files['image'][0].filename : book.image_url;
        const pdf_url = (req.files && req.files['pdf']) ? req.files['pdf'][0].filename : book.pdf_url;

        // 2. Cập nhật vào database
        await Book.update(id, { title, author, description, image_url, pdf_url });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật sách');
    }
};

exports.getBookDetail = async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);
        if (!book) {
            return res.status(404).send('Không tìm thấy sách');
        }

        const bookId = book.id;
        const reviews = await Review.getByBookIdActive(bookId);

        let hasReviewed = false;
        if (req.user) {
            hasReviewed = await Review.checkExistingReview(bookId, req.user.id);
        }

        res.render('book-detail', {
            book,
            reviews,
            hasReviewed,
            title: book.title,
            user: req.user
        });
    } catch (error) {
        console.error("Lỗi getBookDetail:", error);
        res.status(500).send(error.message);
    }
};