var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  const kakaoId = req.body.userRequest.user.id;
  const content = req.body.action.detailParams.customer.value;
  let andamiroMainQuickReplies = defaultObj.andamiroMainQuickReplies.slice();
  andamiroMainQuickReplies.splice(2, 1)

  var message = {
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

  var sql = `INSERT INTO
            andamiro_voc(content, vocdate, uId) 
            VALUES (?, now(), (SELECT id FROM users WHERE kakaoId=?))`;

  conn.query(sql,[content, kakaoId], (err, rows) => {
    if (err) {
      console.log(err);
      return res.json(message);
    }

    message.template.outputs[0].simpleText.text = '접수완료! 😉 최대한 빠르게 개선해 나갈게요! 🙌'
    
    res.json(message);
  });
});

module.exports = router;