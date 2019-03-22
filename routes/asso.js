var conn = require('../config/db')();
var route = require('express').Router();
var multer = require('multer'); // express에 multer모듈 적용 (for 파일업로드)
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/logo') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, req.user.name+'.'+file.mimetype.split('/')[1]) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
var upload = multer({ storage: storage })

route.get('/', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref:'/asso',
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
      titlehref:'/asso',
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
        titlehref:'/asso',
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
      titlehref:'/asso/myinfo',
      headbar: []
    }
  });
});

route.post('/myinfo', upload.single('logo'), (req, res) => {
  var logo = req.file.path.replace('public/','');
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
  
  if (req.user.grade == 1) {
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
              titlehref:'/asso/myinfo',
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
            titlehref:'/asso/myinfo',
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
        titlehref:'/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {

  req.user.phone = req.user.phone.split('-');
  res.render('asso/rentnow', {
    user: req.user,
    info: {
      title: '대여물품 현황',
      titlehref:'/asso/rent/now',
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
    }
  });

});


route.get('/rent/setting', (req, res, next) => { 
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref:'/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {

  req.user.phone = req.user.phone.split('-');
  res.render('asso/rentsetting', {
    user: req.user,
    info: {
      title: '물품 등록/관리',
      titlehref:'/asso/rent/setting',
      headbar:  [{
        title: '대여물품 현황',
        href: '/asso/rent/now'
      }, {
        title: '물품 등록/관리',
        href: '/commu/rent/setting'
      }, {
        title: '대여 기록',
        href: '/commu/rent/list'
      }]
    }
  });


});

route.get('/rent/list', (req, res, next) => { 
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/wait', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref:'/asso',
        headbar: []
      }
    })
  } else if (req.user && req.user.kakaoId)
    res.redirect('/commu');
  else
    res.redirect('/auth/login');
}, (req, res) => {

  req.user.phone = req.user.phone.split('-');
  res.render('asso/rentlist', {
    user: req.user,
    info: {
      title: '대여 기록',
      titlehref:'/asso/rent/list',
      headbar:  [{
        title: '대여물품 현황',
        href: '/asso/rent/now'
      }, {
        title: '물품 등록/관리',
        href: '/commu/rent/setting'
      }, {
        title: '대여 기록',
        href: '/commu/rent/list'
      }]
    }
  });

});


module.exports = route;