var conn = require('../../config/db')();
var router = require('express').Router();

var home = require('./chome')
var petition = require('./petition')
var board = require('./board')
var festival = require('./festival')

router.use('/festival', festival);

router.all('*', (req, res, next)=>{
  if (req.user) {
    if (req.user.token == 'true'){
      var sql = `SELECT * FROM board`
      conn.query(sql, (err, rows)=>{
        if(err) throw err;
        req.menu = rows;
        next();
      })
    }
    else 
      return res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    return res.redirect('/auth/login');
})

router.use('/home', home);
router.use('/petition', petition);
router.use('/board', board);

router.get('/', (req, res) => {

  res.render('commu/home/index', {
    user: req.user,
    info: {
      title: '커뮤니티 홈',
      titlehref: '/commu/',
      headbar: []
    },
    menu : req.menu
  });

});


module.exports = router;