module.exports = function (passport) {
  const router = require('express').Router();

  var find = require('./find');
  var register = require('./register');
  var password = require('./password');

  router.use('/find', find);
  router.use('/password', password);

  //순서 중요! 바꾸지 말것!

  router.get('/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect('/auth/login');
    })
  });

  router.get('*', (req, res, next) => {
    // console.log(req);
    
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else if(req.path.indexOf('reschoolId') != -1)
          return res.redirect(`/auth/register/commu/reschoolId?kakaoId=${req.user.kakaoId}`);
        else
          return res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`);
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  });

  
  router.use('/register', register);

  router.get('/login',  (req, res) => {
    res.render('auth/login', {
      fail: req.query.loginfail
    });
  }).post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login?loginfail=y',
    failureFlash: false
  }));
  

  return router;
};