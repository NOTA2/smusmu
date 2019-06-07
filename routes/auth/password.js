const conn = require('../../config/db')();
var hasher = require('pbkdf2-password')();
const router = require('express').Router();

router.get('/', (req, res) => {
  var type = 'asso'
  if (req.user.kakaoId)
    type = 'commu'

  var sql = `SELECT * FROM board`
  conn.query(sql, (err, rows) => {
    if (err)
      throw err;

    res.render(`auth/find/password`, {
      user: req.user,
      type: type,
      info: {
        title: '비밀번호 변경',
        titlehref: `/password`,
        headbar: []
      },
      menu: rows
    })
  })

}).post('/', (req, res) => {
  hasher({
    password: req.body.password
  }, (err, pass, salt, hash) => {

    var sql = 'UPDATE users SET password=?, salt=? WHERE username=?';
    if (req.body.type == 'asso')
      sql = 'UPDATE assoUser SET password=?, salt=? WHERE username=?';
    conn.query(sql, [hash, salt, req.user.username], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        res.redirect(`/auth/password`)
      }
    });
  });
})

router.post('/now', (req, res) => {

  var sql = 'SELECT * FROM users WHERE username=?';

  if (req.body.type == 'asso')
    sql = 'SELECT * FROM assoUser WHERE username=?';

  conn.query(sql, [req.user.username], (err, results) => {
    var user = results[0];

    hasher({
      password: req.body.password,
      salt: user.salt
    }, (err, pass, salt, hash) => {

      if (hash === user.password)
        res.json({
          status: true
        });
      else
        res.json({
          status: false
        });
    });
  });
})

module.exports = router