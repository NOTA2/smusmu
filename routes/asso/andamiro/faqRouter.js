const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const faqstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/andamiro/faq') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const faqupload = multer({
  storage: faqstorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM andamiro_faq WHERE col = ? ORDER BY faqorder`;
  let col = 0;

  if(req.query.col)
    col = req.query.col

  conn.query(sql, [col], (err, rows) => {
    if (err) {
      throw err;
    }

    res.render('asso/andamiro/faq', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/andamiro/faq',
        headbar: []
      },
      faq : rows,
      col : col
    });
  })
});

router.post('',  faqupload.any(), (req, res) => {
  let faqs = req.body.faq;

  req.files.forEach(x=>{
    let fileIdx = x.fieldname.replace(/[^0-9]/g,'')[0];
    faqs[fileIdx][2] = x.originalname;
  })

  faqs = faqs.map(x=>{
    return [
      x[0],                         // question
      x[1],                         // answer
      x[2] ? x[2] : null,           // img
      x[3] ? x[3] : null,           // url
      x[4] ? x[4] : null,           // phone
      x[5],                         // col
      x[6],                         // faqorder
      x[7]                          // id
    ]
  })
  
  faqs = faqs.filter(x=>true);

  let sql = `SELECT * FROM andamiro_faq WHERE id = ?`;

  async.forEachOf(faqs, function (faq, i, inner_callback) {
    conn.query(sql, [faq[7]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE andamiro_faq 
          SET question=?, answer=?, img=?, url=?, phone=? , col=?, faqorder=?
          WHERE id = ?`;

          conn.query(sql, faq, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO andamiro_faq (question, answer, img, url, phone, col, faqorder)
          VALUES (?, ?, ?, ?, ?, ?, ?)`;

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
      res.redirect('/asso/andamiro/faq')
    }
  });
})

module.exports = router;