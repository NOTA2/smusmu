const defaultObj = require('../../config/defaultVariable');
const route = require('express').Router();
const conn = require('../../config/db')();

route.post('', function (req, res) {
  var kakaoId = req.body.userRequest.user.id;
  
  message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "basicCard": {
          "title": "등록하기",
          "description": "스뮤스뮤 웹 사이트에 등록 후 사용하면 더욱 편하고 많은 기능을 사용할 수 있어요!",
          "thumbnail": {
            "imageUrl": `http://${defaultObj.ipadd}/kakaoimg/register.png`
          },
          "buttons": [{
            "label": "등록하기",
            "action": "webLink",
            "webLinkUrl": `https://smusmu.co.kr/auth/register/commu?kakaoId=${kakaoId}`
          }]
        }
      }],
      "quickReplies": defaultObj.Qu
    }
  };

  conn.query('SELECT * FROM users WHERE kakaoId=?', [kakaoId], function (err, rows) {
    if (err) {
      console.log(err);
      message.template.outputs[0] = {
        "simpleText": {
          "text": '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
        }
      };
      return res.json(message);
    }
    if (rows.length > 0) {
      message.template.outputs[0] = {
        "simpleText": {
          "text": '이미 등록되어 있스뮤!'
        }
      };
    }

    console.log(rows.length);
    

    return res.json(message);
  })
});

module.exports = route;