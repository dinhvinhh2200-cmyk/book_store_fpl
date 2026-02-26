const Review = require('../models/review.model');
const { filterContent } = require('../utils/filter');

exports.addReview = async (req, res) => {
    try {
        const { book_id, rating, comment } = req.body;
        const user_id = req.user.id;

       // Chấp nhận nếu có ít nhất một trong hai: rating HOẶC comment
        if (!rating && (!comment || comment.trim() === "")) {
            return res.status(400).send('Vui lòng để lại số sao hoặc lời nhắn đánh giá.');
        }

        // 2. Kiểm tra xem đã đánh giá chưa
        const isExists = await Review.checkExistingReview(book_id, user_id);
        if (isExists) {
            return res.status(400).send('Bạn đã đánh giá sản phẩm này rồi.');
        }

        // 3. Xử lý nội dung bình luận (nếu người dùng xóa hết sao và để trống)
        const commentText = comment ? String(comment).trim() : "";
        
        // Nhập vào DB
        await Review.create({
            book_id: book_id,
            user_id: user_id,
            rating: rating || 0, 
            comment: filterContent(commentText) // Lọc từ ngữ
        });

        // 4. QUAN TRỌNG: Redirect về đúng link /books/id
        res.redirect(`/book/${book_id}`); 

    } catch (error) {
        console.error("Lỗi addReview:", error);
        res.status(500).send('Lỗi hệ thống khi lưu bình luận');
    }
};

exports.getAdminReviews = async (req, res) => {
    try {
        const reviews = await Review.getAllForAdmin();
        res.render('admin/list-reviews', { 
            layout: 'admin', 
            reviews,
            title: 'Quản lý bình luận'
        });
    } catch (error) {
        console.error("Lỗi getAdminReviews:", error);
        res.status(500).send('Lỗi lấy danh sách bình luận');
    }
};

exports.postToggleReview = async (req, res) => {
    try {
        const { id, status } = req.body;
        // Chuyển đổi status sang số (0 hoặc 1) để lưu vào database
        await Review.toggleVisibility(id, parseInt(status));
        res.redirect('/admin/reviews');
    } catch (error) {
        console.error("Lỗi toggleReview:", error);
        res.status(500).send('Lỗi cập nhật trạng thái hiển thị');
    }
};