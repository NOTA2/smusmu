var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();
var conn = require('../../../config/db');

router.post('', function (req, res) {
  var dt = new Date();
  var date = dt.toFormat("YYYY-MM-DD");
  var time = parseInt(dt.toFormat("HH24"));

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '아직 집회정보가 없스뮤 😔'
        }
      }]
    }
  };

  if (time > 8)
    message.template.outputs[0].simpleText.text = '오늘은 집회가 없스뮤!😉'

  var sql = 'SELECT jsondata FROM seoulAssembly WHERE date=?'

  conn.query(sql, [date], function (err, rows) {
    if (!err) {
      if (rows.length > 0) {
        var saObj = JSON.parse(rows[0].jsondata);
        ////////////////////////
        //모든 정보가 다 있는 경우
        ////////////////////////
        if (saObj.detail.length > 0 && saObj.twitter.length > 0) {
          message = {
            "version": "2.0",
            "template": {
              "outputs": [{
                "carousel": {
                  "type": "basicCard",
                  "items": []
                }
              }]
            }
          };

          var title;

          saObj.twitter.forEach(el => {
            message.template.outputs.unshift({
              "simpleText": {
                "text": el.str
              }
            });
          });

          var carouselIdx = message.template.outputs.length - 1

          saObj.twitter.forEach(el => {
            title = '이미지를 누르면 크게 볼 수 있습니다.';

            message.template.outputs[carouselIdx].carousel.items.unshift({
              "title": title,
              "thumbnail": {
                "imageUrl": el.buttonUrl,
                "link" : {
                  "web" : el.buttonUrl
                },
                "fixedRatio" : true,
                "width" : 500,
                "height" : 500
              }
            });
          })

          /////경찰청 정보 추가
          var detailbuttons = new Array();

          saObj.detail.forEach((url, idx) => {
            detailbuttons[idx] = {
              "label": "👮 서울 경찰청 정보 " + (idx + 1),
              "action": "webLink",
              "webLinkUrl": url
            }
          });
          var i = message.template.outputs[carouselIdx].carousel.items.length;
          message.template.outputs[carouselIdx].carousel.items[i] = {
            "title": "👮 서울 경찰청 정보",
            "description": "더 자세한 집회 정보는 서울지방 경찰청의 정보로 확인하스뮤!",
            "buttons": detailbuttons
          };
        }
        ////////////////////////
        //서울지방 경찰청의 정보만 있는 경우
        ////////////////////////
        else if (saObj.detail.length > 0) {
          var detailbuttons = new Array();

          saObj.detail.forEach((url, idx) => {
            detailbuttons[idx] = {
              "label": "👮 서울 경찰청 정보 " + (idx + 1),
              "action": "webLink",
              "webLinkUrl": url
            }
          });

          message = {
            "version": "2.0",
            "template": {
              "outputs": [{
                "basicCard": {
                  "title": "👮 서울 경찰청의 정보",
                  "description": "아직 자세한 집회정보가 없스뮤 😔\n서울지방 경찰청의 정보를 확인하스뮤!",
                  "buttons": detailbuttons
                }
              }]
            }
          };

          if (time > 8)
            message.template.outputs[0].basicCard.description = "오늘은 자세한 집회정보가 없스뮤 😔\n서울지방 경찰청의 정보를 확인하스뮤!"

        }
        ////////////////////////
        //트위터 정보만 있는 경우.
        ////////////////////////
        else {
          message = {
            "version": "2.0",
            "template": {
              "outputs": [{
                "carousel": {
                  "type": "basicCard",
                  "items": []
                }
              }]
            }
          };

          var title;

          saObj.twitter.forEach(el => {
            message.template.outputs.unshift({
              "simpleText": {
                "text": el.str
              }
            });
          });

          var carouselIdx = message.template.outputs.length - 1

          saObj.twitter.forEach(el => {
              title = '이미지를 누르면 크게 볼 수 있습니다.';

            message.template.outputs[carouselIdx].carousel.items.unshift({
              "title": title,
              "thumbnail": {
                "imageUrl": el.buttonUrl,
                "link" : {
                  "web" : el.buttonUrl
                },
                "fixedRatio" : true,
                "width" : 500,
                "height" : 500
              }
            });
          })
        }
      }

      message.template.quickReplies = defaultObj.Qu.concat(defaultObj.goQuickReplies.slice(1,3))
      return res.json(message);

    } else {
      console.log("query error 발생");
      message.template.outputs[0].simpleText.text = '데이터를 제대로 못 받았스뮤😔 다시 시도해주세요.'
      return res.json(message);
    };
  });
});

module.exports = router;