const fs = require('fs');

const dbKey = fs.readFileSync('key/dbKey', 'utf-8');

module.exports = function(){
  var mysql = require('mysql');
  var conn = mysql.createConnection({
    host : 'smusmutest.cew1lcmxgnch.ap-northeast-2.rds.amazonaws.com',
    user : 'smusmu',
    password : dbKey,
    database : 'smusmu',
    dateStrings: 'date'
  })

  conn.connect();

  return conn;
}
