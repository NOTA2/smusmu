const defaultObj = require('../../../config/defaultVariable');
const router = require('express').Router();
const conn = require('../../../config/db');
require('date-utils');

router.post('', function (req, res) {
  var temp = defaultObj.Qu;
  temp[1] = {
    "label": 'QR코드 인식',
    "action": "block",
    "messageText": 'QR코드 인식',
    "blockId": "5cb86d4905aaa7241fe0e64e"
  };
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '스뮤스뮤 등록후에 사용해주세요!'
        }
      }],
      "quickReplies": temp
    }
  };

  var homepage = 'https://smusmu.co.kr';

  if (defaultObj.ipadd == '54.180.122.96')
    homepage = 'http://54.180.122.96';


  var kakaoId = req.body.userRequest.user.id;
  var sql = 'SELECT * FROM users WHERE kakaoId=?'

  conn.query(sql, [kakaoId], function (err, rows) {
    if (err) {
      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
      return res.json(message);
    }

    if (rows.length > 0) {
      var user = rows[0];
      var code = JSON.parse(req.body.action.detailParams.smyouth.value).barcodeData;
      code = code.split("https://smusmu.co.kr/commu/festival?code=")[1];

      sql = `select * from festival where code=?`

      conn.query(sql, [code], (err, rows) => {
        if (err) {
          message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
          return res.json(message);
        }

        if (rows.length > 0) {
          var event = rows[0];
          var d = new Date();
          var today = d.toFormat("YYYY-MM-DD")

          var st = new Date(event.startTime);
          var et = new Date(event.endTime);

          if (st < d && et > d) { //행사 시간이 맞는 경우 (지금 QR코드가 유효한 상태)
            if (event.type == "학생 수익사업") { //수익사업인 경우 각 가격 구간별로 나눠져 있지만 하루에 한번만 참여가능하다.
              sql = `SELECT * 
              FROM festivalstatus
              LEFT JOIN festival ON festival.id = festivalstatus.fid
              WHERE (fid=? AND uid=?) OR (uid =? AND festival.host=? AND festival.type=? AND date_format(festival.startTime,'%Y-%m-%d')=date_format(?,'%Y-%m-%d'))`

              conn.query(sql, [event.id, user.id, user.id, event.host, '학생 수익사업',today], (err, rows) => {
                if (err) {
                  message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                  return res.json(message);
                }
                
                if (rows.length > 0) { //이미 행사에 참여한 경우(검색 결과가 있는 경우)
                  message.template.outputs[0] = {
                    "basicCard": {
                      "title": "이미 참여한 행사에요! 이제 다른 행사에 참여해봐요! 😄",
                      "buttons": [{
                        "action": "webLink",
                        "label": "오늘의 행사 확인하기",
                        "webLinkUrl": `${homepage}/commu/festival/today?kakaoId=${kakaoId}`
                      }]
                    }
                  }

                  return res.json(message);
                } else { ///행사 참여 정상적인 상황
                  sql = `insert INTO festivalstatus(fid, uid, onTime) values(?, ?, now())`

                  conn.query(sql, [event.id, user.id], (err, rows) => {
                    if (err) {
                      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                      return res.json(message);
                    }

                    message.template.outputs[0].simpleText.text = `${event.host}의 [${event.eventName}] 행사 참여 완료!\n`;
                    message.template.outputs[0].simpleText.text += `${event.point}점을 얻었어요!😆\n`;

                    message.template.outputs[1] = {
                      "basicCard": {
                        "title": "내 정보와 록록록 현황을 확인해보세요! 😄",
                        "buttons": [{
                            "action": "webLink",
                            "label": "내 정보 & 점수 확인",
                            "webLinkUrl": `${homepage}/commu/festival/myinfo?kakaoId=${kakaoId}`
                          },
                          {
                            "action": "webLink",
                            "label": "록록록 현황 확인",
                            "webLinkUrl": `${homepage}/commu/festival/now?kakaoId=${kakaoId}`
                          },{
                            "action": "webLink",
                            "label": "오늘의 행사 확인하기",
                            "webLinkUrl": `${homepage}/commu/festival/today?kakaoId=${kakaoId}`
                          }
                        ]
                      }
                    }
                    return res.json(message);
                  })
                }
              })
            } else { //나머지 행사의 경우
              sql = `SELECT * FROM festivalstatus WHERE fid=? AND uid=?`

              conn.query(sql, [event.id, user.id], (err, rows) => {
                if (err) {
                  message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                  return res.json(message);
                }

                if (rows.length > 0 && event.eventName != "윷놀이 게임 (4단계 상품)") { //이미 행사에 참여한 경우
                  message.template.outputs[0] = {
                    "basicCard": {
                      "title": "이미 참여한 행사에요! 이제 다른 행사에 참여해봐요! 😄",
                      "buttons": [{
                        "action": "webLink",
                        "label": "오늘의 행사 확인하기",
                        "webLinkUrl": `${homepage}/commu/festival/today?kakaoId=${kakaoId}`
                      }]
                    }
                  }

                  return res.json(message);
                } else { ///행사 참여 정상적인 상황
                  sql = `insert INTO festivalstatus(fid, uid, onTime) values(?, ?, now())`

                  conn.query(sql, [event.id, user.id], (err, rows) => {
                    if (err) {
                      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                      return res.json(message);
                    }

                    message.template.outputs[0].simpleText.text = `${event.host}의 [${event.eventName}] 행사 참여 완료!\n`;
                    message.template.outputs[0].simpleText.text += `${event.point}점을 얻었어요!😆\n`;

                    message.template.outputs[1] = {
                      "basicCard": {
                        "title": "내 정보와 록록록 현황을 확인해보세요! 😄",
                        "buttons": [{
                            "action": "webLink",
                            "label": "내 정보 & 점수 확인",
                            "webLinkUrl": `${homepage}/commu/festival/myinfo?kakaoId=${kakaoId}`
                          },
                          {
                            "action": "webLink",
                            "label": "록록록 현황 확인",
                            "webLinkUrl": `${homepage}/commu/festival/now?kakaoId=${kakaoId}`
                          },{
                            "action": "webLink",
                            "label": "오늘의 행사 확인하기",
                            "webLinkUrl": `${homepage}/commu/festival/today?kakaoId=${kakaoId}`
                          }
                        ]
                      }
                    }

                    return res.json(message);
                  })
                }
              })
            }
          } else { //행사시간이 아닌경우
            st.setHours(st.getHours() + 1)
            et.setHours(et.getHours() - 1)
            var stf = st.toFormat("HH24:MI");
            var etf = et.toFormat("HH24:MI");
            message.template.outputs[0].simpleText.text = `행사 시간이 아닙니다. 행사시간에 맞춰서 시도해주세요.\n\n`;
            message.template.outputs[0].simpleText.text += `[행사시간]\n${st.getDate()}일 ${stf} ~ ${etf}`

            return res.json(message);
          }
        } else { //다른 QR코드
          message.template.outputs[0].simpleText.text = '해당 QR코드는 축제용 QR코드가 아닙니다. 다시 시도하거나 올바른 QR코드를 인식해 주세요.'
          return res.json(message);
        }


      })
    } else { //등록이 안되어 있는경우
      temp[1] = {
        "label": '등록하기',
        "action": "block",
        "messageText": '등록하기',
        "blockId": "5c2efe76384c5518d11fe678"
      }
      message.template.quickReplies = temp;
      return res.json(message);
    }
  });
});

module.exports = router;