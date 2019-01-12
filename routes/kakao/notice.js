module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var cNoticeContents = require('../../crawling/crawling_Notice_Contents');
  var cNotice = require('../../crawling/crawling_Notice');

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
          "label": '최근 공지사항',
          "action": "block",
          "messageText": '최근 공지사항',
          "blockId": "5c27971b384c5518d11fd210"
        }, {
          "label": '공지사항 검색하기',
          "action": "block",
          "messageText": '공지사항 검색하기',
          "blockId": "5c279735384c5518d11fd216"
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
              "buttons": [{
                  "action": "webLink",
                  "label": "홈페이지에서 확인",
                  "webLinkUrl": el.src
                },
                {
                  "label": '스뮤스뮤에서 확인',
                  "action": "block",
                  "messageText": el.src.split('?mode=view&')[1],
                  "blockId": "5c3061135f38dd44d86a2710"
                }
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
            "text": '결과를 찾을 수 업스뮤 😔 다시 시도해주세요!'
          }
        }],
        "quickReplies": defaultObj.Qu.concat([{
          "label": '최근 공지사항',
          "action": "block",
          "messageText": '최근 공지사항',
          "blockId": "5c27971b384c5518d11fd210"
        }, {
          "label": '공지사항 검색하기',
          "action": "block",
          "messageText": '공지사항 검색하기',
          "blockId": "5c279735384c5518d11fd216"
        }])
      }
    };
    var url = 'http://www.smu.ac.kr/lounge/notice/notice.do?mode=view&' + req.body.userRequest.utterance;

    cNoticeContents.search(url)
      .then(result => {
        if (result) {
          var idx = 0;
          if (result.img) {
            message.template.outputs[idx] = {
              "simpleImage": {
                "imageUrl": result.img,
                "altText": "공지사항 게시글"
              }
            };
            idx++;
          }
          message.template.outputs[idx] = {
            "basicCard": {
              "title": result.str,
              "buttons": [{
                "action": "webLink",
                "label": "홈페이지에서 확인",
                "webLinkUrl": url
              }]
            }
          };
        }
        res.json(message);
      });
  });

  return route;
}