-- OAV Bibina Knowledge Hub Database Schema
-- Run with: wrangler d1 execute oav-knowledge-hub-db --file=./schema.sql

-- Table for Classes
CREATE TABLE IF NOT EXISTS Classes
(
    id
    INTEGER
    PRIMARY
    KEY
    AUTOINCREMENT,
    name
    TEXT
    NOT
    NULL
    UNIQUE,
    slug
    TEXT
    NOT
    NULL
    UNIQUE,
    created_at
    TEXT
    DEFAULT
    CURRENT_TIMESTAMP
);

-- Table for Subjects
CREATE TABLE IF NOT EXISTS Subjects
(
    id
    INTEGER
    PRIMARY
    KEY
    AUTOINCREMENT,
    name
    TEXT
    NOT
    NULL,
    slug
    TEXT
    NOT
    NULL,
    class_id
    INTEGER
    NOT
    NULL,
    created_at
    TEXT
    DEFAULT
    CURRENT_TIMESTAMP,
    FOREIGN
    KEY
(
    class_id
) REFERENCES Classes
(
    id
) ON DELETE CASCADE,
    UNIQUE
(
    name,
    class_id
),
    UNIQUE
(
    slug,
    class_id
)
    );

-- Table for File Types
CREATE TABLE IF NOT EXISTS FileTypes
(
    id
    INTEGER
    PRIMARY
    KEY
    AUTOINCREMENT,
    name
    TEXT
    NOT
    NULL
    UNIQUE,
    created_at
    TEXT
    DEFAULT
    CURRENT_TIMESTAMP
);

-- Table for Notes (Files)
CREATE TABLE IF NOT EXISTS Notes
(
    id
    INTEGER
    PRIMARY
    KEY
    AUTOINCREMENT,
    display_name
    TEXT
    NOT
    NULL,
    r2_object_key
    TEXT
    NOT
    NULL
    UNIQUE,
    class_id
    INTEGER
    NOT
    NULL,
    subject_id
    INTEGER
    NOT
    NULL,
    file_type_id
    INTEGER
    NOT
    NULL,
    file_size
    INTEGER,
    uploaded_at
    TEXT
    DEFAULT
    CURRENT_TIMESTAMP,
    FOREIGN
    KEY
(
    class_id
) REFERENCES Classes
(
    id
),
    FOREIGN KEY
(
    subject_id
) REFERENCES Subjects
(
    id
),
    FOREIGN KEY
(
    file_type_id
) REFERENCES FileTypes
(
    id
)
    );

-- Table for Admin User
CREATE TABLE IF NOT EXISTS Admin
(
    id
    INTEGER
    PRIMARY
    KEY,
    username
    TEXT
    NOT
    NULL
    UNIQUE,
    password_hash
    TEXT
    NOT
    NULL
);

-- Insert default file types
INSERT
OR IGNORE INTO FileTypes (name) VALUES
    ('PDF'),
    ('Word Document'),
    ('PowerPoint'),
    ('Excel Spreadsheet'),
    ('Text File'),
    ('Image'),
    ('Other');

-- Insert default admin user (password: admin123)
-- Note: Change this password immediately after first login
INSERT
OR IGNORE INTO Admin (username, password_hash) VALUES
    ('admin', '$2a$10$rGKqCJGgQxvjGx8yNqJ7S.UPZz0Vx0JZQBJmQk9QqE4tCjKqY8yfy');

-- Example data (optional - remove in production)
INSERT
OR IGNORE INTO Classes (name, slug) VALUES
    ('Class 10', 'class-10'),
    ('Class 12', 'class-12');

INSERT
OR IGNORE INTO Subjects (name, slug, class_id) VALUES
    ('Mathematics', 'mathematics', 1),
    ('Physics', 'physics', 1),
    ('Chemistry', 'chemistry', 1),
    ('Mathematics', 'mathematics', 2),
    ('Physics', 'physics', 2),
    ('Chemistry', 'chemistry', 2);
