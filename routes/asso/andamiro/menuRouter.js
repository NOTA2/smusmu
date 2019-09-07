const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const menuStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/andamiro/menu') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const menuUpload = multer({
  storage: menuStorage
})

router.get('', (req, res) => {
  let infoId = req.query.infoId

  let sql = `SELECT * FROM andamiro_info ORDER BY infoorder`

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    let info;
    let infoList = rows;

    if (infoList.length > 0) {
      if (!infoId) {
        info = infoList.filter(x => x.id == infoId)
        if (  info.length == 0)
          info = infoList[0]

        infoId = info.id
      }

      let sql = `
      SELECT * FROM andamiro_menu 
      WHERE col = ? AND infoId= ? 
      ORDER BY menuorder`;

      let col = 0;

      if (req.query.col)
        col = req.query.col

      conn.query(sql, [col, infoId], (err, rows) => {
        if (err) {
          throw err;
        }

        res.render('asso/andamiro/menu', {
          user: req.user,
          info: {
            title: '',
            titlehref: '/asso/andamiro/menu',
            headbar: []
          },
          menu: rows,
          col: col,
          infoId: infoId,
          infoList: infoList
        });
      })

    } else {
      return res.render('asso/andamiro/menu', {
        user: req.user,
        info: {
          title: '',
          titlehref: '/asso/andamiro/menu',
          headbar: []
        },
        menu: [],
        col: null,
        infoId: null,
        infoList: []
      });
    }
  })
});

router.post('', menuUpload.any(), (req, res) => {
  let menus = req.body.menu;
  let col = menus[0][3]
  let infoId = menus[0][4]

  req.files.forEach(x => {
    let fileIdx = x.fieldname.replace(/[^0-9]/g, '')[0];
    menus[fileIdx][2] = x.originalname;
  })

  menus = menus.map(x=>{
    return [
      x[0] ? x[0] : null,     //title
      x[1] ? x[1] : null,     //description
      x[2] ? x[2] : null,     //thumbnail
      x[3],                   //col
      x[4],                   //infoId
      x[5],                   //menuorder
      x[6] ? x[6] : null,     //id
    ]
  })

  console.log(menus);
  
  // return res.redirect('/asso/andamiro/menu');

  let sql = `SELECT * FROM andamiro_menu WHERE id = ?`;

  async.forEachOf(menus, function (menu, i, inner_callback) {
    conn.query(sql, [menu[6]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE andamiro_menu 
          SET title = ?, description=?, thumbnail=?, col=?, infoId=?, menuorder=?
          WHERE id = ?`;

          conn.query(sql, menu, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO andamiro_menu (title, description, thumbnail, col, infoId, menuorder)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, menu, (err, rows) => {
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
      res.redirect(`/asso/andamiro/menu?col=${col}&infoId=${infoId}`)
    }
  });
})

module.exports = router;