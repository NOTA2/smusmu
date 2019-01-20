var conn = require('../../config/db')();

module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();

  route.post('/', (req, res) => {
    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '검색결과가 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu
      }
    };

    var content = req.body.action.detailParams;
    var keyword;
    
    try {
      if(content.school_place)
        keyword = content.school_place.value;
      else if(content.eat_place)
        keyword = content.eat_place.value;

      var sql = "SELECT keyword,phoneNumber,faxNumber,img,explanation FROM schoolInfo WHERE keyword LIKE ('%" + keyword + "%')"

      conn.query(sql, function (err, rows) {
        if (err) {
          console.log(err);
          message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
          return res.json(message);
        }
        if (rows.length > 0) {
          message.template.outputs[0] = {
            "carousel": {
              "type": "basicCard",
              "items": []
            }
          };

          rows.forEach(function (el, idx) {
            if(content.call && el.phoneNumber == null){
              return;
            }

            message.template.outputs[0].carousel.items[idx] = new Object();
            var str = '[' + el.keyword + ']\n' + el.explanation
            message.template.outputs[0].carousel.items[idx].title = str

            if (el.img) {
              message.template.outputs[0].carousel.items[idx].thumbnail = {
                "imageUrl": 'http://' + defaultObj.ipadd + '/mapimg/' + el.img + '2.png'
              };
              message.template.outputs[0].carousel.items[idx].buttons = [{
                "action": "webLink",
                "label": "지도 크게보기",
                "webLinkUrl": 'http://' + defaultObj.ipadd + '/mapimg/' + el.img + '1.png'
              }];
            }

            if (el.phoneNumber) {
              if(message.template.outputs[0].carousel.items[idx].buttons.length > 0){
                message.template.outputs[0].carousel.items[idx].buttons.push({
                  "action": "phone",
                  "label": "전화하기",
                  "phoneNumber": el.phoneNumber
                });
              } else{
                message.template.outputs[0].carousel.items[idx].buttons = [{
                  "action": "phone",
                  "label": "전화하기",
                  "phoneNumber": el.phoneNumber
                }];
              }
            }

            if (el.faxNumber) {
              if(message.template.outputs[0].carousel.items[idx].buttons.length > 0){
                message.template.outputs[0].carousel.items[idx].buttons.push({
                  "action": "phone",
                  "label": "FAX 번호 복사하기",
                  "phoneNumber": el.faxNumber
                });
              } else{
                message.template.outputs[0].carousel.items[idx].buttons = [{
                  "action": "phone",
                  "label": "FAX 번호 복사하기",
                  "phoneNumber": el.faxNumber
                }];
              }
            }
          });

          if(message.template.outputs[0].carousel.items.length == 0){
            message.template.outputs[0] = {
              "simpleText": {
                "text": '검색결과가 업스뮤 😔'
              }
            };
          }

        }
        return res.json(message);
      })
    } catch (e) {
      console.log(e);
      return res.json(message);
    }
  });
  return route;
};