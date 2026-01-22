-- SQL Schema for English Colony UOS
-- Run this on your MySQL database: u191858297_english_colony

-- Users table with IP and device tracking
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  profile_image TEXT,
  batch_number INT,
  batch_type ENUM('R', 'W'),
  contact VARCHAR(20),
  blood_group VARCHAR(10),
  address TEXT,
  social_links JSON,
  ip_address VARCHAR(45),
  device_info TEXT,
  user_agent TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- IP tracking table to prevent multiple accounts
CREATE TABLE IF NOT EXISTS ip_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  user_id INT NOT NULL,
  device_fingerprint VARCHAR(255),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip (ip_address),
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default videos
INSERT INTO videos (id, title, description, file_path) VALUES 
(1, '16th Batch Promo', 'Amazing promo video from 16th batch students showcasing their creativity and English skills. This video represents the spirit of English Colony - a place where students come together to learn, grow, and have fun while improving their language skills.', '16th promo.mp4'),
(2, 'Creative Vision', 'A unique perspective on what English Colony means to us. This video captures the essence of our community - the friendships, the learning moments, and the memories we create together.', 'IMG_0399.MOV'),
(3, 'Our Journey', 'Capturing the spirit of learning and growth at English Colony. Follow along as we showcase the incredible journey of our members - from shy beginners to confident English speakers.', 'IMG_3237.MP4')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Votes table with IP tracking
CREATE TABLE IF NOT EXISTS votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  video_id INT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_vote (user_id, video_id),
  INDEX idx_video (video_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  video_id INT NOT NULL,
  content TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_video (video_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

-- Sessions table for tracking login activity
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
