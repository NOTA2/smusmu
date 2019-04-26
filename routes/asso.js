var conn = require('../config/db')();
var async = require('async');
var route = require('express').Router();
var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/logo') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
      console.log(req.user.name + '.' + file.mimetype.split('/')[1]);
      
    cb(null, req.user.name + '.' + file.mimetype.split('/')[1]) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
var upload = multer({
  storage: storage
})

route.get('/', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {

  res.render('asso/index', {
    user: req.user,
    info: {
      title: '관리페이지 홈',
      titlehref: '/asso',
      headbar: []
    }
  });
});

route.get('/myinfo', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {
  req.user.phone = req.user.phone.split('-');
  res.render('asso/myinfo', {
    user: req.user,
    info: {
      title: '정보 수정',
      titlehref: '/asso/myinfo',
      headbar: [] 
    }
  });
});

route.post('/myinfo', upload.single('logo'), (req, res) => {
  var logo
  
  if(req.file)
    logo = req.file.path.replace('public/', '');
  else if(req.body.logopath)
    logo = req.body.logopath;
  else
    logo =null;

  var userparam = [
    req.body.email,
    req.user.id
  ]
  var assoparam = [
    req.body.name,
    req.body.location,
    req.body.description,
    req.body.assoemail,
    req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3,
    logo,
    req.user.assoId
  ]

  if (req.user.grade == 1 || req.user.grade == 2) {
    var sql = 'UPDATE assoUser SET email=? WHERE id=?'
    conn.query(sql, userparam, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        sql = 'UPDATE asso SET name=?, location=?, description=?, assoemail=?, phone=?, logo=? WHERE id=?'
        conn.query(sql, assoparam, (err, results) => {
          if (err) {
            console.log(err);
            res.status(500).end();
          }
          req.user.name = req.body.name
          req.user.location = req.body.location
          req.user.description = req.body.description
          req.user.assoemail = req.body.assoemail
          req.user.email = req.body.email
          req.user.logo = logo;
          req.user.phone = [req.body.phone1, req.body.phone2, req.body.phone3]
          
          return res.render('asso/myinfo', {
            user: req.user,
            info: {
              title: '정보 수정',
              titlehref: '/asso/myinfo',
              headbar: []
            }
          });
        })
      }
    })
  } else {
    var sql = 'UPDATE assoUser SET email=? WHERE id=?';
    conn.query(sql, userparam, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        req.user.email = req.body.email;
        req.user.phone = req.user.phone.split('-');

        res.render('asso/myinfo', {
          user: req.user,
          info: {
            title: '정보 수정',
            titlehref: '/asso/myinfo',
            headbar: []
          }
        });
      }
    })
  }
})

route.get('/rent/now', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {


  var sql = `SELECT * FROM rent WHERE assoId=?`;

  conn.query(sql, [req.user.assoId], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    } else {

      var rent = rows;

      sql = `SELECT *, date_format(DATE_ADD(rtdate, INTERVAL IF(WEEKDAY(rtdate) = 6, 1, IF(WEEKDAY(rtdate) = 5, 2, 0)) DAY),"%Y-%m-%d") as returndate
      FROM (SELECT rentStatus.id, rentStatus.rid, rentStatus.assoId, rentStatus.status, rent.name as rentname, uname, schoolId, department, phone, etc, date_format(rentdate,"%Y-%m-%d") as rentdate, rentdate as rd, 
      date_format(DATE_ADD(rentdate, INTERVAL IF(WEEKDAY(rentdate) > 3, IF(WEEKDAY(rentdate) > 4, IF(WEEKDAY(rentdate) > 5, rent.day, rent.day+1), rent.day+2), rent.day) DAY),"%Y-%m-%d") as rtdate 
        FROM rentStatus, rent WHERE rentStatus.rid=rent.id) AS rentStatus
      WHERE assoId=? AND status=0
      ORDER BY rd ASC, id DESC`

      
      conn.query(sql, [req.user.assoId], (err, rows) => {
        res.render('asso/rentnow', {
          user: req.user,
          info: {
            title: '대여물품 현황',
            titlehref: '/asso/rent/now',
            headbar: [{
              title: '대여물품 현황',
              href: '/asso/rent/now'
            }, {
              title: '물품 등록/관리',
              href: '/commu/rent/setting'
            }, {
              title: '대여 기록',
              href: '/commu/rent/list'
            }]
          },
          rent: rent,
          srent: rows
        });
      })
    }
  })
});


