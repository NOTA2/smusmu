const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const scholarshipStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/scholarship') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const scholarshipUpload = multer({
  storage: scholarshipStorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM scholarship ORDER BY scholarshiporder`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    //button이 json 형태로 저장되어 있으니 이를 정리해준다.
    for (let i = 0; i < rows.length; i++) {
      rows[i].buttons = JSON.parse(rows[i].buttons);

      for (let j = 0; j < 3; j++) {
        if (!rows[i].buttons[j]) {
          rows[i].buttons[j] = ['null'];
          continue;
        }
        let temp = [rows[i].buttons[j].action, rows[i].buttons[j].label]
        if (rows[i].buttons[j].action == "osLink")
          temp[2] = rows[i].buttons[j].osLink.mobile
        else if (rows[i].buttons[j].action == "phone")
          temp[2] = rows[i].buttons[j].phoneNumber;

        rows[i].buttons[j] = temp.slice();
      }
    }

    res.render('asso/assokakao/scholarship', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/assokakao/scholarship',
        headbar: []
      },
      scholarship: rows
    });
  })
});

router.post('', scholarshipUpload.any(), (req, res) => {
  let scholarships = req.body.scholarship;

  req.files.forEach(x=>{
    let fileIdx = x.fieldname.replace(/[^0-9]/g,'')[0];
    scholarships[fileIdx][2] = x.originalname;
  })


  scholarships = scholarships.map(x=>{
    x.bt = new Array();
    for (let i = 0; i < 3; i++) {
      if (x[4][i][0] == "null")
        continue;

      x.bt[i] = {
        "action": x[4][i][0],
        "label": x[4][i][1]
      }

      if (x.bt[i].action == "osLink")
        x.bt[i].osLink = {
          "mobile": x[4][i][2]
        }
      else if (x.bt[i].action == "phone")
        x.bt[i].phoneNumber = x[4][i][2];
    }

    x[4] = x.bt.slice();

    x[4] = JSON.stringify(x[4], null, 4);
    delete x.bt;

    return [
      x[0] ? x[0] : null,           // title
      x[1] ? x[1] : null,           // description
      x[2] ? x[2] : null,           // thumbnail
      x[3] ? x[3] : null,           // content
      x[4],                         // buttons
      x[5],                         // scholarshiporder
      x[6]                          // id
    ]
  })

  scholarships = scholarships.filter(x=>true);

  let sql = `SELECT * FROM scholarship WHERE id = ?`;

  async.forEachOf(scholarships, function (scholarship, i, inner_callback) {
    conn.query(sql, [scholarship[6]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE scholarship 
          SET title=?, description=?, thumbnail=?, content=?, buttons=?, scholarshiporder=?
          WHERE id = ?`;

          conn.query(sql, scholarship, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO scholarship (title, description, thumbnail, content, buttons, scholarshiporder)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, scholarship, (err, rows) => {
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
      res.redirect('/asso/assokakao/scholarship')
    }
  });

})

module.exports = router;