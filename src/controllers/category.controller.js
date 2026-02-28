const Category = require('../models/category.model');

exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.render('admin/list-categories', {
            layout: 'admin',
            categories,
            errorMessage: req.query.error // Nhận lỗi từ redirect nếu có
        });
    } catch (error) {
        res.status(500).send('Lỗi hệ thống');
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (name && name.trim()) {
            await Category.create(name.trim());
        }
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send('Lỗi khi thêm danh mục');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const bookCount = await Category.countBooks(id);

        if (bookCount > 0) {
            // Nếu có sách, quay lại trang danh sách kèm thông báo lỗi
            return res.render('admin/list-categories', {
                layout: 'admin',
                categories: await Category.getAll(),
                errorMessage: 'Không thể xóa danh mục đang có sách!'
            });
        }

        await Category.delete(id);
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send('Lỗi khi xóa danh mục');
    }
};