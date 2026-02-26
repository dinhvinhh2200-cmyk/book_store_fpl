const jwt = require('jsonwebtoken');

const authMiddleware = {
    // Middleware xác thực token cơ bản (dùng cho toàn cục)
    verifyToken: (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            res.locals.user = null;
            return next();
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            req.user = decoded;
            res.locals.user = decoded; // Dùng để hiển thị tên user trên Header
            next();
        } catch (err) {
            res.clearCookie('token');
            res.locals.user = null;
            next();
        }
    },

    // Middleware kiểm tra quyền Admin (dùng riêng cho route admin)
    isAdmin: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).send("Bạn không có quyền truy cập!");
        }
    }
};

module.exports = authMiddleware;