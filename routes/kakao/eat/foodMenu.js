var conn = require('../../../config/db');
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
      "quickReplies": defaultObj.Qu.concat(defaultObj.eatQuickReplies).slice(0,3)
    }
  };
  var outputsIdx = 0;

  var sql = 'SELECT * FROM FoodMenu';

  conn.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.json(message);
    }
    rows = JSON.parse(JSON.stringify(rows))

    if (rows.length > 0) {

      message.template.outputs[0].simpleText.text = '이미지를 누르면 크게 볼 수 있습니다.'
      rows.forEach((el, idx) => {
        if (idx % 10 == 0) {
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
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/menu/${el.img}`),
            "link": {
              "web": encodeURI(`http://${defaultObj.ipadd}/img/menu/${el.img}`)
            },
            "fixedRatio": true,
            "width": 800,
            "height": 800
          },
          "buttons": [{
            "action": "phone",
            "label": "전화 ☎️",
            "phoneNumber": el.phone
          }]
        });
      })
    }
    res.json(message);
  });
});

module.exports = router;