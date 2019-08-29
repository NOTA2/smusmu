const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();

router.get('', (req, res) => {
  let sql = `SELECT * FROM academicCalendar ORDER BY month, date`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    res.render('asso/kakao/calendar', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/kakao/calendar',
        headbar: []
      },
      calendar : rows
    });
  })
});

router.post('', (req, res) => {
  let calendars = req.body.calendar;
  
  let sql = `SELECT * FROM academicCalendar WHERE id = ?`;

  async.forEachOf(calendars, function (calendar, i, inner_callback) {
    conn.query(sql, [calendar[4]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE academicCalendar 
          SET month = ?, date=?, content=?, homonym=?
          WHERE id = ?`;

          conn.query(sql, calendar, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO academicCalendar (month, date, content, homonym)
          VALUES (?, ?, ?, ?)`;

          conn.query(sql, calendar, (err, rows) => {
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
      res.redirect('/asso/kakao/calendar')
    }
  });
})


module.exports = router;