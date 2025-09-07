-- Database schema for OAV Bibina Knowledge Hub
-- Execute with: wrangler d1 execute oav-knowledge-hub-db --file=database/schema.sql

-- Table for Classes
CREATE TABLE Classes
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table for Subjects
CREATE TABLE Subjects
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    class_id   INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes (id) ON DELETE CASCADE
);

-- Table for File Types
CREATE TABLE FileTypes
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Table for Notes (Files)
CREATE TABLE Notes
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name  TEXT    NOT NULL,
    r2_object_key TEXT    NOT NULL UNIQUE,
    class_id      INTEGER NOT NULL,
    subject_id    INTEGER NOT NULL,
    file_type_id  INTEGER NOT NULL,
    uploaded_at   TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes (id),
    FOREIGN KEY (subject_id) REFERENCES Subjects (id),
    FOREIGN KEY (file_type_id) REFERENCES FileTypes (id)
);

-- Table for Admin User
CREATE TABLE Admin
(
    id            INTEGER PRIMARY KEY,
    username      TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- Insert default file types
INSERT INTO FileTypes (name)
VALUES ('Chapter Notes'),
       ('Presentations'),
       ('Question Papers'),
       ('Assignments'),
       ('Reference Materials'),
       ('Practice Worksheets');

-- Note: Create admin user separately with proper password hash
-- Example: INSERT INTO Admin (id, username, password_hash) VALUES (1, 'admin', 'BCRYPT_HASH_HERE');
