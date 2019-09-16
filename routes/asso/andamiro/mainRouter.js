const conn = require('../../../config/db');
const router = require('express').Router();
const multer = require('multer');

const mainStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/andamiro/main') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const mainUpload = multer({
  storage: mainStorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM andamiro_main ORDER BY id DESC LIMIT 1`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    let main;
    if (rows.length == 0) {
      main = {
        "title": null,
        "description": null,
        "thumbnail": null
      }
    } else {
      main = {
        "title": rows[0].title ? rows[0].title : null,
        "description": rows[0].description ? rows[0].description : null,
        "thumbnail": rows[0].thumbnail ? rows[0].thumbnail : null,
      }

    }
    res.render('asso/andamiro/main', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/andamiro/main',
        headbar: []
      },
      main: main
    });
  })
});

router.post('', mainUpload.any(), (req, res) => {
  let main = req.body.main;

  req.files.forEach(x => {
    main.thumbnail = x.originalname;
  })

  main = {
    "title": main.title ? main.title : null,
    "description": main.description ? main.description : null,
    "thumbnail": main.thumbnail ? main.thumbnail : null,
  }

  let sql = `INSERT INTO andamiro_main SET ?`;

  conn.query(sql, main, (err, rows) => {
    if (err) {
      console.error(err);
      return res.redirect('/asso/andamiro/main')
    }
    res.redirect('/asso/andamiro/main')
  });

})

module.exports = router;