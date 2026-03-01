CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- 1. Tạo bảng danh mục (Phải có trước để bảng books tham chiếu tới)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tạo bảng sách (Thêm trực tiếp cột category_id vào lệnh CREATE)
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    pdf_url VARCHAR(255), 
    is_deleted TINYINT(1) DEFAULT 0,
    category_id INT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng người dùng
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR (255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_deleted TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tạo bảng đánh giá
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_hidden TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_book_review (book_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reading_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id),
    UNIQUE KEY unique_user_book_read (user_id, book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Chèn dữ liệu danh mục trước
INSERT INTO categories (name) VALUES ('Văn học'), ('Kinh tế'), ('Kỹ năng sống'), ('Công nghệ');

-- 6. Chèn dữ liệu sách (Gán category_id mẫu là 1 - Văn học)
INSERT INTO books (title, author, description, image_url, is_deleted, category_id) VALUES 
('5 Múi Giờ, 10 Tiếng Bay', 'Nhật Ký Yêu Xa', 'Câu chuyện về tình yêu xa đầy cảm xúc.', 'book1.jpg', 0, 1),
('Gói Nỗi Buồn Lại Và Ném Đi', 'An Nhiên', 'Cuốn sách giúp bạn vượt qua những ngày khó khăn.', 'book2.jpg', 0, 1),
('Hẹn Nhau Ở Một Cuộc Đời Khác', 'Gari', 'Những tản văn nhẹ nhàng về cuộc sống.', 'book3.jpg', 0, 1),
('Chạng Vạng', 'Tsuko', 'Ma cà rồng trong bóng tối.', 'book4.jpg', 0, 1),
('Từng ngày yêu em', 'Harina-can', 'Chờ em nơi bãi biển mãi chờ em .', 'book5.jpg', 0, 1),
('Nơi tôi chờ em', 'Han-so-yo', 'Tôi đã chờ em rất lâu ở biển .', 'book6.jpg', 0, 1);