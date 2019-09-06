var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  let eatQuickReplies = defaultObj.eatQuickReplies.slice();
  eatQuickReplies.splice(1, 1);
  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해 주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(eatQuickReplies)
    }
  };

  let sql = `SELECT * FROM andamiro_info ORDER BY infoorder`


  conn.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.json(message);
    }

    let info = rows;

    sql = `SELECT title, description, thumbnail FROM andamiro_event`

    conn.query(sql, (err, rows) =>{
      if (err) {
        console.error(err);
        return res.json(message);
      }
      let mainInfo = rows[0];

      message.template.outputs[0] = {
        "carousel": {
          "type": "basicCard",
          "items": [{
            "title": mainInfo.title,
            "description": mainInfo.description,
            "thumbnail": {
              "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/event/${mainInfo.thumbnail}`)
            },
            "buttons": defaultObj.andamiroMainQuickReplies
          }]
        }
      }
  
      info.forEach((el) => {
        message.template.outputs[0].carousel.items.push({
          "title": el.title,
          "description": el.description,
          "thumbnail": {
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/mainInfo/${el.thumbnail}`)
          },
          "buttons": [{
            "action": "block",
            "label": "메뉴 📋",
            "messageText": "메뉴보기",
            "blockId": "5d5158b3b617ea0001e60295",
            "extra" : {
              "id": el.id
            }
          }
          // , {
          //   "action": "block",
          //   "label": "위치안내",
          //   "messageText": "위치안내",
          //   "blockId": "5c44925e05aaa77182ac0e12"
          // }
        ]
        });
      })
      return res.json(message)

    })
  });
});

module.exports = router;