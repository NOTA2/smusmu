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

  var sql = `SELECT * FROM andamiro_event`


  conn.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.json(message);
    }

    message = {
      "version": "2.0",
      "template": {
        "outputs": [],
        "quickReplies": defaultObj.Qu.concat(defaultObj.andamiroQuickReplies.concat(andamiroMainQuickReplies))
      }
    };

    let event = rows[0]

    if (event.img)
      message.template.outputs.push({
        "simpleImage": {
          "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/event/${event.img}`),
          "altText": event.content
        }
      })

    if (event.content)
      message.template.outputs.push({
        "simpleText": {
          "text": event.content
        }
      })

    if (event.buttons)
      message.template.outputs.push({
        "basicCard": {
          "title": "아래의 버튼을 눌러서 더 자세히 알아보세요!",
          "buttons": JSON.parse(event.buttons)
        }
      })

    return res.json(message)
  });
});

module.exports = router;