const User = require('../models/user.model');

const userController = {
    // Hiển thị danh sách user cho admin
    index: async (req, res) => {
        try {
            const users = await User.getAll();
            const customUsers = users.map(u => ({
                ...u,
                isAdmin: u.role === 'admin' // Tạo một biến boolean mới
            }));
            res.render('admin/list-users', { users: customUsers });
        } catch (error) {
            res.status(500).send('Lỗi');
        }
    },

    // Xóa mềm user
    softDelete: async (req, res) => {
        try {
            const { id } = req.params;
            await User.softDelete(id);
            res.redirect('/admin/users');
        } catch (error) {
            res.status(500).send('Lỗi khi xóa người dùng');
        }
    },

    // Đảm bảo CÓ hàm này
    restore: async (req, res) => {
        try {
            const { id } = req.params;
            await User.restore(id);
            res.redirect('/admin/users');
        } catch (error) {
            res.status(500).send('Lỗi khôi phục');
        }
    }
};

module.exports = userController;