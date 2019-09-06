const defaultObj = require('../../../config/defaultVariable');
const router = require('express').Router();
const conn = require('../../../config/db');

router.post('', function (req, res) {
  var kakaoId = req.body.userRequest.user.id;
  var url = `https://smusmu.co.kr/auth/register/commu?kakaoId=${kakaoId}`
  if (defaultObj.ipadd == '54.180.122.96')
    url = `http://${defaultObj.ipadd}/auth/register/commu?kakaoId=${kakaoId}`
  
  message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "basicCard": {
          "title": "등록하기",
          "description": "스뮤스뮤 웹 사이트에 등록 후 사용하면 더욱 편하고 많은 기능을 사용할 수 있어요!",
          "thumbnail": {
            "imageUrl": `http://${defaultObj.ipadd}/img/function/register.png`
          },
          "buttons": [{
            "label": "등록 📝",
            "action": "webLink",
            "webLinkUrl": url
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
      
      if(rows[0].token != 'true'){
        message.template.outputs[0] = {
          "basicCard": {
            "title": '학교 메일인증을 아직 안했스뮤!',
            "buttons": [{
              "label": "이메일 확인 📫",
              "action": "webLink",
              "webLinkUrl": 'https://outlook.office365.com/owa/?realm=sangmyung.kr&exsvurl=1&ll-cc=1042&modurl=0'
            }]
          }
        };
      
      }
      else{
        message.template.outputs[0] = {
          "basicCard": {
            "title": '이미 등록되어 있스뮤!!',
            "buttons": [{
              "label": "스뮤스뮤 커뮤니티 🌐",
              "action": "webLink",
              "webLinkUrl": 'https://smusmu.co.kr'
            }]
          }
        };
      }
    }
    

    return res.json(message);
  })
});

module.exports = router;