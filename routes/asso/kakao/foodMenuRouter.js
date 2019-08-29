const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const foodstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/menu') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const foodupload = multer({
  storage: foodstorage
})


router.get('', (req, res) => {
  let sql = `SELECT * FROM FoodMenu`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    res.render('asso/kakao/foodMenu', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/kakao/foodMenu',
        headbar: []
      },
      foodMenu : rows
    });
  })
});

router.post('',  foodupload.any(), (req, res) => {
  let foodMenus = req.body.foodMenu;

  req.files.forEach(x=>{
    let fileIdx = x.fieldname.replace(/[^0-9]/g,'')[0];
    foodMenus[fileIdx][2] = x.originalname;
  })

  //사진은 필수기 때문에 추가작업은 생략

  let sql = `SELECT * FROM FoodMenu WHERE id = ?`;

  async.forEachOf(foodMenus, function (foodMenu, i, inner_callback) {
    conn.query(sql, [foodMenu[4]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE FoodMenu 
          SET name = ?, explanation=?, img=?, phone=?
          WHERE id = ?`;

          conn.query(sql, foodMenu, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO FoodMenu (name, explanation, img, phone)
          VALUES (?, ?, ?, ?)`;

          conn.query(sql, foodMenu, (err, rows) => {
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
      res.redirect('/asso/kakao/foodMenu')
    }
  });
})

module.exports = router;