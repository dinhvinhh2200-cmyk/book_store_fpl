require('dotenv').config(); // Nạp biến từ .env [cite: 147]
const cookieParser = require('cookie-parser')
const db = require('./config/db'); // Kết nối tới file cấu hình DB [cite: 218, 245]
const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { engine } = require('express-handlebars'); // cài đặt handlebars 
const bookRoutes = require('./routes/book.route');
const authRouter = require('./routes/auth.route')
const authMiddleware = require('./middlewares/auth.middleware')
const userRoutes = require('./routes/user.route');
const categoryRoutes = require('./routes/category.route');

let multer = require('multer')
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Kiểm tra loại file để quyết định thư mục lưu trữ
        if (file.mimetype === 'application/pdf') {
            cb(null, path.join(__dirname, 'public/pdf')); // Lưu vào public/pdf
        } else {
            cb(null, path.join(__dirname, 'public/img')); // Lưu vào public/img
        }
    },
    filename: function (req, file, cb) {
        // Đặt tên file bằng timestamp để tránh trùng lặp
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 2. Khởi tạo middleware upload
let upload = multer({ storage: storage });

const port = 3000;

app.use(cookieParser())
app.use(authMiddleware.verifyToken);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 1. Cấu hình Handlebars làm View Engine
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'resources/views/layouts'),
    partialsDir: path.join(__dirname, 'resources/views/partials')
}));

app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'resources/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', bookRoutes);
app.use('/auth', authRouter)
app.use('/', userRoutes); 
app.use('/admin/categories', categoryRoutes);



app.listen(port, () => {
    console.log(`Ứng dụng đang chạy tại http://localhost:${port}`);
});


// fix lại chỗ chỉ phải đọc rồi mới được đánh giá 
// fix lại chỗ require html 

