var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  let andamiroMainQuickReplies = defaultObj.andamiroMainQuickReplies.slice();
  andamiroMainQuickReplies.splice(1, 1)

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해 주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.andamiroQuickReplies.concat(andamiroMainQuickReplies))
    }
  };

  var sql = `SELECT * FROM andamiro_faq ORDER BY faqorder`

  conn.query(sql, (err, rows) => {
    if (err) {
      console.log(err);
      return res.json(message);
    }

    rows.forEach((el, idx) => {
      if (!message.template.outputs[el.col] || (message.template.outputs[el.col] && !message.template.outputs[el.col].carousel))
        message.template.outputs[el.col] = {
          "carousel": {
            "type": "basicCard",
            "items": []
          }
        }

      message.template.outputs[el.col].carousel.items[el.faqorder - 1] = {
        "title": `Q. ${el.question}`,
        "buttons": [{
          "action": "block",
          "label": "답변보기 💡",
          "messageText": el.question,
          "blockId": "5d51659a8192ac0001b44f6b",
          "extra": {
            "answer": el
          }
        }]
      };
    })
    return res.json(message)
  });
});

router.post('/result', (req, res) => {
  let andamiroMainQuickReplies = defaultObj.andamiroMainQuickReplies.slice();
  andamiroMainQuickReplies.splice(1, 1)

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [],
      "quickReplies": defaultObj.Qu.concat(defaultObj.andamiroQuickReplies.concat(andamiroMainQuickReplies))
    }
  };


  let answer = req.body.action.clientExtra.answer;

  console.log(answer);
  

  if (answer.img)
    message.template.outputs.push({
      "simpleImage": {
        "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/faq/${answer.img}`),
        "altText": answer.answer
      }
    })

  message.template.outputs.push({
    "simpleText": {
      "text": `A. ${answer.answer}`
    }
  })

  if (answer.url || answer.phone){
    message.template.outputs.push({
      "basicCard": {
        "title": "아래의 버튼을 눌러서 더 자세히 알아보세요!",
        "buttons": []
      }
    })
    if(answer.url)
      message.template.outputs[message.template.outputs.length - 1].basicCard.buttons.push({
        "action": "webLink",
        "label": "자세히보기 🌐",
        "webLinkUrl": answer.url
      })
    
    if(answer.phone)
      message.template.outputs[message.template.outputs.length - 1].basicCard.buttons.push({
        "action": "phone",
        "label": "전화 ☎️",
        "phoneNumber": answer.phone
      })
    
  }
  
  return res.json(message);

});


module.exports = router;