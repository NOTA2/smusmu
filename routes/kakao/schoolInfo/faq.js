let defaultObj = require('../../../config/defaultVariable');
const conn = require('../../../config/db');
let router = require('express').Router();

router.post('', (req, res) => {
  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.faqQuickReplies.slice(1,2))
    }
  };

  let sql = `SELECT * FROM faq WHERE faq=1 OR count>20 ORDER BY count DESC`

  conn.query(sql, (err, rows) => {
    if (rows) {
      message.template.outputs[0].simpleText.text = '자주 묻는 질문들 목록입니다.🙋️\n답변보기를 통해서 상세한 답변을 얻으세요.😉'
      message.template.outputs[1] = {
        "carousel": {
          "type": "basicCard",
          "items": []
        }
      }
      rows.forEach(el => {
        message.template.outputs[1].carousel.items.push({
          "title": `Q. ${el.question}`,
          "buttons": [{
            "label": '답변보기 💡',
            "action": "block",
            "messageText": el.question,
            "extra": {
              "answer": el
            },
            "blockId": "5d68b7b6ffa7480001c1e204"
          }]
        });
      })
    }
    return res.json(message);
  })
});

router.post('/result', (req, res) => {
  let message = {
    "version": "2.0",
    "template": {
      "outputs": [],
      "quickReplies": defaultObj.Qu.concat(defaultObj.faqQuickReplies)
    }
  };


  let answer = req.body.action.clientExtra.answer;
  let sql = `UPDATE faq SET count=count+1 WHERE id=?`

  conn.query(sql, [answer.id], (err, row) => {
    if (err) {
      message.template.outputs[0] = {
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해주세요!'
        }
      }
      console.error(err);

      return res.json(message);
    }

    if (answer.img)
      message.template.outputs.push({
        "simpleImage": {
          "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/faq/${answer.img}`),
          "altText": answer.answer
        }
      })

    message.template.outputs.push({
      "simpleText": {
        "text": `A. ${answer.answer}`
      }
    })

    if (answer.url)
      message.template.outputs.push({
        "basicCard": {
          "title": "아래의 버튼을 눌러서 더 자세히 알아보세요!",
          "buttons": [
            {
              "action": "webLink",
              "label": "자세히보기 🌐",
              "webLinkUrl": answer.url
            }
          ]
        }
      })
      return res.json(message);
  })
});

module.exports = router;