const router = require('express').Router();

const conn = require('../../config/db')();
const hasher = require('pbkdf2-password')();
const crypto = require('crypto');

router.get('/', (req, res, next) => {
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

  var sql = `select college from major group by college`


  conn.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    var college = rows.map(x => x.college);
    college.unshift('총학생회');

    sql = `select token, assocollege
    FROM assoUser
    LEFT JOIN asso ON assoUser.id=asso.assoUserId
    WHERE grade=2 OR grade=3`;

    conn.query(sql, (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500);
      }

      if (rows.length > 0) { //정보가 있을 경우 중복
        var exist = rows.filter(x => x.token == 'true').map(x => x.assocollege);

        return res.render('auth/register/registerAsso', {
          college: college,
          exist: exist
        });
      } else {
        return res.render('auth/register/registerAsso', {
          college: college
        });
      }
    })
  })
});

router.post('/', (req, res) => {
  crypto.randomBytes(20, function (err, buffer) {
    var token = buffer.toString('hex');

    hasher({
      password: req.body.password
    }, (err, pass, salt, hash) => {

      var user = {
        username: req.body.username,
        password: hash,
        salt: salt,
        token: token,
        grade: '2'
      }

      var asso = {
        assocollege: req.body.assocollege,
        assoname: req.body.assoname,
        assoemail: req.body.assoemail,
        assophone: req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3
      }

      if (asso.college != '총학생회')
        user.grade = '3';


      var sql = "INSERT INTO asso SET ?"

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
    });
  });
});



module.exports = router