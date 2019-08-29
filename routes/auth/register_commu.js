const conn = require('../../config/db');
const defaultObj = require('../../config/defaultVariable');
var hasher = require('pbkdf2-password')();

const router = require('express').Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const gmailKey = fs.readFileSync('key/gmailKey', 'utf-8');



router.get('/', (req, res) => {
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
        return res.redirect(`/auth/register/commu/email?kakaoId=${results[0].kakaoId}`);
    } else
      res.render('auth/register/registerCommu', {
        kakaoId: kakaoId
      });
  });
});

router.post('/', (req, res) => {
  crypto.randomBytes(20, function (err, buffer) {
    var token = buffer.toString('hex');

    hasher({
      password: req.body.password
    }, (err, pass, salt, hash) => {
      var sql = `SELECT id FROM major WHERE college=? AND major=?`;

      conn.query(sql, [req.body.college, req.body.major], (err, rows) => {
        if (err)
          throw err;

        var user = {
          username: req.body.username,
          password: hash,
          salt: salt,
          kakaoId: req.body.kakaoId,
          token: token,
          schoolId: req.body.schoolId,
          email: req.body.schoolId + '@sangmyung.kr',
          majorId: rows[0].id,
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
                pass: gmailKey // gmail 계정의 비밀번호를 입력
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
    <p>학과 : ${req.body.major}</p>
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
      })
    });
  });
});



router.get('/email', (req, res) => {
  var sql;
  var param;
  if (req.query.kakaoId) {    
    sql = 'SELECT * FROM users WHERE kakaoId =?';
    param = req.query.kakaoId;
  } else if (req.query.username) {
    sql = 'SELECT * FROM users WHERE username=?';
    param = req.query.username;
  }else{
    return res.redirect(`/auth/register/info`);
  }
  conn.query(sql, [param], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      if (results.length > 0) { //정보가 있을 경우
        if (results[0].token === req.query.token) { //토큰이 일치하면 성공
          sql = 'UPDATE users SET token=? WHERE username=?';
          conn.query(sql, ['true', req.query.username], (err, results) => {
            return res.render('auth/registeretc/registerEmailS')
          })
        } else if (results[0].token == 'true') { //이미 성공한 상태
          return res.render('auth/registeretc/registerEmailS')
        } else {
          return res.render('auth/registeretc/registerEmail', {
            kakaoId: results[0].kakaoId,
            schoolId: results[0].schoolId
          })
        }
      } else {
        return res.render('auth/registeretc/registerEmail', {
          kakaoId: req.query.kakaoId
        })
      }
    }
  });
})

router.post('/email', (req, res) => {
  var kakaoId = req.body.kakaoId;

  var sql = `SELECT users.id as id, username, kakaoId, token, email, major.college, major.major, schoolId, name, nickname,
    phone, grade
    fROM users
    LEFT JOIN major ON users.majorId=major.id
    WHERE kakaoId=?`

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
            pass: gmailKey // gmail 계정의 비밀번호를 입력
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
    <p>학과 : ${user.major}</p>
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


router.get('/reschoolId', (req, res) => {

  if (req.query.kakaoId) {
    var kakaoId = req.query.kakaoId;

    var sql = `SELECT id, schoolId,kakaoId FROM users WHERE kakaoId=?`;

    conn.query(sql, [kakaoId], (err, rows) => {
      if (err)
        throw err;

      if (rows.length > 0)
        res.render('auth/registeretc/reschoolId', {
          schoolId: rows[0].schoolId,
          kakaoId: rows[0].kakaoId,
          id: rows[0].id,
          fail: req.query.fail
        });
      else
        return res.redirect('/');
    })
  } else {
    return res.redirect('/');
  }
});

router.post('/reschoolId', (req, res) => {
  var sql = `SELECT users.id as id, username, kakaoId, token, email, major.college, major.major, schoolId, name, nickname,
    phone, grade
    fROM users
    LEFT JOIN major ON users.majorId=major.id
    WHERE id=?`

  conn.query(sql, [req.body.id], (err, results) => {
    if (err)
      throw err;

    var user = results[0];

    if (!user) {
      return res.redirect('/');
    } else {
      hasher({
        password: req.body.password,
        salt: user.salt
      }, (err, pass, salt, hash) => {

        if (hash === user.password) {

          sql = `UPDATE users SET schoolId=? WHERE id =?`;
          conn.query(sql, [req.body.schoolId, req.body.id], (err, results) => {
            if (err)
              throw err;

            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'smusmudd@gmail.com', // gmail 계정 아이디를 입력
                pass: gmailKey // gmail 계정의 비밀번호를 입력
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
          <p>학과 : ${user.major}</p>
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
          })
        } else {
          return res.redirect(`/auth/register/commu/reschoolId?kakaoId=${req.body.kakaoId}&fail=y`)
        }
      });
    }
  });
})

module.exports = router