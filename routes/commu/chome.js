var conn = require('../../config/db')();
var router = require('express').Router();


router.get('/myinfo', (req, res) => {
  req.user.phone = req.user.phone.split('-');

  res.render('commu/myinfo', {
    user: req.user,
    info: {
      title: '내 정보',
      titlehref: '/commu/home/myinfo',
      headbar: []
    },
    menu : req.menu
  });
});

router.post('/myinfo', (req, res) => {

  var param = [
    req.body.name,
    req.body.college,
    req.body.major,
    req.body.nickname,
    req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3,
    req.body.id
  ]

  var sql = `UPDATE users SET name=?, majorId=
  (SELECT id FROM major WHERE college=? AND major=?), nickname=?, phone=? WHERE id=?`
  conn.query(sql, param, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    } else {
      req.user.name = req.body.name
      req.user.college = req.body.college
      req.user.major = req.body.major
      req.user.nickname = req.body.nickname
      req.user.phone = [req.body.phone1, req.body.phone2, req.body.phone3]

      res.render('commu/myinfo', {
        user: req.user,
        info: {
          title: '내 정보',
          titlehref: '/commu/home/myinfo',
          headbar: []
        },
        menu : req.menu
      });
    }
  })
});

router.get('/assoapply', (req, res) => {

  var sql = `select token, assocollege, assoname, asso.id as aid
  FROM assoUser LEFT JOIN asso ON assoUser.id=asso.assoUserId
  WHERE grade=2 OR grade=3`;

  conn.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    var asso = Array()

    if (rows.length > 0) //정보가 있을 경우 중복
      asso = rows.filter(x => x.token == 'true');
    
    return res.render('commu/assoapply', {
      user: req.user,
      info: {
        title: '학생회 부원계정 신청',
        titlehref: '/commu/home/assoapply',
        headbar: []
      },
      asso: asso,
      menu : req.menu
    });
  })
});


router.post('/assoapply', (req, res) =>{
  var sql = `update users set assoId=? where id=?`;

  conn.query(sql, [req.body.assoId, req.body.uid], (err, rows)=>{
    if(err){
      throw err;
    }
    res.redirect('/commu/home/assoapply')
  })
})

router.post('/assoapply/del', (req, res) =>{
  var sql = `update users set assoId=null, grade=null where id=?`;

  conn.query(sql, [req.body.uid], (err, rows)=>{
    if(err){
      throw err;
    }
    res.redirect('/commu/home/assoapply')
  })
})

module.exports = router;