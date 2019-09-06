var router = require('express').Router();
var defaultObj = require('../../../config/defaultVariable');
var cProfessor = require('../../../crawling/crawling_professor');


router.post('', (req, res) => {
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '검색결과를 찾을 수 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.schoolQuickReplies)
    }
  };
  var keyword = req.body.action.detailParams.professor_keyword.value;

  cProfessor.search(keyword)
    .then(result => {
      if (result.length > 0) {
        message.template.outputs[0].simpleText.text = "최대 10개의 검색결과가 나타납니다."
        message.template.outputs[1] = {
          "carousel": {
            "type": "basicCard",
            "items": []
          }
        }
        message.template.outputs[2] = {
          "simpleText": {
            "text": '다시 교수 검색을 하려면 아래의 [교수검색] 버튼을 눌러주세요!\n일반 학교정보를 검색을 하려면 그냥 카톡해주세요!'
          }
        }

        result.forEach((el, idx) => {
          message.template.outputs[1].carousel.items[idx] = {
            "title": `${el.name}\n${el.position}\n${el.office}`,
            //"description": `${el.position}\n${el.office}`,
            "buttons": [{
              "action": "phone",
              "label": "사무실 전화 ☎️",
              "phoneNumber": el.phone
            },{
              "action": "webLink",
              "label": "이메일 보내기 📧",
              "webLinkUrl": el.mail
            }]
          }
          if (el.homepage) {
            message.template.outputs[1].carousel.items[idx].buttons.push({
              "action": "webLink",
              "label": "홈페이지 🌐",
              "webLinkUrl": el.homepage
            })
          }
        })
      }

      return res.json(message);
    })
})

module.exports = router;