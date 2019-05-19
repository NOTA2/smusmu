const conn = require('../../config/db')();
const router = require('express').Router();
const defaultObj = require('../../config/defaultVariable');

router.post('/', (req, res) => {
  var kakaoId = req.body.userRequest.user.id;
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '스뮤스뮤 등록이 안돼있어요!'
        }
      }],
      "quickReplies": defaultObj.Qu
    }
  };
  console.log(kakaoId);
  

  var sql = `SELECT users.name, assocollege, asso.id as assoId, assoname, asso.location, asso.logo, asso.description, assophone
              FROM asso
              LEFT JOIN users ON assocollege = (select college from major where id=users.majorId)
              WHERE users.kakaoId=? OR assocollege='총학생회'
              ORDER BY users.name DESC`;

  conn.query(sql, [kakaoId], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length > 0) {
      message.template.outputs[0] = {
        "carousel": {
          "type": "basicCard",
          "items": []
        }
      };

      rows.forEach(el => {
        var assocollege = el.assocollege
        var title = `${el.assoname} (${el.assocollege})`

        message.template.outputs[0].carousel.items.push({
          "title": title,
          "description": el.description,
          "thumbnail": {
            "imageUrl": `http://smusmu.co.kr/${el.logo}`,
            "fixedRatio": true,
            "width": 300,
            "height": 300
          },
          "buttons": [{
              "label": '물품 확인',
              "action": "block",
              "messageText": `${assocollege} 대여 물품 확인`,
              "extra": {
                "id": el.assoId
              },
              "blockId": "5cc6fb6c384c5508fceee675"
            },
            {
              "label": '현황 확인',
              "action": "block",
              "messageText": `${assocollege} 대여 현황`,
              "extra": {
                "id": el.assoId
              },
              "blockId": "5cc6fb73384c5508fceee677"
            }
          ]
        })
      });

      return res.json(message);
    } else {
      message.template.quickReplies = message.template.quickReplies.concat([{
        "label": '등록하기',
        "action": "block",
        "messageText": '등록하기',
        "blockId": "5c2efe76384c5518d11fe678"
      }])
      return res.json(message);
    }
  })
})

router.post('/thing', (req, res) => {

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '스뮤스뮤 등록이 안돼있어요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat([{
        "label": '학생회 목록 확인',
        "action": "block",
        "messageText": '학생회 목록 확인',
        "blockId": "5c273c97e8212718584bf555"
      }])
    }
  };
  var assoId = req.body.action.clientExtra.id;
  
  var sql = `SELECT rent.name, rent.day, rent.allcount, rent.nowcount, assoname as assoname, assocollege, asso.location
  FROM rent, asso 
  WHERE rent.assoId = asso.id AND rent.assoId = ?`;

  conn.query(sql, [assoId], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length > 0) {

      var str = `${rows[0].assoname} (${rows[0].assocollege})`;


      str += `은 ${rows[0].location}에 있어요!\n\n`;

      rows.forEach(el => {
        str += `${el.name} - ${el.day}일간 대여가능\n`
      });

      message.template.outputs[0].simpleText = str;

      return res.json(message);
    } else {
      message.template.outputs[0].simpleText = `${rows[0].assoname} (${rows[0].assocollege})은 대여물품 서비스를 제공하지 않아요 😔`;
      return res.json(message);
    }
  })
})


router.post('/now', (req, res) => {

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '스뮤스뮤 등록이 안돼있어요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat([{
        "label": '학생회 목록 확인',
        "action": "block",
        "messageText": '학생회 목록 확인',
        "blockId": "5c273c97e8212718584bf555"
      }])
    }
  };
  var assoId = req.body.action.clientExtra.id;
  
  var sql = `SELECT rent.name, rent.day, rent.allcount, rent.nowcount, assoname as assoname, assocollege, asso.location
  FROM rent, asso 
  WHERE rent.assoId = asso.id AND rent.assoId = ?`;

  conn.query(sql, [assoId], (err, rows) => {
    if (err) {
      throw err;
    }

    if (rows.length > 0) {

      var str = `${rows[0].assoname} (${rows[0].assocollege})`;

      str += `은 ${rows[0].location}에 있어요!\n\n`;
      rows.forEach(el => {
        str += `${el.name} : ${el.nowcount}개 / ${el.allcount}개 (${el.day}일)\n`
      });

      message.template.outputs[0].simpleText = str;

      return res.json(message);
    } else {
      message.template.outputs[0].simpleText = `${rows[0].assoname} (${rows[0].assocollege})은 대여물품 서비스를 제공하지 않아요 😔`;
      return res.json(message);
    }
  })
})


module.exports = router;