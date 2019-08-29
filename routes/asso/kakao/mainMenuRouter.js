const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');
const mainstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/main') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const mainupload = multer({
  storage: mainstorage
})

/*
쿼리시 조건문의 값을 id로 하지 않은 이유
- 순서를 정하는데 쓰이는 값인 menuorder은 유니크 값이다.
- 유니크 값이기 때문에 받은 params를 모두 update하는 현재 코드에서는
값의 중복이 발생하는 현상이 생긴다.
- 따라서 구분값은 menuorder을 사용한다.

- 대신 값의 삭제에는 id값을 사용.
*/
router.get('', (req, res) => {
  let sql = `SELECT * FROM mainMenu ORDER BY menuorder`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    for (let i = 0; i < rows.length; i++) {
      rows[i].buttons = JSON.parse(rows[i].buttons);

      for (let j = 0; j < 3; j++) {
        if (!rows[i].buttons[j]){
          rows[i].buttons[j] = ['null'];
          continue;
        } 
        let temp = [rows[i].buttons[j].action, rows[i].buttons[j].label]
        if (rows[i].buttons[j].action == "block")
          temp[2] = rows[i].buttons[j].blockId;
        else if (rows[i].buttons[j].action == "webLink")
          temp[2] = rows[i].buttons[j].webLinkUrl;
        else if (rows[i].buttons[j].action == "osLink")
          temp[2] = rows[i].buttons[j].link.web
        else if (rows[i].buttons[j].action == "message")
          temp[2] = rows[i].buttons[j].messageText;
        else if (rows[i].buttons[j].action == "phone")
          temp[2] = rows[i].buttons[j].phoneNumber;
        
          rows[i].buttons[j] = temp.slice();
      }
    }
    
    res.render('asso/kakao/mainmenu', {
      user: req.user,
      info: {
        title: '카카오톡 메인메뉴',
        titlehref: '/asso/kakao/mainmenu',
        headbar: []
      },
      menu: rows
    });
  })
});

router.post('', mainupload.any(), (req, res) => {
  let menus = req.body.menu;
  
  //파일이 추가된 경우 객체의 파라미터로 해당 파일명을 등록
  req.files.forEach(x=>{
    let fileIdx = x.fieldname.replace(/[^0-9]/g,'');
    menus[fileIdx].thumbnail = x.filename;
  })
  
    //버튼에 사용된 2차원 배열을 객체로 바꾸는 작업
  menus = menus.map(x => {
    x.bt = new Array();
    for (let i = 0; i < 3; i++) { 
      if (x.buttons[i][0] == "null")
        continue;

      x.bt[i] = {
        "action": x.buttons[i][0],
        "label": x.buttons[i][1]
      }

      if (x.bt[i].action == "block")
        x.bt[i].blockId = x.buttons[i][2];
      else if (x.bt[i].action == "webLink")
        x.bt[i].webLinkUrl = x.buttons[i][2];
      else if (x.bt[i].action == "osLink")
        x.bt[i].link = {
          "web ": x.buttons[i][2]
        }
      else if (x.bt[i].action == "message")
        x.bt[i].messageText = x.buttons[i][2];
      else if (x.bt[i].action == "phone")
        x.bt[i].phoneNumber = x.buttons[i][2];
    }

    x.buttons = x.bt.slice();

    x.buttons = JSON.stringify(x.buttons, null, 4);
    delete x.bt;

    return [
      x.title ? x.title : null,
      x.description ? x.description : null,
      x.thumbnail ? x.thumbnail :null,
      x.auth ? x.auth : null,
      x.buttons ? x.buttons : null,
      x.menuorder ? x.menuorder : null
    ]
  })

  let sql = `SELECT * FROM mainMenu WHERE menuorder = ?`;

  async.forEachOf(menus, function (menu, i, inner_callback) {
    conn.query(sql, [menu[5]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE mainMenu 
          SET title = ?, description=?, thumbnail=?, auth=?, buttons=?
          WHERE menuorder = ?`;

          conn.query(sql, menu, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO mainMenu (title, description, thumbnail, auth, buttons, menuorder)
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
      res.redirect('/asso/kakao/mainmenu')
    }
  });
})


module.exports = router;
