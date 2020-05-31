const fs = require('fs');
const dbKey = fs.readFileSync('key/dbKey', 'utf-8').replace(/\n/g, '');

// module.exports = function(){
//   const mysql = require('mysql');

//   const conn = mysql.createConnection({
//     host : 'smusmutest.cew1lcmxgnch.ap-northeast-2.rds.amazonaws.com',
//     user : 'smusmu',
//     password : dbKey,
//     database : 'smusmutest',
//     dateStrings: 'date',
//     charset : 'utf8mb4'
//   })

//   conn.connect();
//   return conn;
// }


const mysql = require('mysql');

const conn = mysql.createConnection({
  host: 'smusmu.ckkukgt0dpwr.ap-northeast-2.rds.amazonaws.com',
  user: 'smusmu',
  password: dbKey,
  database: 'smusmutest',
  dateStrings: 'date',
  charset: 'utf8mb4'
})

conn.connect();
module.exports = conn;