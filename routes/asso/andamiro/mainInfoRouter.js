const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const mainInfoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/andamiro/mainInfo') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const mainInfoUpload = multer({
  storage: mainInfoStorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM andamiro_info ORDER BY infoorder`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    res.render('asso/andamiro/mainInfo', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/andamiro/mainInfo',
        headbar: []
      },
      mainInfo : rows
    });
  })
});

router.post('',  mainInfoUpload.any(), (req, res) => {
  let mainInfos = req.body.mainInfo;
  
  //파일이 추가된 경우 객체의 파라미터로 해당 파일명을 등록
  req.files.forEach(x=>{
    let fileIdx = x.fieldname.replace(/[^0-9]/g,'')[0];
    mainInfos[fileIdx][2] = x.filename;
  })

  mainInfos = mainInfos.filter(x=>true);
  
  let sql = `SELECT * FROM andamiro_info WHERE id = ?`;

  async.forEachOf(mainInfos, function (mainInfo, i, inner_callback) {
    conn.query(sql, [mainInfo[4]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE andamiro_info 
          SET title = ?, description=?, thumbnail=?, infoorder=?
          WHERE id = ?`;

          conn.query(sql, mainInfo, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO andamiro_info (title, description, thumbnail, infoorder)
          VALUES (?, ?, ?, ?)`;

          conn.query(sql, mainInfo, (err, rows) => {
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
      res.redirect('/asso/andamiro/mainInfo')
    }
  });
})

module.exports = router;