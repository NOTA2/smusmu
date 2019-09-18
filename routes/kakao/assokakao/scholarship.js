var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해 주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.assokakaoQuickReplies.slice(1,2))
    }
  };

  var sql = `SELECT * FROM scholarship ORDER BY scholarshiporder`;


  conn.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.json(message);
    }

    if (rows.length > 0) {
      message.template.outputs[0] = {
        "carousel": {
          "type": "basicCard",
          "items": []
        }
      }

      rows.forEach((el, idx) => {
        
        message.template.outputs[0].carousel.items.push({
          "title": el.title,
          "description": el.description,
          "thumbnail": {
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/scholarship/${el.thumbnail}`),
            "link": {
              "web": encodeURI(`http://${defaultObj.ipadd}/img/scholarship/${el.thumbnail}`)
            },
            "fixedRatio": true,
            "width": 800,
            "height": 800
          },
          "buttons": [{
            "action": "block",
            "label": "자세히 보기 ✔️",
            "messageText": el.title,
            "blockId": "5d81b530b617ea0001e16fd5",
            "extra": {
              "scholarship": el
            }
          }]
        })
        
        if (!el.title)
          delete message.template.outputs[0].carousel.items[idx].title
        if (!el.description)
          delete message.template.outputs[0].carousel.items[idx].description
        if (!el.thumbnail)
          delete message.template.outputs[0].carousel.items[idx].thumbnail
      })

    } else {
      message.template.outputs[0].simpleText.text = "현재 등록된 장학금 정보가 없스뮤 😔"
    }
    
    return res.json(message)
  });
});

router.post('/result', (req, res) => {

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [],
      "quickReplies": defaultObj.Qu.concat(defaultObj.assokakaoQuickReplies)
    }
  };

  let scholarship = req.body.action.clientExtra.scholarship;

  if (scholarship.thumbnail)
    message.template.outputs.push({
      "simpleImage": {
        "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/scholarship/${scholarship.thumbnail}`),
        "altText": scholarship.thumbnail
      }
    })

  message.template.outputs.push({
    "simpleText": {
      "text": scholarship.content
    }
  })

  if (JSON.parse(scholarship.buttons).length > 0)
    message.template.outputs.push({
      "basicCard": {
        "title": "아래의 버튼을 눌러서 더 자세히 알아보세요!",
        "buttons": JSON.parse(scholarship.buttons)
      }
    })
    
  return res.json(message);
})

module.exports = router;