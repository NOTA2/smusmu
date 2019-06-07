var router = require('express').Router();

var rent = require('./rent');
var home = require('./ahome');


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


router.use('/rent', rent);
router.use('/home', home);

router.get('/', (req, res) => {
  res.render('asso/home/index', {
    user: req.user,
    info: {
      title: '관리페이지 홈',
      titlehref: '/asso',
      headbar: []
    }
  });
});

module.exports = router;