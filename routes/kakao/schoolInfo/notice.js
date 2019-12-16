var defaultObj = require('../../../config/defaultVariable');
const conn = require('../../../config/db');
var router = require('express').Router();
var cNoticeContents = require('../../../crawling/crawling_Notice_Contents');
var cNotice = require('../../../crawling/crawling_Notice');

router.post('', (req, res) => {
  const kakaoId = req.body.userRequest.user.id;
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '검색결과를 찾을 수 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.noticeQuickReplies)
    }
  };

  var im = false; //중요 공지사항
  var major = {
    "state": false,
    "homepage": null
  }; //학과 공지사항

  try { //검색하기 였을때
    var keyword = req.body.action.detailParams.keyword.value;
  } catch (e) {
    var keyword = ''
  }

  try {
    var page = parseInt(JSON.parse(req.body.action.detailParams.page.value).amount);
  } catch (e) {
    var page = 1;
  }

  if (req.body.action.detailParams.import != undefined)
    im = true;
  if (req.body.action.detailParams.major != undefined)
    major.state = true;

  let sql = `SELECT kakaoId, name, major, homepage, token
    FROM users, major 
    where kakaoId=? AND majorId=major.id`

  conn.query(sql, [kakaoId], (err, rows) => {
    if (rows.length > 0)
      major.homepage = rows[0].homepage

    cNotice.search(keyword, page, im, major)
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
                  "label": "홈페이지에서 확인 🌐",
                  "webLinkUrl": el.src
                },
                {
                  "label": '스뮤스뮤에서 확인 👇',
                  "action": "block",
                  "messageText": el.title,
                  "extra": {
                    "id": el.src.split('?mode=view&')[1]
                  },
                  "blockId": "5c3061135f38dd44d86a2710"
                }
              ]
            });
            if (major.state) {
              let items = message.template.outputs[0].carousel.items;
              items[items.length - 1].buttons[1].extra.major = major;
            }
          });


          if (im) {
            message.template.quickReplies[1] = {
              "label": (page + 1) + ' 페이지',
              "action": "message",
              "messageText": '주요 공지사항 ' + (page + 1) + '페이지'
            };
          } else if (keyword.length == 0) {
            message.template.quickReplies[2] = {
              "label": (page + 1) + ' 페이지',
              "action": "message",
              "messageText": '최근 공지사항 ' + (page + 1) + '페이지'
            };
            let temp = message.template.quickReplies;
            [temp[1], temp[2]] = [temp[2], temp[1]];
          }
        }
        if (major.state) {
          if (resultList == 'false')
            message.template.quickReplies[1].label = '학과 ' + message.template.quickReplies[1].label.replace('학과 ', '');
          message.template.quickReplies[1].messageText = '학과 ' + message.template.quickReplies[1].messageText.replace('학과 ', '');

          message.template.quickReplies[2].label = '학과 ' + message.template.quickReplies[2].label.replace('학과 ', '');
          message.template.quickReplies[2].messageText = '학과 ' + message.template.quickReplies[2].messageText.replace('학과 ', '');

          message.template.quickReplies[3].label = '학과 ' + message.template.quickReplies[3].label.replace('학과 ', '');
          message.template.quickReplies[3].messageText = '학과 ' + message.template.quickReplies[3].messageText.replace('학과 ', '');
        }
        return res.json(message);
      });
  })
});

router.post('/result', (req, res) => {
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '결과를 찾을 수 업스뮤 😔 다시 시도해주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.noticeQuickReplies)
    }
  };
  let url = `http://www.smu.ac.kr/lounge/notice/notice.do?mode=view&${req.body.action.clientExtra.id}`;
  let major = req.body.action.clientExtra.major;

  if (major && major.state) {
    url = `https://www.smu.ac.kr/${major.homepage}/community/notice.do?mode=view&${req.body.action.clientExtra.id}`

    message.template.quickReplies[1].label = '학과 ' + message.template.quickReplies[1].label.replace('학과 ', '');
    message.template.quickReplies[1].messageText = '학과 ' + message.template.quickReplies[1].messageText.replace('학과 ', '');

    message.template.quickReplies[2].label = '학과 ' + message.template.quickReplies[2].label.replace('학과 ', '');
    message.template.quickReplies[2].messageText = '학과 ' + message.template.quickReplies[2].messageText.replace('학과 ', '');

    message.template.quickReplies[3].label = '학과 ' + message.template.quickReplies[3].label.replace('학과 ', '');
    message.template.quickReplies[3].messageText = '학과 ' + message.template.quickReplies[3].messageText.replace('학과 ', '');

  }
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
          "simpleText": {
            "text": result.str
          }
        }
      }

      res.json(message);
    });
});

module.exports = router;