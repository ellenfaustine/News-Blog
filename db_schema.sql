
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

-- Create Articles table to store article data
CREATE TABLE IF NOT EXISTS Articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condition TEXT NOT NULL CHECK(condition IN ('draft', 'published')),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    created DATETIME NOT NULL,
    modified DATETIME NOT NULL,
    published DATETIME NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0
);

-- Create Settings table to store global settings
CREATE TABLE IF NOT EXISTS Settings (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    value VARCHAR(100) NOT NULL
);

-- Create Comments table to store comments associated with articles
CREATE TABLE IF NOT EXISTS Comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    created DATETIME NOT NULL,
    FOREIGN KEY (article_id) REFERENCES Articles(id) ON DELETE CASCADE
);

-- Create Users table to store user credentials
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE CHECK (username NOT LIKE '% %'),
    password VARCHAR(64) NOT NULL
);

-- Insert default data into Settings table
INSERT INTO Settings VALUES
('blog_name', 'Writer''s Blog'), -- Example blog name
('author', 'User'); -- Example default author name

COMMIT;

