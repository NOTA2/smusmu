var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  let andamiroMainQuickReplies = defaultObj.andamiroMainQuickReplies.slice();
  andamiroMainQuickReplies.splice(0, 1);

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해 주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.andamiroQuickReplies.concat(defaultObj.andamiroMainQuickReplies))
    }
  };

  var sql = `SELECT * FROM andamiro_event ORDER BY eventorder`;


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
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/event/${el.thumbnail}`),
            "link": {
              "web": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/event/${el.thumbnail}`)
            },
            "fixedRatio": true,
            "width": 800,
            "height": 800
          },
          "buttons": [{
            "action": "block",
            "label": "자세히 보기",
            "blockId": "5d7c9003b617ea0001c1bff8",
            "extra": {
              "event": el
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
      message.template.outputs[0].simpleText.text = "현재 진행중인 이벤트가 없스뮤 😔"
    }
    
    return res.json(message)
  });
});

router.post('/result', (req, res) => {

  let andamiroMainQuickReplies = defaultObj.andamiroMainQuickReplies.slice();
  andamiroMainQuickReplies.splice(0, 1);

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [],
      "quickReplies": defaultObj.Qu.concat(defaultObj.andamiroQuickReplies.concat(defaultObj.andamiroMainQuickReplies))
    }
  };

  let event = req.body.action.clientExtra.event;

  if (event.thumbnail)
    message.template.outputs.push({
      "simpleImage": {
        "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/event/${event.thumbnail}`),
        "altText": event.thumbnail
      }
    })

  message.template.outputs.push({
    "simpleText": {
      "text": event.content
    }
  })

  if (JSON.parse(event.buttons).length > 0)
    message.template.outputs.push({
      "basicCard": {
        "title": "아래의 버튼을 눌러서 더 자세히 알아보세요!",
        "buttons": JSON.parse(event.buttons)
      }
    })
    
  return res.json(message);
})

module.exports = router;