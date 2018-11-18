const fs = require('fs');


const dbKey = fs.readFileSync('key/dbKey', 'utf-8');

module.exports = function(){
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host : 'smusmutest.cky1tln47zkv.ap-northeast-2.rds.amazonaws.com',
    user : 'smusmu',
    password : dbKey,
    database : 'smusmu'
  })
  conn.connect();

  return conn;
}
