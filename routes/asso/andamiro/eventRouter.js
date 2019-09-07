const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/andamiro/event') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const eventUpload = multer({
  storage: eventStorage
})

router.get('', (req, res) => {
  let sql = `SELECT * FROM andamiro_event ORDER BY id DESC LIMIT 1 `;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }
    let event;
    if (rows.length == 0) {
      event = {
        "img": null,
        "content": null,
        "buttons": [
          [],
          [],
          []
        ],
        "title": null,
        "description": null,
        "thumbnail": null
      }
    } else {
      event = {
        "img": rows[0].img ? rows[0].img : null,
        "content": rows[0].content ? rows[0].content : null,
        "buttons": rows[0].buttons ? JSON.parse(rows[0].buttons) : [['null','',''],['null','',''],['null','','']],
        "title": rows[0].title ? rows[0].title : null,
        "description": rows[0].description ? rows[0].description : null,
        "thumbnail": rows[0].thumbnail ? rows[0].thumbnail : null,
      }

      console.log(event);
      console.log(event.buttons);
      

        for (let j = 0; j < 3; j++) {
          if (!event.buttons[j]) {
            event.buttons[j] = ['null'];
            continue;
          }


        let temp = [event.buttons[j].action, event.buttons[j].label]

        if (event.buttons[j].action == "osLink")
          temp[2] = event.buttons[j].osLink.mobile;
        else if (event.buttons[j].action == "phone")
          temp[2] = event.buttons[j].phoneNumber;

        event.buttons[j] = temp.slice();
      }
    }
    res.render('asso/andamiro/event', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/andamiro/event',
        headbar: []
      },
      event: event
    });
  })
});

router.post('', eventUpload.any(), (req, res) => {
  let event = req.body.event;

  req.files.forEach(x => {
    let fileIdx = x.fieldname.split('[')[1].split(']')[0];
    event[fileIdx] = x.originalname;
  })

  let bt = new Array();
  for (let i = 0; i < 3; i++) {
    if (event.buttons[i][0] == "null")
      continue;

    bt[i] = {
      "action": event.buttons[i][0],
      "label": event.buttons[i][1]
    }

    if (bt[i].action == "osLink"){
      bt[i].osLink = {
        "mobile": event.buttons[i][2]
      }
    }
      
    else if (bt[i].action == "phone")
      bt[i].phoneNumber = event.buttons[i][2];
  }

  if (bt.length > 0) {
    event.buttons = bt.slice();
  } else
    event.buttons = null

    event = {
      "img": event.img ? event.img : null,
      "content": event.content ? event.content : null,
      "buttons": event.buttons ? JSON.stringify(event.buttons, null, 4) : null,
      "title": event.title ? event.title : null,
      "description": event.description ? event.description : null,
      "thumbnail": event.thumbnail ? event.thumbnail : null,
    }

    console.log(event);
    

  let sql = `INSERT INTO andamiro_event SET ?`;

  conn.query(sql, event, (err, rows) => {
    if(err){
      console.error(err);
      return res.redirect('/asso/andamiro/event')
    }
    res.redirect('/asso/andamiro/event')
  });

})

module.exports = router;