var router = require('express').Router();

const kakao = require('./kakao');
const andamiro = require('./andamiro');
const basic = require('./basic');
const assokakao = require('./assokakao');


router.all('*', (req, res, next) => {
  if (req.user && req.user.grade) {
    if (req.user.token == 'true') next();
    else res.render('asso/home/wait', {
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
});


router.use('/', basic);
router.use('/kakao', kakao);
router.use('/andamiro', andamiro);
router.use('/assokakao', assokakao);



module.exports = router;