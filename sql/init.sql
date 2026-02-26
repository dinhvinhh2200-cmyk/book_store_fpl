CREATE DATABASE IF NOT EXISTS book_store;
USE book_store;

-- 1. Tạo bảng với đầy đủ các cột ngay từ đầu
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    image_url VARCHAR(255),
    pdf_url VARCHAR(255), 
    is_deleted TINYINT(1) DEFAULT 0 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR (255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) DEFAULT 0;

CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
ALTER TABLE reviews ADD UNIQUE KEY unique_user_book_review (book_id, user_id);
ALTER TABLE reviews ADD COLUMN is_hidden TINYINT(1) DEFAULT 0;
ALTER TABLE books ADD COLUMN pdf_url VARCHAR(255);

-- 2. Chèn dữ liệu mẫu
INSERT INTO books (title, author, description, image_url, is_deleted) VALUES 
('5 Múi Giờ, 10 Tiếng Bay', 'Nhật Ký Yêu Xa', 'Câu chuyện về tình yêu xa đầy cảm xúc.', 'book1.jpg', 0),
('Gói Nỗi Buồn Lại Và Ném Đi', 'An Nhiên', 'Cuốn sách giúp bạn vượt qua những ngày khó khăn.', 'book2.jpg', 0),
('Hẹn Nhau Ở Một Cuộc Đời Khác', 'Gari', 'Những tản văn nhẹ nhàng về cuộc sống.', 'book3.jpg', 0),
('Chạng Vạng', 'Tsuko', 'Ma cà rồng trong bóng tối.', 'book4.jpg', 0),
('Từng ngày yêu em', 'Harina-can', 'Chờ em nơi bãi biển mãi chờ em .', 'book5.jpg', 0),
('Nơi tôi chờ em', 'Han-so-yo', 'Tôi đã chờ em rất lâu ở biển .', 'book6.jpg', 0);