const defaultObj = require('../../../config/defaultVariable');
const router = require('express').Router();
const conn = require('../../../config/db');
require('date-utils');

router.post('', function (req, res) {
  var temp = defaultObj.Qu.slice();
  temp[1] = {
    "label": 'QR코드 인식',
    "action": "block",
    "messageText": 'QR코드 인식',
    "blockId": "5dad764fffa7480001db37ac"
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

    if (rows.length > 0) { //등록이 되어 있다면
      var user = rows[0];
      var code = JSON.parse(req.body.action.detailParams.smyouth.value).barcodeData;
      code = code.split("https://smusmu.co.kr/commu/circle?code=")[1];

      sql = `select * from circles where code=?`

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
            sql = `SELECT * FROM circlesstatus WHERE fid=? AND uid=?`

            conn.query(sql, [event.id, user.id], (err, rows) => {
              if (err) {
                message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                return res.json(message);
              }

              if (rows.length > 0) { //이미 행사에 참여한 경우
                message.template.outputs[0] = {
                  "basicCard": {
                    "title": "이미 참여한 행사에요! 이제 다른 행사에 참여해봐요! 😄"
                    // ,
                    // "buttons": [{
                    //   "action": "webLink",
                    //   "label": "오늘의 행사 확인하기",
                    //   "webLinkUrl": `${homepage}/commu/festival/circles/today?kakaoId=${kakaoId}`
                    // }]
                  }
                }

                return res.json(message);

              } else { ///행사 참여 정상적인 상황
                sql = `insert INTO circlesstatus(fid, uid, onTime, survey) values(?, ?, now(), NULL)`

                conn.query(sql, [event.id, user.id], (err, rows) => {
                  if (err) {
                    console.log(err)
                    message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                    return res.json(message);
                  }

                  sql = `select sum(point) AS sumpoint, count(circlesstatus.survey) AS surveycount
                  from circlesstatus
                  LEFT JOIN circles ON circles.id=circlesstatus.fid
                  WHERE uid = ?`


                  conn.query(sql, [user.id], (err, rows) => {
                    if (err) {
                      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
                      return res.json(message);
                    }

                    let sumpoint = rows[0].sumpoint;
                    let surveycount = rows[0].surveycount;
                    

                    sumpoint = sumpoint + (surveycount * 15);

                    message.template.outputs[0].simpleText.text = `${event.point}점 획득! 현재까지 총 ${sumpoint}점을 획득하였습니다`;

                    if (event.eventName == "사슴을 찾아라!")
                      message.template.outputs[0].simpleText.text = `사슴을 찾았슴우! ${event.point}점을 획득했습니다!`

                    message.template.outputs[1] = {
                      "basicCard": {
                        "title": "점수 확인 버튼을 눌러 나의 등수를 확인해보세요!",
                        "buttons": [{
                          "action": "webLink",
                          "label": "내 점수 확인",
                          "webLinkUrl": `${homepage}/commu/festival/circles?kakaoId=${kakaoId}`
                        }]
                      }
                    }
                    //설문조사 해당 행사에 참여한 경우
                    if (event.survey) {
                      message.template.outputs[2] ={
                        simpleText : {
                          text : `동화제 행사에 대한 설문조사입니다.\n설문조사를 해주시면 15점을 추가로 드립니다!\n현재 참여한 동아리 행사에 만족하시나요? (매우 만족 5점, 만족 4점, 보통 3점, 불만족 2점, 매우 불만족 1점)`
                        }
                      }
                      message.template.quickReplies = [{
                        "label": "5",
                        "action": "block",
                        "messageText": "설문조사 완료",
                        "blockId": "5dad7b008192ac000115cfe3",
                        "extra": {
                          "userId": user.id,
                          "eventId": event.id,
                          "survey": 5
                        }
                      }, {
                        "label": "4",
                        "action": "block",
                        "messageText": "설문조사 완료",
                        "blockId": "5dad7b008192ac000115cfe3",
                        "extra": {
                          "userId": user.id,
                          "eventId": event.id,
                          "survey": 4
                        }
                      }, {
                        "label": "3",
                        "action": "block",
                        "messageText": "설문조사 완료",
                        "blockId": "5dad7b008192ac000115cfe3",
                        "extra": {
                          "userId": user.id,
                          "eventId": event.id,
                          "survey": 3
                        }
                      }, {
                        "label": "2",
                        "action": "block",
                        "messageText": "설문조사 완료",
                        "blockId": "5dad7b008192ac000115cfe3",
                        "extra": {
                          "userId": user.id,
                          "eventId": event.id,
                          "survey": 2
                        }
                      }, {
                        "label": "1",
                        "action": "block",
                        "messageText": "설문조사 완료",
                        "blockId": "5dad7b008192ac000115cfe3",
                        "extra": {
                          "userId": user.id,
                          "eventId": event.id,
                          "survey": 1
                        }
                      }, defaultObj.Qu.slice()[0], {
                        "label": 'QR코드 인식',
                        "action": "block",
                        "messageText": 'QR코드 인식',
                        "blockId": "5dad764fffa7480001db37ac"
                      }]
                    }
                    return res.json(message);
                  })
                })
              }
            })

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
          message.template.outputs[0].simpleText.text = '해당 QR코드는 동화제용 QR코드가 아닙니다. 다시 시도하거나 올바른 QR코드를 인식해 주세요.'
          return res.json(message);
        }

      })
    } else { //등록이 안되어 있는경우
      temp[1] = defaultObj.homeQuickReplies[1];
      message.template.quickReplies = temp;
      return res.json(message);
    }
  });
});

router.post('/survey', (req, res) => {
  let extra = req.body.action.clientExtra;

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [],
      "quickReplies": [{
        "label": "다시 시도",
        "action": "block",
        "messageText": "다시 시도",
        "blockId": "5dad7b008192ac000115cfe3",
        "extra": {
          "userId": extra.userId,
          "eventId": extra.eventId,
          "survey": extra.survey
        }
      }]
    }
  };

  let sql = `SELECT * FROM circlesstatus WHERE fid=? AND uid=?`

  conn.query(sql, [extra.eventId, extra.userId], (err, rows) => {
    if (err) {
      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (아래 버튼을 다시 눌러주세요)'
      return res.json(message);
    }

    if (rows[0].survey) { //이미 설문조사 참여를 한 경우
      message.template.outputs[0].simpleText.text = '이미 설문조사를 하셨어요! 다른 행사에 참여해 주세요!'
      return res.json(message);
    } else {
      sql = `UPDATE circlesstatus SET survey = ? WHERE id =?`

      conn.query(sql, [extra.survey, rows[0].id], (err, rows) => {
        if (err) {
          message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔 (QR코드 인식 버튼을 다시 눌러주세요)'
          return res.json(message);
        }

        message.template.outputs[0] = {
          simpleText : {
            text : `설문조사에 응해주셔서 감사합니다. 추가로 점수 15점을 획득하셨습니다!`
          }
        }

        
        message.template.quickReplies = defaultObj.Qu.slice().concat([{
          "label": 'QR코드 인식',
          "action": "block",
          "messageText": 'QR코드 인식',
          "blockId": "5dad764fffa7480001db37ac"
        }])

        return res.json(message);
      })
    }
  })

})

module.exports = router;