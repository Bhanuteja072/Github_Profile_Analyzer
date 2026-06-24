const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Ensures the database and table exist before the app starts.
 * This lets a reviewer just clone the repo, set .env, and run `npm start`
 * without manually executing schema.sql first.
 */
async function initDb() {
  // Step 1: connect WITHOUT specifying a database, so we can create it if missing
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  );
  await connection.end();

  // Step 2: connect to that database and create the table if missing
  const dbConnection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await dbConnection.query(`
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
    )
  `);

  await dbConnection.end();
  console.log('✅ Database and table verified/created successfully.');
}

module.exports = initDb;
