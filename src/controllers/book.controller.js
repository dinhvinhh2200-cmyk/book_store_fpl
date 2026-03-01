const Book = require('../models/book.model');
const Review = require('../models/review.model');
const Reading = require('../models/reading.model');

// Hiển thị sách cho người dùng (Chỉ lấy sách đang phục vụ)
exports.getAllBooks = async (req, res) => {
    try {
        const keyword = req.query.search || '';
        const categoryId = req.query.category || '';

        const rawCategories = await Book.getAllCategories();
        const categories = rawCategories.map(cat => ({
            ...cat,
            isSelected: String(cat.id) === String(categoryId)
        }));

        // CẦN ĐẢM BẢO: searchByFilter trong model phải lọc thêm điều kiện is_deleted = 0
        const books = await Book.searchByFilter(keyword.trim(), categoryId);

        res.render('home', {
            books,
            categories,
            keyword
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
};

// Hiển thị danh sách cho Admin (Thấy tất cả bao gồm cả sách đã ẩn)
exports.getAdminBooks = async (req, res) => {
    try {
        const books = await Book.getAllForAdmin();
        res.render('admin/list-books', {
            layout: 'admin',
            books,
            // Nhận thông báo lỗi từ query nếu có (ví dụ khi redirect kèm lỗi)
            errorMessage: req.query.error
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy dữ liệu sách');
    }
};

// Tính năng NGỪNG PHỤC VỤ (Ẩn sách)
exports.stopServiceBook = async (req, res) => {
    try {
        const bookId = req.params.id;

        // 1. Kiểm tra xem sách có bình luận nào không
        const reviewCount = await Review.countByBookId(bookId);

        if (reviewCount > 0) {
            const books = await Book.getAllForAdmin();
            return res.render('admin/list-books', {
                layout: 'admin',
                books,
                errorMessage: 'Sách đã có bình luận, không thể ngừng phục vụ!'
            });
        }

        // 2. Nếu không có bình luận, thực hiện ẩn sách (mặc kệ đã được đọc hay chưa)
        await Book.softDelete(bookId);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi ngừng phục vụ sách');
    }
};

// Tính năng XÓA CỨNG (Xóa vĩnh viễn)
exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;

        // 1. Kiểm tra bình luận
        const reviewCount = await Review.countByBookId(bookId);

        // 2. Kiểm tra xem đã có ai đọc chưa
        const isRead = await Reading.hasAnyRead(bookId);

        // Nếu đã có bình luận HOẶC đã có người đọc -> Chặn xóa
        if (reviewCount > 0 || isRead) {
            const books = await Book.getAllForAdmin();
            return res.render('admin/list-books', {
                layout: 'admin',
                books,
                errorMessage: 'Sách đã có bình luận hoặc đã có người đọc, không thể xóa vĩnh viễn!'
            });
        }

        // Chỉ xóa khi sách mới hoàn toàn
        await Book.delete(bookId);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ khi thực hiện xóa sách');
    }
};

// --- CÁC HÀM CÒN LẠI GIỮ NGUYÊN ---

exports.readBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.user.id;
        await Reading.addToHistory(userId, bookId);
        const book = await Book.getById(bookId);
        res.redirect(`/pdf/${book.pdf_url}`);
    } catch (error) {
        res.status(500).send('Lỗi khi mở sách');
    }
};

exports.getAddBook = async (req, res) => {
    try {
        const categories = await Book.getAllCategories();
        res.render('admin/add-book', { layout: 'admin', categories });
    } catch (error) {
        res.status(500).send('Lỗi tải trang thêm sách');
    }
};

exports.postAddBook = async (req, res) => {
    try {
        const { title, author, description, category_id } = req.body;
        const cleanTitle = title ? title.trim() : '';
        const image = req.files['image'] ? req.files['image'][0].filename : '';
        const pdf_url = req.files['pdf'] ? req.files['pdf'][0].filename : '';
        await Book.create({ title: cleanTitle, author, description, image, pdf_url, category_id });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi máy chủ');
    }
};

exports.getEditBook = async (req, res) => {
    try {
        const book = await Book.getById(req.params.id);
        const rawCategories = await Book.getAllCategories();
        const categories = rawCategories.map(cat => ({
            ...cat,
            isSelected: Number(cat.id) === Number(book.category_id)
        }));
        res.render('admin/edit-book', { book, categories, layout: 'admin' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy thông tin sách');
    }
};

exports.postEditBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { author, description, category_id } = req.body;
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
        if (!book) return res.status(404).send('Không tìm thấy sách');
        const reviews = await Review.getByBookIdActive(bookId);
        let hasReviewed = false;
        let canReview = false;
        if (req.user) {
            hasReviewed = await Review.checkExistingReview(bookId, req.user.id);
            canReview = await Reading.hasRead(req.user.id, bookId);
        }
        res.render('book-detail', {
            book, reviews, hasReviewed, canReview,
            title: book.title, user: req.user
        });
    } catch (error) {
        console.error("Lỗi getBookDetail:", error);
        res.status(500).send('Lỗi máy chủ: ' + error.message);
    }
};

// Hàm phục hồi sách (Hiện lại)
exports.restoreBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        await Book.restore(bookId); // Gọi hàm restore vừa viết ở Model
        res.redirect('/admin'); // Quay lại trang quản lý
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi phục hồi sách');
    }
};