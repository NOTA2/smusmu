module.exports = function (passport) {
  const conn = require('../config/db')();
  const hasher = require('pbkdf2-password')();
  const route = require('express').Router();
  const crypto = require('crypto');
  const nodemailer = require('nodemailer');
  const fs = require('fs');
  const agree1 = fs.readFileSync('public/registercheck1', 'utf-8');
  const agree2 = fs.readFileSync('public/registercheck2', 'utf-8');
  
  route.get('/register', (req, res) => {
    res.redirect('/auth/login');
  });

  route.get('/register/info', (req, res) => {
    res.render('auth/registerInfo');
  });

  route.get('/register/commu', (req, res) => {
    
    var kakaoId = req.query.kakaoId;

    if (!kakaoId)
      return res.redirect('/auth/register/info')

    var sql = 'SELECT * FROM users WHERE kakaoId=?';
    conn.query(sql, [kakaoId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      if (results.length > 0) { //가입했을 때
        if (results[0].token == 'true') //인증을 받았다면
          return res.redirect('/');
        else //못 받았다면
          return res.redirect('/auth/register/commu/email');
      } else
        res.render('auth/registerCommu', {
          kakaoId: kakaoId,
          agree1 : agree1,
          agree2 : agree2
        });

    });

  });

  route.post('/register/commu', (req, res) => {

    crypto.randomBytes(20, function (err, buffer) {
      var token = buffer.toString('hex');

      hasher({
        password: req.body.password
      }, (err, pass, salt, hash) => {
        var user = {
          username: req.body.username,
          password: hash,
          salt: salt,
          kakaoId: req.body.kakaoId,
          token: token,
          email: req.body.schoolId + '@sangmyung.kr',
          college: req.body.college,
          department: req.body.department,
          schoolId: req.body.schoolId,
          name: req.body.name,
          nickname: req.body.nickname,
          phone: req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3
        }

        sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, (err, results) => {
          if (err) {
            console.log(err);
            res.status(500);
          } else {
            console.log(user);

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'skaska121212@gmail.com', // gmail 계정 아이디를 입력
                pass: 'Ehdngus23$' // gmail 계정의 비밀번호를 입력
              }
            });

            var mailOptions = {
              from: 'skaska121212@gmail.com', // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
              to: user.email, // 수신 메일 주소
              subject: '스뮤스뮤 계정 인증 메일입니다.', // 제목
              html: `
  <p>상명대학교 학생들을 위한 모든 정보! 스뮤스뮤입니다.</p>
  <p>가입 신청이 완료되었습니다.</p>
  
  <p>아이디 : ${user.username}</p>
  <p>이름 : ${user.name}</p>
  <p>학과 : ${user.department}</p>
  <p>학번 : ${user.schoolId}</p>

  <p>위의 정보가 본인이 맞다면 아래의 URL로 접속하여 계정 인증을 마쳐주세요.</p>
  <a href="https://smusmu.co.kr/auth/register/commu/email?username=${user.username}&token=${user.token}">스뮤스뮤 가입 인증하기</a>` // 내용
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);

                return res.redirect('/auth/register/commu/email');
                // req.login(user, (err) => {
                //   req.session.save(() => {
                //     res.redirect('/commu');
                //   });
                // });
              }
            });
          }
        });
      });
    });
  });

  route.post('/register/username', (req, res) => {
    var sql = 'SELECT * FROM users WHERE username=?';
    conn.query(sql, [req.body.username], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) { //정보가 있을 경우 중복
          return res.json({
            status: true
          });
        } else {
          return res.json({
            status: false
          })
        }
      }
    });

  });

  route.get('/register/commu/email', (req, res) => {
    var sql = 'SELECT * FROM users WHERE username=?';
    conn.query(sql, [req.query.username], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) { //정보가 있을 경우
          if (results[0].token === req.query.token) {   //토큰이 일치하면 성공
            sql = 'UPDATE users SET token=? WHERE username=?';
            conn.query(sql, ['true', req.query.username], (err, results) => {
              return res.render('auth/registerEmailS')
            })
          } else if (results[0].token == 'true') {      //이미 성공한 상태
            return res.render('auth/registerEmailS')
          } else {
            return res.render('auth/registerEmail')
          }
        } else {
          return res.render('auth/registerEmail')
        }
      }

    });
  })


  route.get('/register/asso', (req, res) => {
    res.render('auth/registerAsso');
  });

  route.post('/register/asso', (req, res) => {

    hasher({
      password: req.body.password
    }, (err, pass, salt, hash) => {
      var user = {
        username: req.body.username,
        password: hash,
        salt: salt
      }

      var sql = 'INSERT INTO assoUser SET ?';
      conn.query(sql, user, (err, results) => {
        if (err) {
          console.log(err);
          res.status(500);
        } else {
          req.login(user, (err) => {
            req.session.save(() => {
              res.redirect('/asso');
            });
          });
        }
      });
    });
  });


  route.get('/login', (req, res) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          res.redirect('/commu')
        else
          res.redirect('/auth/register/commu/email');
      }


      //학생회 계정일경우
      else
        res.redirect('/asso');
    } else {
      res.render('auth/login');
    }
  });

  route.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: false
  }));

  route.get('/logout', (req, res) => {
    req.logout();
    req.session.save(() => {
      res.redirect('/auth/login');
    })
  })

  return route;
};