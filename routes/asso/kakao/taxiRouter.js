const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();


router.get('', (req, res) => {
  let sql = `SELECT * FROM taxi ORDER BY count`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    res.render('asso/kakao/taxi', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/kakao/taxi',
        headbar: []
      },
      taxi : rows
    });
  })
});

router.post('', (req, res) => {
  let taxis = req.body.taxi;
  let sql = `SELECT * FROM taxi WHERE id = ?`;

  async.forEachOf(taxis, function (taxi, i, inner_callback) {
    conn.query(sql, [taxi[3]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE taxi 
          SET location = ?, url=?, password=?
          WHERE id = ?`;

          conn.query(sql, taxi, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO taxi (location, url, password)
          VALUES (?, ?, ?)`;

          conn.query(sql, taxi, (err, rows) => {
            if (err) {
              inner_callback(err);
            }
            inner_callback(null);
          });
        }
      }
    });
  }, function (err) {
    if (err) {
      throw err
    } else {
      res.redirect('/asso/kakao/taxi')
    }
  });
})

module.exports = router;