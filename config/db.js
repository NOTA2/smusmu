const fs = require('fs');
const dbKey = fs.readFileSync('key/dbKey', 'utf-8').replace(/\n/g, '');
const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'smusmu-dev.c5smsp2kymwd.ap-northeast-2.rds.amazonaws.com',
  user: 'smusmu',
  password: dbKey,
  database: 'smusmutest',
  dateStrings: 'date',
  charset: 'utf8mb4'
})

conn.connect();
module.exports = conn;