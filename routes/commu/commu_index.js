var conn = require('../../config/db')();
var router = require('express').Router();

var home = require('./chome')
var petition = require('./petition')
var board = require('./board')

router.use('/home', home);
router.use('/petition', petition);
router.use('/board', board);


router.get('/', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, comment
  FROM petition LEFT JOIN users ON petition.authId=users.id
  WHERE answerState=0
  ORDER BY lik DESC, petition.id DESC
  LIMIT 10`;

  conn.query(sql, (err, results) => {

    res.render('commu/index', {
      user: req.user,
      info: {
        title: '커뮤니티 홈',
        titlehref: '/commu/',
        headbar: []
      },
      topics: results
    });
  })

});

module.exports = router;