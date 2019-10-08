const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const faqstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/faq') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const faqupload = multer({
  storage: faqstorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM faq ORDER BY category`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach(x => {
      x.category = JSON.parse(x.category)
    })

    res.render('asso/kakao/faq', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/kakao/faq',
        headbar: []
      },
      faq : rows
    });
  })
});

router.post('',  faqupload.any(), (req, res) => {
  let faqs = req.body.faq;

  req.files.forEach(x=>{
    let fileIdx = Number(x.fieldname.split('[')[1].split(']')[0]);
    faqs[fileIdx][8] = x.originalname;
  })

  //사진이 필수가 아니므로 추가작업 및 category를 배열화 시켜서 저장

  faqs = faqs.map(x => {
    return [
      JSON.stringify([x[0], x[1], x[2], x[3], x[4]]),     //category
      x[5],                               //question
      x[6],                               //answer
      x[7],                               //url
      x[8]? x[8] : '',                     //img
      x[9],                                 //faq 여부
      x[10]? x[10] : null,                   //id
    ]
  })

  let sql = `SELECT * FROM faq WHERE id = ?`;

  async.forEachOf(faqs, function (faq, i, inner_callback) {
    conn.query(sql, [faq[6]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE faq 
          SET category = ?, question=?, answer=?, url=?, img=?, faq=?
          WHERE id = ?`;

          conn.query(sql, faq, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO faq (category, question, answer, url, img, faq)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, faq, (err, rows) => {
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
      res.redirect('/asso/kakao/faq')
    }
  });
})

module.exports = router;