route.post('/rent/now', (req, res) => {
  var sql = `INSERT INTO rentStatus 
  (rid, assoId, uname, schoolId, department, phone, etc, rentdate)
  VALUES (?, ?, ?, ?, ?, ?, ?, now())`
  var params = [
    req.body.rid,
    req.body.assoId,
    req.body.username,
    req.body.schoolId,
    req.body.department,
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

route.post('/rent/now/search', (req, res) => {
  var sql = `SELECT name, schoolId, department, phone
  FROM users
  WHERE schoolId=?`

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

route.post('/rent/now/return', (req, res) => {
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



route.get('/rent/setting', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {


  var sql = `SELECT * FROM rent WHERE assoId=?`

  conn.query(sql, [req.user.assoId], (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      res.render('asso/rentsetting', {
        user: req.user,
        info: {
          title: '물품 등록/관리',
          titlehref: '/asso/rent/setting',
          headbar: [{
            title: '대여물품 현황',
            href: '/asso/rent/now'
          }, {
            title: '물품 등록/관리',
            href: '/commu/rent/setting'
          }, {
            title: '대여 기록',
            href: '/commu/rent/list'
          }]
        },
        rent: rows
      });
    }
  })

});


route.post('/rent/setting', (req, res) => {
  var sql = `SELECT * FROM rent WHERE code = ? AND assoId=?`;
  var params = new Array();

  console.log();
  

  if (req.body.code.length > 1) {
    req.body.code.forEach(function (el, idx) {
      params[idx] = new Array();
      params[idx].push(req.body.name[idx])
      params[idx].push(req.body.allcount[idx])
      params[idx].push(req.body.nowcount[idx])
      params[idx].push(req.body.day[idx])
      params[idx].push(el)
      params[idx].push(req.body.assoId)
    })
  } else {
    params[0] = new Array();
    params[0].push(req.body.name)
    params[0].push(req.body.allcount)
    params[0].push(req.body.nowcount)
    params[0].push(req.body.day)
    params[0].push(req.body.code)
    params[0].push(req.body.assoId)
  }


  async.forEachOf(req.body.code, function (code, i, inner_callback) {
    conn.query(sql, [code, req.body.assoId], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE rent 
          SET name = ?, allcount=?, nowcount=?, day=?
          WHERE code = ? AND assoId = ?`;

          conn.query(sql, params[i], (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO rent (name, allcount, nowcount, day, code, assoId)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, params[i], (err, rows) => {
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


route.post('/rent/setting/delete', (req, res) => {
  var sql = `DELETE FROM rent WHERE assoId =? AND code = ?`

  conn.query(sql, [req.body.assoId, req.body.code], (err, row) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    return res.json({
      status: true
    });
  })
});


route.get('/rent/list', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {

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


    sql = `SELECT rentStatus.id, rentStatus.rid, rent.name as rentname, uname, schoolId, department, phone, etc, date_format(rentdate,"%Y-%m-%d") as rentdate,  date_format(returndate,"%Y-%m-%d") as returndate1
    FROM rentStatus
    LEFT JOIN rent ON rentStatus.rid=rent.id
    WHERE rentStatus.assoId=? AND rentStatus.status=1
    ORDER BY returndate DESC, rentStatus.id DESC
    LIMIT 10 OFFSET ?`

    conn.query(sql, [req.user.assoId,(page - 1) * listCount], (err, rows) => {


      res.render('asso/rentlist', {
        user: req.user,
        info: {
          title: '대여 기록',
          titlehref: '/asso/rent/list',
          headbar: [{
            title: '대여물품 현황',
            href: '/asso/rent/now'
          }, {
            title: '물품 등록/관리',
            href: '/commu/rent/setting'
          }, {
            title: '대여 기록',
            href: '/commu/rent/list'
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




route.get('/member', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {
  var sql = `SELECT id, username, token, email, grade FROM assoUser WHERE assoId=?`
  conn.query(sql,[req.user.assoId],(err,rows)=>{
    if(err)
      throw err;

    return res.render('asso/member', {
      user: req.user,
      info: {
        title: '부원 계정관리',
        titlehref: '/asso/member',
        headbar: []
      },
      assouser : rows
    });
  })

})

route.post('/member/passdel', (req, res) =>{
  var sql;
  if(req.body.del)
    sql = `DELETE FROM assoUser WHERE id=?`
  else if(req.body.pass)
    sql = `UPDATE assoUser SET token='true' WHERE id=?`

  conn.query(sql, [req.body.id], (err,row)=>{
    if(err)
      throw err;
    else
      return res.json({
        status : true
      })
  })
})




module.exports = route;