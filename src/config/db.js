const mysql = require('mysql2/promise');
require('dotenv').config();
 
// Hosted MySQL providers (Aiven, PlanetScale, etc.) usually require SSL.
// Set DB_SSL=true in .env when connecting to one of those; leave unset for local MySQL.
const useSSL = process.env.DB_SSL === 'true';
 
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(useSSL && { ssl: { rejectUnauthorized: false } })
});
 
module.exports = pool;