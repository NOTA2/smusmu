module.exports = function (passport) {
  const conn = require('../config/db')();
  const defaultObj = require('../config/defaultVariable');
  const hasher = require('pbkdf2-password')();
  const route = require('express').Router();
  const crypto = require('crypto');
  const nodemailer = require('nodemailer');


  route.get('/register', (req, res) => {
    res.redirect('/auth/login');
  });

  route.get('/register/info', (req, res, next) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else
          return res.redirect(`auth/register/commu/email?kakaoId=${req.user.kakaoId}`);
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  }, (req, res) => {
    res.render('auth/registerInfo');
  });

  route.get('/register/commu', (req, res, next) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else
          return res.redirect(`auth/register/commu/email?kakaoId=${req.user.kakaoId}`);
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  }, (req, res) => {
    var kakaoId = req.query.kakaoId;

    if (!kakaoId)
      return res.redirect('/auth/register/info')

    var sql = 'SELECT * FROM users WHERE kakaoId=?';
    conn.query(sql, [kakaoId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }
      console.log(results[0]);

      if (results.length > 0) { //가입했을 때
        if (results[0].token == 'true') //인증을 받았다면
          return res.redirect('/');
        else //못 받았다면
          return res.redirect(`/auth/register/commu/email?kakaoId=${results[0].kakaoId}`);
      } else
        res.render('auth/registerCommu', {
          kakaoId: kakaoId
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
            res.status(500).end();
          } else {

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'smusmudd@gmail.com', // gmail 계정 아이디를 입력
                pass: 'ehdgus23' // gmail 계정의 비밀번호를 입력
              }
            });

            var url = `https://smusmu.co.kr/auth/register/commu/email?username=${user.username}&token=${user.token}`
            if (defaultObj.ipadd == '54.180.122.96')
              url = `http://${defaultObj.ipadd}/auth/register/commu/email?username=${user.username}&token=${user.token}`
            var mailOptions = {
              from: 'smusmudd@gmail.com', // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
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
  <a href="${url}">스뮤스뮤 가입 인증하기</a>
  

  <p>본 메일은 발신용 메일이므로 회신이 되지 않습니다.</p>` // 내용
            };

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);

                return res.redirect(`/auth/register/commu/email?kakaoId=${user.kakaoId}`);
              }
            });
          }
        });
      });
    });
  });

  route.post('/register/username', (req, res) => {
    var sql = 'SELECT * FROM assoUser WHERE username=?';
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
          sql = 'SELECT * FROM users WHERE username=?';
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
        }
      }
    });
  });

  route.post('/register/schoolId', (req, res) => {
    var sql = 'SELECT token FROM users WHERE schoolId=?';
    conn.query(sql, [req.body.schoolId], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) { //정보가 있을 경우 중복
          if (results[0].token == 'true')
            return res.json({
              status: true
            });
          else {
            return res.json({
              status: false
            })
          }
        } else {
          return res.json({
            status: false
          })
        }
      }
    });
  });

  route.post('/register/nickname', (req, res) => {
    
    if (req.body.username) {
      var sql = 'SELECT nickname FROM users WHERE username=?';
      conn.query(sql, [req.body.username], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500);
        } else {
          console.log(results[0]);
          
          if (results.length > 0) { //내 정보가 있을 때
            if (results[0].nickname == req.body.nickname){
              console.log(req.body.nickname);
              
              res.json({
                status: false
              });
              return res.end();
            }
            else {

              var sql = 'SELECT token FROM users WHERE nickname=?';
              conn.query(sql, [req.body.nickname], (err, results) => {
                if (err) {
                  console.log(err);
                  res.status(500);
                } else {
                  if (results.length > 0) { //정보가 있을 경우 중복
                    if (results[0].token == 'true')
                      return res.json({
                        status: true
                      });
                    else {
                      return res.json({
                        status: false
                      })
                    }
                  } else {
                    return res.json({
                      status: false
                    })
                  }
                }
              });
            }
          } else {
            var sql = 'SELECT token FROM users WHERE nickname=?';
            conn.query(sql, [req.body.nickname], (err, results) => {
              if (err) {
                console.log(err);
                res.status(500);
              } else {
                if (results.length > 0) { //정보가 있을 경우 중복
                  if (results[0].token == 'true')
                    return res.json({
                      status: true
                    });
                  else {
                    return res.json({
                      status: false
                    })
                  }
                } else {
                  return res.json({
                    status: false
                  })
                }
              }
            });
          }
        }
      });

    }else{
      var sql = 'SELECT token FROM users WHERE nickname=?';
      conn.query(sql, [req.body.nickname], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500);
        } else {
          if (results.length > 0) { //정보가 있을 경우 중복
            if (results[0].token == 'true')
              return res.json({
                status: true
              });
            else {
              return res.json({
                status: false
              })
            }
          } else {
            return res.json({
              status: false
            })
          }
        }
      });
    }

  });


  route.get('/register/commu/email', (req, res, next) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else
          next();
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  }, (req, res) => {
    var sql = 'SELECT * FROM users WHERE username=?';
    conn.query(sql, [req.query.username], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) { //정보가 있을 경우
          if (results[0].token === req.query.token) { //토큰이 일치하면 성공
            sql = 'UPDATE users SET token=? WHERE username=?';
            conn.query(sql, ['true', req.query.username], (err, results) => {
              return res.render('auth/registerEmailS')
            })
          } else if (results[0].token == 'true') { //이미 성공한 상태
            return res.render('auth/registerEmailS')
          } else {
            return res.render('auth/registerEmail', {
              kakaoId: results[0].kakaoId
            })
          }
        } else {
          return res.render('auth/registerEmail', {
            kakaoId: req.query.kakaoId
          })
        }
      }
    });
  })

  route.post('/register/commu/email', (req, res) => {
    var kakaoId = req.body.kakaoId;
    var sql = 'SELECT * FROM users WHERE kakaoId=?';
    conn.query(sql, [kakaoId], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) {
          var user = results[0];
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'smusmudd@gmail.com', // gmail 계정 아이디를 입력
              pass: 'ehdgus23' // gmail 계정의 비밀번호를 입력
            }
          });

          var url = `https://smusmu.co.kr/auth/register/commu/email?username=${user.username}&token=${user.token}`
          if (defaultObj.ipadd == '54.180.122.96')
            url = `http://${defaultObj.ipadd}/auth/register/commu/email?username=${user.username}&token=${user.token}`
          var mailOptions = {
            from: 'smusmudd@gmail.com', // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
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
      <a href="${url}">스뮤스뮤 가입 인증하기</a>
      
      
      <p>본 메일은 발신용 메일이므로 회신이 되지 않습니다.</p>` // 내용
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);

              return res.redirect(`/auth/register/commu/email?kakaoId=${user.kakaoId}`);
            }
          });

        } else {
          return res.redirect(`/auth/register/commu?kakaoId=${kakaoId}`)
        }
      }
    });
  })


  route.get('/register/asso', (req, res, next) => {
    if (req.user) { 
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else
          return res.redirect(`auth/register/commu/email?kakaoId=${req.user.kakaoId}`);
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  }, (req, res) => {
    res.render('auth/registerAsso');
  });

  route.post('/register/asso', (req, res) => {
    crypto.randomBytes(20, function (err, buffer) {
      var token = buffer.toString('hex');

      hasher({
        password: req.body.password
      }, (err, pass, salt, hash) => {

        var grade = req.body.grade
        var user = {
          username: req.body.username,
          password: hash,
          salt: salt,
          token: token,
          email: req.body.email,
          grade: grade
        }

        var sql;

        if (grade == '1') { //임원 계정 생성의 경우
          var asso = {
            college: req.body.college,
            name: req.body.name,
            phone: req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3
          }
          sql = "INSERT INTO asso SET ?"
          conn.query(sql, asso, (err, results) => {
            if (err) {
              console.log(err);
              res.status(500);
            } else {
              user.assoId = results.insertId
              sql = "INSERT INTO assoUser SET ?"
              conn.query(sql, user, (err, results2) => {
                if (err) {
                  console.log(err);
                  res.status(500);
                } else {
                  sql = "UPDATE asso SET assoUserId=? WHERE id=?"
                  conn.query(sql, [results2.insertId, user.assoId], (err, results) => {
                    return res.redirect('/asso');
                  })
                }
              });
            }
          });
        } else { //부원 계정 생성의 경우
          sql = "SELECT * FROM asso WHERE college=?"
          conn.query(sql, [req.body.college], (err, results) => {
            if (err) {
              console.log(err);
              res.status(500);
            } else {
              user.assoId = results[0].id
              sql = "INSERT INTO assoUser SET ?"
              conn.query(sql, user, (err, results) => {
                if (err) {
                  console.log(err);
                  res.status(500);
                } else {
                  return res.redirect('/asso');
                }
              });
            }
          });
        }
      });
    });
  });


  route.post('/register/assolist', (req, res) => {
    var sql = 'select * from assoUser LEFT JOIN asso ON assoUser.id=asso.assoUserId WHERE grade=1';
    conn.query(sql, [], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {
        if (results.length > 0) { //정보가 있을 경우 중복
          var college = results.filter(x => x.token == 'true').map(x => x.college);
          console.log(college);

          if (college.length > 0) {
            return res.json({
              status: true,
              college: college
            });
          } else {
            return res.json({
              status: false,
              college: college
            });
          }
        } else {
          return res.json({
            status: false,
            college: []
          });
        }
      }
    });
  });

  route.get('/login', (req, res, next) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
      //일반 학생 계정일 경우
      if (req.user.kakaoId) {
        if (req.user.token == 'true')
          return res.redirect('/commu')
        else
          return res.redirect(`auth/register/commu/email?kakaoId=${req.user.kakaoId}`);
      }
      //학생회 계정일경우
      else
        return res.redirect('/asso');
    } else {
      next();
    }
  }, (req, res) => {

    res.render('auth/login', {
      fail: req.query.loginfail
    });

  });

  route.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login?loginfail=y',
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