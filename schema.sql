-- Run this manually OR let the app auto-create it on startup (see src/db/initDb.js)

CREATE DATABASE IF NOT EXISTS github_analyzer;

USE github_analyzer;

CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(500),
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    public_gists INT DEFAULT 0,
    company VARCHAR(255),
    location VARCHAR(255),
    blog VARCHAR(500),
    twitter_username VARCHAR(255),
    account_created_at DATETIME,
    most_used_language VARCHAR(100),
    total_stars_earned INT DEFAULT 0,
    top_repo_name VARCHAR(255),
    top_repo_stars INT DEFAULT 0,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
