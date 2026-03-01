const Book = require('../models/book.model');
const Review = require('../models/review.model');
const Reading = require('../models/reading.model');

exports.readBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;

        // Lưu vào lịch sử đọc
        await Reading.addToHistory(userId, bookId);

        // Lấy thông tin sách để lấy pdf_url
        const book = await Book.getById(bookId);

        // Chuyển hướng đến file PDF thực tế
        res.redirect(`/pdf/${book.pdf_url}`);
    } catch (error) {
        res.status(500).send('Lỗi khi mở sách');
    }
};

// Sửa lại hàm getAllBooks trong src/controllers/book.controller.js
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search || '';
        const categoryId = req.query.category || '';

        const rawCategories = await Book.getAllCategories();

        // Xử lý logic so sánh ở đây thay vì dùng helper ở View
        const categories = rawCategories.map(cat => ({
            ...cat,
            isSelected: String(cat.id) === String(categoryId) // Đánh dấu mục đang chọn
        }));

        const books = await Book.searchByFilter(keyword.trim(), categoryId);

        res.render('home', {
            books,
            categories, // Danh sách này đã có sẵn thuộc tính isSelected
            keyword
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
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

// Cập nhật hàm getAddBook để truyền danh mục sang view
exports.getAddBook = async (req, res) => {
    try {
        const categories = await Book.getAllCategories();
        res.render('admin/add-book', { layout: 'admin', categories });
    } catch (error) {
        res.status(500).send('Lỗi tải trang thêm sách');
    }
};

// SỬA TẠI ĐÂY: Đổi 'export const' thành 'exports.postAddBook'
// Cập nhật hàm postAddBook để nhận category_id
exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, category_id } = req.body; // Lấy category_id ở đây
        const cleanTitle = title ? title.trim() : '';

        // Logic kiểm tra trùng tên...

        const image = req.files['image'] ? req.files['image'][0].filename : '';
        const pdf_url = req.files['pdf'] ? req.files['pdf'][0].filename : '';

        // Truyền category_id vào hàm create
        await Book.create({ title: cleanTitle, author, description, image, pdf_url, category_id });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
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
        const rawCategories = await Book.getAllCategories(); // Lấy tất cả danh mục

        // Đánh dấu danh mục hiện tại của sách để hiển thị "selected" trong dropdown
        const categories = rawCategories.map(cat => ({
            ...cat,
            isSelected: Number(cat.id) === Number(book.category_id)
        }));

        res.render('admin/edit-book', {
            book,
            categories, // Truyền danh sách danh mục sang view
            layout: 'admin'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy thông tin sách');
    }
};

exports.postEditBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { author, description, category_id } = req.body; // Lấy thêm category_id
        const title = req.body.title ? req.body.title.trim() : '';

        const duplicateBook = await Book.findByNameExcludingId(title, id);
        if (duplicateBook) {
            const book = await Book.getById(id);
            const categories = await Book.getAllCategories();
            return res.render('admin/edit-book', {
                layout: 'admin',
                book: { ...book, title, author, description, category_id },
                categories,
                errorMessage: 'Tiêu đề sách này đã được sử dụng bởi một sách khác!'
            });
        }

        const book = await Book.getById(id);
        const image_url = (req.files && req.files['image']) ? req.files['image'][0].filename : book.image_url;
        const pdf_url = (req.files && req.files['pdf']) ? req.files['pdf'][0].filename : book.pdf_url;

        // Cập nhật vào database bao gồm cả category_id
        await Book.update(id, { title, author, description, image_url, pdf_url, category_id });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi cập nhật sách');
    }
};

exports.getBookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await Book.getBookById(bookId);

        if (!book) {
            return res.status(404).send('Không tìm thấy sách');
        }

        const reviews = await Review.getByBookIdActive(bookId);

        let hasReviewed = false;
        let canReview = false; // Mặc định là không được đánh giá

        // Kiểm tra quyền nếu người dùng đã đăng nhập
        if (req.user) {
            // 1. Kiểm tra xem đã đánh giá chưa
            hasReviewed = await Review.checkExistingReview(bookId, req.user.id);

            // 2. Kiểm tra xem đã có lịch sử "Đọc" trong Database chưa
            canReview = await Reading.hasRead(req.user.id, bookId);
        }

        // Truyền đầy đủ các biến sang View
        res.render('book-detail', {
            book,
            reviews,
            hasReviewed,
            canReview, // Biến này cực kỳ quan trọng để file .hbs không bị lỗi
            title: book.title,
            user: req.user
        });
    } catch (error) {
        console.error("Lỗi getBookDetail:", error);
        res.status(500).send('Lỗi máy chủ: ' + error.message);
    }
};