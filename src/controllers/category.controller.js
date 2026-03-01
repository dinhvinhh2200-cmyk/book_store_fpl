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
    const { name } = req.body;
    try {
        const isExisted = await Category.checkExists(name);
        if (isExisted) {
            // Lấy lại danh sách để render lại trang kèm lỗi
            const categories = await Category.getAll();
            return res.render('admin/list-categories', {
                layout: 'admin',
                categories,
                errorMessage: 'Tên danh mục này đã tồn tại!'
            });
        }
        await Category.create(name);
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send('Lỗi hệ thống');
    }
};

// Hiển thị form sửa
exports.editCategory = async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        if (!category) {
            return res.redirect('/admin/categories');
        }
        res.render('admin/edit-category', {
            layout: 'admin',
            category
        });
    } catch (error) {
        res.status(500).send('Lỗi server');
    }
};

exports.updateCategory = async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    try {
        const isExisted = await Category.checkExists(name, id);
        if (isExisted) {
            return res.render('admin/edit-category', {
                layout: 'admin',
                errorMessage: 'Tên danh mục mới đã bị trùng!',
                category: { id, name }
            });
        }
        await Category.update(id, name);
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send('Lỗi hệ thống');
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