module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../../config/db')();

  route.post('', function (req, res) {
    var dt = new Date();
    var time = parseInt(dt.toFormat("HH"));

    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '아직 집회정보가 없스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu
      }
    };

    if(time>8)
      message.template.outputs[0].simpleText.text = '오늘은 집회가 없스뮤!😉'
    

    //모든 정보가 다 있는 경우
    if (defaultObj.seoulAssemblyResult.detail.length > 0 && defaultObj.seoulAssemblyResult.twitter.length > 0) {
      message = {
        "version": "2.0",
        "template": {
          "outputs": [{
            "carousel": {
              "type": "basicCard",
              "items": []
            }
          }],
          "quickReplies": defaultObj.Qu
        }
      };

      var title;
      var desc;
      var cardImgUrl;

      defaultObj.seoulAssemblyResult.twitter.forEach(el => {
        message.template.outputs.unshift({
          "simpleText": {
            "text": el.str
          }
        });
      });

      var carouselIdx = message.template.outputs.length - 1

      defaultObj.seoulAssemblyResult.twitter.forEach(el => {
        if (el.str.indexOf('집회') != -1 || el.str.indexOf('집 회') != -1) {
          title = '집회정보 이미지로 확인하기';
          desc = '집회정보를 이미지로 확인하세요!';
        } else {
          title = '공사정보 이미지로 확인하기';
          desc = '공사정보를 이미지로 확인하세요!';
        }
        message.template.outputs[carouselIdx].carousel.items.unshift({
          "title": title,
          "description": desc,
          "thumbnail": {
            "imageUrl": el.buttonUrl
          },
          "buttons": [{
            "label": "큰 이미지로 확인하기",
            "action": "webLink",
            "webLinkUrl": el.buttonUrl
          }]
        });
      })

      /////경찰청 정보 추가
      var detailbuttons = new Array();

      defaultObj.seoulAssemblyResult.detail.forEach((url, idx) => {
        detailbuttons[idx] = {
          "label": "서울지방 경찰청 정보 " + (idx + 1),
          "action": "webLink",
          "webLinkUrl": url
        }
      });
      var i = message.template.outputs[carouselIdx].carousel.items.length;
      message.template.outputs[carouselIdx].carousel.items[i] = {
        "title": "서울지방 경찰청의 정보",
        "description": "더 자세한 집회 정보는 서울지방 경찰청의 정보로 확인하스뮤!",
        "thumbnail": {
          "imageUrl": defaultObj.seoulAssemblyResult.detail[0]
        },
        "buttons": detailbuttons
      };
    }
    //서울지방 경찰청의 정보만 있는 경우
    else if (defaultObj.seoulAssemblyResult.detail.length > 0) {
      var detailbuttons = new Array();

      defaultObj.seoulAssemblyResult.detail.forEach((url, idx) => {
        detailbuttons[idx] = {
          "label": "서울지방 경찰청 정보 " + (idx + 1),
          "action": "webLink",
          "webLinkUrl": url
        }
      });

      message = {
        "version": "2.0",
        "template": {
          "outputs": [{
            "basicCard": {
              "title": "서울지방 경찰청의 정보",
              "description": "아직 자세한 집회정보가 없스뮤 😔\n서울지방 경찰청의 정보 확인하스뮤!",
              "thumbnail": {
                "imageUrl": defaultObj.seoulAssemblyResult.detail[0]
              },
              "buttons": detailbuttons
            }
          }],
          "quickReplies": defaultObj.Qu
        }
      };

      if(time>8)
        message.template.outputs[0].basicCard.description = "오늘은 자세한 집회정보가 없스뮤 😔\n서울지방 경찰청의 정보를 확인하스뮤!"

    } else { //트위터 정보만 있는 경우.
      message = {
        "version": "2.0",
        "template": {
          "outputs": [{
            "carousel": {
              "type": "basicCard",
              "items": []
            }
          }],
          "quickReplies": defaultObj.Qu
        }
      };

      var title;
      var desc;
      var cardImgUrl;

      defaultObj.seoulAssemblyResult.twitter.forEach(el => {
        message.template.outputs.unshift({
          "simpleText": {
            "text": el.str
          }
        });
      });

      var carouselIdx = message.template.outputs.length - 1

      defaultObj.seoulAssemblyResult.twitter.forEach(el => {
        if (el.str.indexOf('공사') != -1 || el.str.indexOf('공 사') != -1) {
          title = '공사정보 이미지로 확인하기';
          desc = '공사정보를 이미지로 확인하세요!';
        } else {
          title = '집회(행사)정보 이미지로 확인하기';
          desc = '집회(행사)정보를 이미지로 확인하세요!';
        }

        message.template.outputs[carouselIdx].carousel.items.unshift({
          "title": title,
          "description": desc,
          "thumbnail": {
            "imageUrl": el.buttonUrl
          },
          "buttons": [{
            "label": "큰 이미지로 확인하기",
            "action": "webLink",
            "webLinkUrl": el.buttonUrl
          }]
        });
      })
    }

    res.json(message);
  });


  return route;
}