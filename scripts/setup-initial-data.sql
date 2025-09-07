-- Insert default file types
INSERT
OR IGNORE INTO FileTypes (name) VALUES
  ('PDF Document'),
  ('Word Document'),
  ('PowerPoint Presentation'),
  ('Excel Spreadsheet'),
  ('Text File'),
  ('Image (JPG/PNG)'),
  ('Video'),
  ('Audio');

-- Insert some example classes
INSERT
OR IGNORE INTO Classes (name) VALUES
  ('Class 10'),
  ('Class 11'),
  ('Class 12');

-- Insert some example subjects for Class 10
INSERT
OR IGNORE INTO Subjects (name, class_id) VALUES
  ('Mathematics', 1),
  ('Science', 1),
  ('English', 1),
  ('History', 1),
  ('Geography', 1);

-- Insert some example subjects for Class 11
INSERT
OR IGNORE INTO Subjects (name, class_id) VALUES
  ('Mathematics', 2),
  ('Physics', 2),
  ('Chemistry', 2),
  ('Biology', 2),
  ('English', 2);

-- Insert some example subjects for Class 12
INSERT
OR IGNORE INTO Subjects (name, class_id) VALUES
  ('Mathematics', 3),
  ('Physics', 3),
  ('Chemistry', 3),
  ('Biology', 3),
  ('English', 3);
