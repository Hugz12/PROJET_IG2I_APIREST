import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'IG2I',
    password: process.env.MYSQL_PASSWORD || 'motdepasse',
    database: process.env.MYSQL_DATABASE || 'money',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export function getConnection() {
    try {
        return pool.getConnection();
    }
    catch (error) {
        console.error('Error getting MySQL connection:', error);
        throw error;
    }
}

export default pool;