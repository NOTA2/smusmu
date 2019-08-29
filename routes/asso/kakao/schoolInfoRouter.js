const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
var fs = require('fs')

router.get('', (req, res) => {
  let dir = './public/img/mapimg';
  let sql = `SELECT * FROM schoolInfo ORDER BY category, keyword`;
  
  fs.readdir(dir, function(err, imglist){
    imglist = Array.from(new Set(imglist.map(x=>x.replace(/[0-9]/g, '')))).map(x=>x.replace('.png', ''));
    imglist.unshift(null)

    conn.query(sql, (err, rows) => {
      if (err) {
        throw err;
      }
  
      res.render('asso/kakao/schoolInfo', {
        user: req.user,
        info: {
          title: '',
          titlehref: '/asso/kakao/schoolInfo',
          headbar: []
        },
        schoolInfo : rows,
        imglist : imglist
      });
    })
  })
});

router.post('', (req, res) => {
  let schoolInfos = req.body.schoolInfo;
  schoolInfos = schoolInfos.map(x=>x.map(x=>x==''?null:x))

  let sql = `SELECT * FROM schoolInfo WHERE id = ?`;

  async.forEachOf(schoolInfos, function (schoolInfo, i, inner_callback) {
    conn.query(sql, [schoolInfo[6]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE schoolInfo 
          SET category = ?, keyword=?, phoneNumber=?, faxNumber=?, img=?, explanation=?
          WHERE id = ?`;

          conn.query(sql, schoolInfo, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO schoolInfo (category, keyword, phoneNumber, faxNumber, img, explanation)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, schoolInfo, (err, rows) => {
            if (err) {
              inner_callback(err);
            }
            inner_callback(null);
          });
        }
      }
    });
  }, function (err) {
    if (err) {
      throw err
    } else {
      return res.redirect('/asso/kakao/schoolInfo')
    }
  });
})



module.exports = router;