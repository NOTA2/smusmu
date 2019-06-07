const conn = require('../../config/db')();
const defaultObj = require('../../config/defaultVariable');
var hasher = require('pbkdf2-password')();

const router = require('express').Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const gmailKey = fs.readFileSync('key/gmailKey', 'utf-8');


  router.get('/', (req, res, next) => {
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
    res.render('auth/find/find')
  });


  router.post('/id', (req, res) => {
    var sql = `SELECT username, email FROM users 
    WHERE schoolId=? AND majorId=(
      SELECT id FROM major where college=? AND major=?
    )`

    conn.query(sql, [req.body.schoolId, req.body.college, req.body.major], (err, rows) => {
      if (err)
        throw err;

      if (rows.length > 0) {

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'smusmudd@gmail.com', // gmail 계정 아이디를 입력
            pass: gmailKey // gmail 계정의 비밀번호를 입력
          }
        });

        var mailOptions = {
          from: 'smusmudd@gmail.com', // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
          to: rows[0].email, // 수신 메일 주소
          subject: '스뮤스뮤 아이디 찾기 결과입니다.', // 제목
          html: `
<p>상명대학교 학생들을 위한 모든 정보! 스뮤스뮤입니다.</p>
<br>
<p>귀하의 아이디는 [${rows[0].username}] 입니다.</p>

<p>본 메일은 발신용 메일이므로 회신이 되지 않습니다.</p>` // 내용
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);

            return res.render(`auth/find/findResult`, {
              type: 'id'
            });
          }
        });

      } else {
        return res.render(`auth/find/findResult`, {
          type: 'none'
        });
      }
    })

  })

  router.post('/pw', (req, res) => {
    crypto.randomBytes(20, function (err, buffer) {
      var token = buffer.toString('hex');
      var username = req.body.username;
      var schoolId = req.body.schoolId;


      sql = 'UPDATE users SET token=? WHERE schoolId=? AND username=?';

      conn.query(sql, [token, schoolId, username], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        } else {
          if (results.affectedRows == 1) {
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'smusmudd@gmail.com', // gmail 계정 아이디를 입력
                pass: gmailKey // gmail 계정의 비밀번호를 입력
              }
            });

            var url = `https://smusmu.co.kr/auth/find/changepw?username=${username}&token=${token}`
            if (defaultObj.ipadd == '54.180.122.96')
              url = `http://${defaultObj.ipadd}/auth/find/changepw?username=${username}&token=${token}`

            var mailOptions = {
              from: 'smusmudd@gmail.com', // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
              to: `${schoolId}@sangmyung.kr`, // 수신 메일 주소
              subject: '스뮤스뮤 비밀번호 변경 메일입니다.', // 제목
              html: `
    <p>상명대학교 학생들을 위한 모든 정보! 스뮤스뮤입니다.</p>

    <p>귀하의 아이디를 잠금 처리하였습니다.</p>
    <p>아래의 링크를 통해서 비밀번호를 변경해 주세요!</p>
  
    <p><a href="${url}">스뮤스뮤 비밀번호 변경하기</a></p>
  
    <p>본 메일은 발신용 메일이므로 회신이 되지 않습니다.</p>` // 내용
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);

                return res.render(`auth/find/findResult`, {
                  type: 'pw'
                });
              }
            });
          } else {
            return res.render(`auth/find/findResult`, {
              type: 'none'
            });
          }
        }
      });
    });
  })

  router.get('/changepw', (req, res) => {
    sql = 'SELECT * FROM users WHERE token=? AND username=?';

    conn.query(sql, [req.query.token, req.query.username], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).end();
      } else {
        if (rows.length > 0) {
          return res.render(`auth/find/changepw`, {
            state: true,
            token: req.query.token,
            username: req.query.username
          });
        } else {
          return res.render(`auth/find/changepw`, {
            state: false
          });
        }
      }
    });

  })

  router.post('/changepw', (req, res) => {
    hasher({
      password: req.body.password
    }, (err, pass, salt, hash) => {

      sql = 'UPDATE users SET password=?, salt=?, token=? WHERE token=? AND username=?';

      conn.query(sql, [hash, salt, 'true', req.body.token, req.body.username], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).end();
        } else {
          if (results.affectedRows == 1) {
            return res.render(`auth/find/findResult`, {
              type: 'change'
            });
          } else {
            return res.render(`auth/find/findResult`, {
              type: 'none'
            });
          }
        }
      });
    });
  })

  module.exports = router