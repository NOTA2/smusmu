const conn = require('../../../config/db');
const defaultObj = require('../../../config/defaultVariable');
const router = require('express').Router();

router.post('', (req, res) => {
  const kakaoId = req.body.userRequest.user.id;
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '잠시 문제가 생겼어요 😔\n다시 시도해주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.homeQuickReplies)
    }
  };

  // let sql = `SELECT kakaoId, name, major, homepage, token
  //           FROM users, major 
  //           where kakaoId=? AND majorId=major.id`

  let sql = `SELECT kakaoId, name, major, homepage, token
  FROM users
  LEFT OUTER JOIN major
  ON majorId=major.id
  where kakaoId=?`

  conn.query(sql, [kakaoId], (err, rows) => {

    //user가 등록되어 있고 인증을 받은경우
    //    user = [Object]
    //user가 등록되어 있지만 인증을 받지않은 경우
    //    user = 'email'
    //user가 등록되어 있지 않은 경우
    //    user = undefined
    //user가 등록되어 있고 인증도 받았지만 학과정보가 없는경우
    //    user.major = null

    let user = rows[0];
    
    sql = `SELECT * FROM mainMenu ORDER BY menuorder`

    conn.query(sql, (err, rows) => {
      if (err || rows.length == 0) {
        console.log(err);
        return res.json(message)
      }

      message.template.quickReplies = defaultObj.homeQuickReplies

      let qrtemp = defaultObj.homeQuickReplies.slice()

      if (user && user.token != "true") { //이메일 인증만 안되어 있는 경우
        user = 'email'
      } else if (user) { //등록이 되어 있는 경우 퀵메뉴에 등록 대신 커뮤니티 추가
        qrtemp.splice(1, 1, {
          "label": "커뮤니티 🌐",
          "action": "block",
          "messageText": "커뮤니티",
          "blockId": "5cdac3f5384c5516145f11dd"
        });
        message.template.quickReplies = qrtemp
      }

      message.template.outputs[0] = {
        "carousel": {
          "type": "basicCard",
          "items": []
        }
      }

      rows.forEach((el, idx) => {

        let buttons = JSON.parse(el.buttons);

        message.template.outputs[0].carousel.items.push({
          "title": el.title,
          "description": el.description,
          "thumbnail": {
            "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/main/${el.thumbnail}`)
          },
          "buttons": buttons
        });


        ///동화제를 위한 코드
        // let btIdx = message.template.outputs[0].carousel.items[idx].buttons.findIndex(x => x.action === "webLink");
        // if(btIdx != -1){
        //   let circles = message.template.outputs[0].carousel.items[idx].buttons[btIdx].webLinkUrl
        //   message.template.outputs[0].carousel.items[idx].buttons[btIdx].webLinkUrl = circles.replace('${kakaoId}', kakaoId)
        // }
        /////////////////////////////////

        if (el.auth == 1) { //등록한 사람만 쓸수 있는 블록의 경우
          //이메일 인증을 받지 않은 경우
          if (user === 'email') {
            message.template.outputs[0].carousel.items[idx] = {
              "title": el.title,
              "description": '아직 이메일 인증을 받지 않았아요! 아래의 인증 버튼을 눌러 마저 등록해주세요!',
              "thumbnail": {
                "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/main/${el.thumbnail}`)
              },
              "buttons": [{
                "label": "이메일 확인 📫",
                "action": "webLink",
                "webLinkUrl": 'https://outlook.office365.com/owa/?realm=sangmyung.kr&exsvurl=1&ll-cc=1042&modurl=0'
              }]
            }
          }
          //등록이 안되어 있는 경우
          else if (user === undefined) {
            message.template.outputs[0].carousel.items[idx] = {
              "title": el.title,
              "description": '등록되어 있지 않네요. 아래의 등록하기 버튼을 눌러 등록해주세요!',
              "thumbnail": {
                "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/main/${el.thumbnail}`)
              },
              "buttons": [{
                "label": "등록 📝",
                "action": "webLink",
                "webLinkUrl": `https://smusmu.co.kr/auth/register/commu?kakaoId=${kakaoId}`
              }]
            }
          }
          else if(!user.major){     //등록되어 있고 인증도 받았지만 학과정보가 없는경우
            message.template.outputs[0].carousel.items[idx] = {
              "title": el.title,
              "description": '학과정보가 없어요 😔 커뮤니티에 들어가서 학과정보를 입력해주세요!',
              "thumbnail": {
                "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/main/${el.thumbnail}`)
              },
              "buttons": [{
                "label": "커뮤니티 🌐",
                "action": "webLink",
                "webLinkUrl": `https://smusmu.co.kr/commu/home/myinfo`
              }]
            }
          }

          if (user && user.major && user.homepage) { //학과 홈페이지 🌐 기능을 위한 코드
            let btIdx = message.template.outputs[0].carousel.items[idx].buttons.findIndex(x => x.action === "webLink");
            let majorpage = message.template.outputs[0].carousel.items[idx].buttons[btIdx].webLinkUrl
            message.template.outputs[0].carousel.items[idx].buttons[btIdx].webLinkUrl = majorpage.replace('${homepage}', user.homepage)
          }
        }
      })
      return res.json(message)
    })
  })
})


module.exports = router;