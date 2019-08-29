const defaultObj = require('../../../config/defaultVariable')
const conn = require('../../../config/db');
const router = require('express').Router();

router.post('/', (req, res) => {
  let goQuickReplies = defaultObj.goQuickReplies.slice()
  goQuickReplies.splice(1, 1)

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼어요! 잠시 후 다시 시도해주세요! 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(goQuickReplies)
    }
  };

  let sql = `SELECT * FROM taxi ORDER BY count, code DESC`

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    message.template.outputs[0] = {
      "basicCard": {
        "title": "택시 같이타기",
        "description": "카카오톡 오픈채팅방을 통해서 같이 택시를 타고갈 슴우를 구해보세요!",
        "thumbnail": {
          "imageUrl": `http://${defaultObj.ipadd}/img/function/taxi.png`
        }
      }
    }
    if (rows.length > 0) {
      rows.forEach((el) => {
        message.template.quickReplies.unshift({
          "label": el.location,
          "action": "block",
          "blockId": "5d65114e8192ac00011f31d4",
          "messageText": el.location,
          "extra" : {
            "taxi" : el
          }
        })

      });
    }
    res.json(message);
  })
})


router.post('/result', (req, res) => {
  let taxi = req.body.action.clientExtra.taxi;

  let sql = `UPDATE taxi SET count=count+1 WHERE location=?`

  conn.query(sql, [taxi.location], (err, rows) => {
    let message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "basicCard": {
            "title": taxi.location,
            "description": `${taxi.location} 택시 오픈 채팅방입니다! 비밀번호는 "${taxi.password}"입니다!`,
            "thumbnail": {
              "imageUrl": `http://${defaultObj.ipadd}/img/function/taxi.png`
            },
            "buttons": [{
              "label": "오픈채팅 참여 💬",
              "action": "webLink",
              "webLinkUrl": taxi.url
            }]
          }
        }],
        "quickReplies": defaultObj.Qu.concat(defaultObj.goQuickReplies)
      }
    };
    res.json(message);
  })
});

module.exports = router;