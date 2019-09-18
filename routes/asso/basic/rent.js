var conn = require('../../../config/db');
var async = require('async');
var router = require('express').Router();


router.get('/now', (req, res) => {
  var sql = `SELECT * FROM rent WHERE assoId=?`;

  conn.query(sql, [req.user.assoId], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    } else {

      var rent = rows;

      sql = `SELECT *, date_format(DATE_ADD(rtdate, INTERVAL IF(WEEKDAY(rtdate) = 6, 1, IF(WEEKDAY(rtdate) = 5, 2, 0)) DAY),"%Y-%m-%d") as returndate
      FROM (SELECT rentStatus.id, rentStatus.rid, rentStatus.assoId, rentStatus.status, rent.name as rentname, uname, schoolId, major, phone, etc, date_format(rentdate,"%Y-%m-%d") as rentdate, rentdate as rd, 
              date_format(DATE_ADD(rentdate, INTERVAL IF(WEEKDAY(rentdate) > 3, IF(WEEKDAY(rentdate) > 4, IF(WEEKDAY(rentdate) > 5, rent.day, rent.day+1), rent.day+2), rent.day) DAY),"%Y-%m-%d") as rtdate 
            FROM rentStatus, rent WHERE rentStatus.rid=rent.id) AS rentStatus
      WHERE assoId=? AND status=0
      ORDER BY rd ASC, id DESC`

      conn.query(sql, [req.user.assoId], (err, rows) => {

        res.render('asso/rent/rentnow', {
          user: req.user,
          info: {
            title: '대여물품 현황',
            titlehref: '/asso/rent/now',
            headbar: [{
              title: '대여물품 현황',
              href: '/asso/rent/now'
            }, {
              title: '물품 등록/관리',
              href: '/asso/rent/setting'
            }, {
              title: '대여 기록',
              href: '/asso/rent/list'
            }]
          },
          rent: rent,
          srent: rows
        });
      })
    }
  })
});


router.post('/now', (req, res) => {

  var sql = `INSERT INTO rentStatus 
  (rid, assoId, uname, schoolId, major, phone, etc, rentdate)
  VALUES (?, ?, ?, ?, ?, ?, ?, now())`
  var params = [
    req.body.rid,
    req.body.assoId,
    req.body.username,
    req.body.schoolId,
    req.body.major,
    req.body.phone,
    req.body.etc
  ]

  conn.query(sql, params, (err, row) => {
    if (err) {
      throw err;
    }
    sql = `UPDATE rent SET nowcount=nowcount-1 WHERE id=?`;
    conn.query(sql, [req.body.rid, req.body.assoId], (err, row) => {
      if (err) {
        throw err;
      }
      return res.redirect('/asso/rent/now');
    })
  })
})

router.post('/now/search', (req, res) => {
  var sql = `SELECT name, schoolId, major, phone
  FROM users, major
  WHERE users.majorId=major.id AND schoolId=?`

  conn.query(sql, [req.body.schoolId], (err, rows) => {
    if (err) {
      throw err
    }
    if (rows.length > 0)
      return res.json({
        status: true,
        user: rows[0]
      });
    else
      return res.json({
        status: false
      });

  })
})

router.post('/now/return', (req, res) => {
  var sql = `UPDATE rentStatus SET status = 1, returndate = now() WHERE id = ?`

  conn.query(sql, [req.body.sid], (err, row) => {
    if (err) {
      throw err
    }
    sql = `UPDATE rent SET nowcount = nowcount+1 WHERE id = ?`
    conn.query(sql, [req.body.rid], (err, row) => {
      if (err) {
        throw err;
      }
      return res.json({
        status: true
      })
    })
  })
})



router.get('/setting',  (req, res) => {
  var sql = `SELECT * FROM rent WHERE assoId=?`

  conn.query(sql, [req.user.assoId], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      res.render('asso/rent/rentsetting', {
        user: req.user,
        info: {
          title: '물품 등록/관리',
          titlehref: '/asso/rent/setting',
          headbar: [{
            title: '대여물품 현황',
            href: '/asso/rent/now'
          }, {
            title: '물품 등록/관리',
            href: '/asso/rent/setting'
          }, {
            title: '대여 기록',
            href: '/asso/rent/list'
          }]
        },
        rent: rows
      });
    }
  })

});


router.post('/setting', (req, res) => {
  var sql = `SELECT * FROM rent WHERE id=?`;
  var rents = req.body.rent;


  async.forEachOf(rents, function (rent, i, inner_callback) {
    conn.query(sql, [rent[5]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE rent 
          SET name = ?, nowcount=?, allcount=?, day=?, assoId=?
          WHERE id = ?`;

          conn.query(sql, rent, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO rent (name, nowcount, allcount, day, assoId)
          VALUES (?, ?, ?, ?, ?)`;

          conn.query(sql, rent, (err, rows) => {
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
      return res.redirect('/asso/rent/setting');
    }
  });
})


router.post('/setting/delete', (req, res) => {
  var sql = `DELETE FROM rent WHERE id =?`

  conn.query(sql, [req.body.id], (err, row) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    return res.json({
      status: true
    });
  })
});


router.get('/list', (req, res) => {

  var page;
  if (req.query.page)
    page = req.query.page;
  else
    page = 1;
  var mode;
  if (req.query.mode)
    mode = req.query.mode;
  else
    mode = 'latest';

  var sql = `
    SELECT count(*) as totalCount from rentStatus WHERE status=1
    `
  conn.query(sql, (err, results) => {
    var totalCount = results[0].totalCount;
    if (totalCount == 0)
      totalCount = 1;

    var listCount = 10;
    var pageCount = 5;
    var totalPage = parseInt(totalCount / listCount);

    if (totalCount % listCount > 0)
      totalPage++;

    if (totalPage < page)
      page = totalPage;

    var startPage = parseInt((parseInt((page - 1) / pageCount)) * pageCount) + 1;
    var endPage = startPage + pageCount - 1;
    if (endPage > totalPage) {
      endPage = totalPage;
    }


    sql = `SELECT rentStatus.id, rentStatus.rid, rent.name as rentname, uname, schoolId, major, phone, etc, date_format(rentdate,"%Y-%m-%d") as rentdate,  date_format(returndate,"%Y-%m-%d") as returndate1
    FROM rentStatus
    LEFT JOIN rent ON rentStatus.rid=rent.id
    WHERE rentStatus.assoId=? AND rentStatus.status=1
    ORDER BY returndate DESC, rentStatus.id DESC
    LIMIT 10 OFFSET ?`

    conn.query(sql, [req.user.assoId, (page - 1) * listCount], (err, rows) => {


      res.render('asso/rent/rentlist', {
        user: req.user,
        info: {
          title: '대여 기록',
          titlehref: '/asso/rent/list',
          headbar: [{
            title: '대여물품 현황',
            href: '/asso/rent/now'
          }, {
            title: '물품 등록/관리',
            href: '/asso/rent/setting'
          }, {
            title: '대여 기록',
            href: '/asso/rent/list'
          }]
        },
        srent: rows,
        page: page,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage
      });
    });
  });
});



module.exports = router;