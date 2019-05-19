var conn = require('../../config/db')();
var router = require('express').Router();
var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/logo') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    console.log(req.user.assoname + '.' + file.mimetype.split('/')[1]);

    cb(null, req.user.assoname + '.' + file.mimetype.split('/')[1]) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
var upload = multer({
  storage: storage
})


router.get('/myinfo', (req, res, next) => {
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
  req.user.assophone = req.user.assophone.split('-');
  res.render('asso/myinfo', {
    user: req.user,
    info: {
      title: '정보 수정',
      titlehref: '/asso/home/myinfo',
      headbar: []
    }
  });
});

router.post('/myinfo', upload.single('logo'), (req, res) => {
  var logo

  if (req.file)
    logo = req.file.path.replace('public/', '');
  else if (req.body.logopath)
    logo = req.body.logopath;
  else
    logo = null;


  var assoparam = [
    req.body.assoname,
    req.body.location,
    req.body.description,
    req.body.assoemail,
    req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3,
    logo,
    req.user.assoId
  ]

  sql = 'UPDATE asso SET assoname=?, location=?, description=?, assoemail=?, assophone=?, logo=? WHERE id=?'
  conn.query(sql, assoparam, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    }
    req.user.assoname = req.body.assoname
    req.user.location = req.body.location
    req.user.description = req.body.description
    req.user.assoemail = req.body.assoemail
    req.user.email = req.body.email
    req.user.logo = logo;
    req.user.assophone = [req.body.phone1, req.body.phone2, req.body.phone3]

    return res.render('asso/myinfo', {
      user: req.user,
      info: {
        title: '정보 수정',
        titlehref: '/asso/home/myinfo',
        headbar: []
      }
    });
  })

})

router.get('/member', (req, res, next) => {
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

  var sql = `
  SELECT users.id, username, name, major, grade
  FROM users, major
  WHERE users.majorid=major.id AND assoId=?`

  conn.query(sql, [req.user.assoId], (err, rows) => {
    if (err)
      throw err;

    return res.render('asso/member', {
      user: req.user,
      info: {
        title: '부원 계정관리',
        titlehref: '/asso/home/member',
        headbar: []
      },
      assouser: rows
    });
  })

})

router.post('/member/passdel', (req, res) => {
  var sql;
  if (req.body.del)
    sql = `UPDATE users SET grade=null, assoId=null WHERE id=?`
  else if (req.body.pass)
    sql = `UPDATE users SET grade=4 WHERE id=?`

  conn.query(sql, [req.body.id], (err, row) => {
    if (err)
      throw err;
    else
      return res.json({
        status: true
      })
  })
})

module.exports = router;
