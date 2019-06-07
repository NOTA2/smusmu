const conn = require('../../config/db')();
const router = require('express').Router();


var commu = require('./register_commu')
var asso = require('./register_asso')

router.use('/commu', commu);
router.use('/asso', asso);


router.get('/', (req, res) => {
  res.redirect('/auth/login');
});

router.get('/info', (req, res) => {
  res.render('auth/registeretc/registerInfo');
});


router.post('/username', (req, res) => {
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

router.post('/schoolId', (req, res) => {
  var sql = 'SELECT token FROM users WHERE schoolId=?';
  conn.query(sql, [req.body.schoolId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500);
    } else {
      if (results.length > 0) { //정보가 있을 경우 중복
        if (results[0].token == 'true') //token이 true면 인증 받은 아이디
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


//수정해야 할듯함
router.post('/nickname', (req, res) => {

  if (req.body.username) {
    var sql = 'SELECT nickname FROM users WHERE username=?';
    conn.query(sql, [req.body.username], (err, results) => {
      if (err) {
        console.log(err);
        res.status(500);
      } else {

        if (results.length > 0) { //내 정보가 있을 때
          if (results[0].nickname == req.body.nickname) {

            res.json({
              status: false
            });
            return res.end();
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
});





module.exports = router