var conn = require('../../../config/db')();


var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '검색결과를 찾을 수 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu
    }
  };
  var outputsIdx = -1;

  var sql = 'SELECT * FROM FoodMenu';

  conn.query(sql, (err, rows) => {
    if (err) {
      console.err(err);
      return res.json(message);
    }
    rows = JSON.parse(JSON.stringify(rows))

    if (rows.length > 0) {
      rows.forEach((el, idx) => {
        if (idx % 5 == 0) {
          outputsIdx++;
          message.template.outputs[outputsIdx] = {
            "carousel": {
              "type": "basicCard",
              "items": []
            }
          }
        }
        message.template.outputs[outputsIdx].carousel.items.push({
          "title": el.name,
          "description": el.explanation,
          "thumbnail": {
            "imageUrl": `http://${defaultObj.ipadd}/img${el.img}`
          },
          "buttons": [{
              "action": "webLink",
              "label": "메뉴판 크게보기",
              "webLinkUrl": `http://${defaultObj.ipadd}/img${el.img}`
            },
            {
              "action": "phone",
              "label": "전화하기",
              "phoneNumber": el.phone
            }
          ]
        });
      })
    }
    res.json(message);
  });
});

module.exports = router;