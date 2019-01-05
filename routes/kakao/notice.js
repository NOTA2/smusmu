module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var app = require('../../app.js');
  var route = require('express').Router();
  const fs = require('fs');
  var cNoticeContents = require('../../crawling/crawling_Notice_Contents');
  var cNotice = require('../../crawling/crawling_Notice');
  var deasync = require('deasync');

  route.post('', function (req, res) {
    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '검색결과를 찾을 수 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu.concat([{
          "label": '공지사항 검색하기',
          "action": "block",
          "messageText": '공지사항 검색하기',
          "blockId": "5c279735384c5518d11fd216"
        },{
          "label": '최근 공지사항',
          "action": "block",
          "messageText": '최근 공지사항',
          "blockId": "5c27971b384c5518d11fd210"
        }])
      }
    };

    try {
      var keyword = req.body.action.detailParams.keyword.value;
    } catch (e) {
      var keyword = ''
    }

    try {
      var page = parseInt(JSON.parse(req.body.action.detailParams.page.value).amount);
      console.log(req.body.action.detailParams);
    } catch (e) {
      var page = 1;
    }

    cNotice.search(keyword, page)
      .then(resultList => {
        if (resultList != 'false') {
          message.template.outputs[0] = {
            "carousel": {
              "type": "basicCard",
              "items": []
            }
          }
          resultList.forEach((el) => {
            message.template.outputs[0].carousel.items.push({
              "title": el.title,
              "description": el.desc,
              "thumbnail": {
                "imageUrl": 'http://' + defaultObj.ipadd + '/test.png'
              },
              "buttons": [{
                  "action": "webLink",
                  "label": "홈페이지에서 확인",
                  "webLinkUrl": el.src
                }
                // ,
                // {
                //   "label": '스뮤스뮤에서 확인',
                //   "action": "block",
                //   "messageText": el.src,
                //   "blockId": "5c3061135f38dd44d86a2710"
                // }
              ]
            });
          });
          if (keyword.length == 0) {
            message.template.quickReplies[1] = {
              "label": '공지사항 ' + (page + 1) + '페이지',
              "action": "message",
              "messageText": '공지사항 ' + (page + 1) + '페이지'
            };
          }
        }

        return res.json(message);
      });
  });

  route.post('/result', (req, res) => {
    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '검색결과를 찾을 수 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu
      }
    };
    var url = req.body.userRequest.utterance;
    // var url = req.body.action.detailParams.a.value;

    cNoticeContents.search(url)
      .then(result => {
        if(result){
          message.template.outputs[0] = {
            "simpleText": {
              "text": result.str
            }
          }
          if (result.img) {
            message.template.outputs[1] = {
              "simpleImage": {
                "imageUrl": result.img,
                "altText": "공지사항 게시글"
              }
            }
          }
        }

        res.json(message);
      });
  });

  return route;
}