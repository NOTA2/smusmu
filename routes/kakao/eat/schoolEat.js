const conn = require('../../../config/db');
const dow = ['(일)', '(월)', '(화)', '(수)', '(목)', '(금)', '(토)'];
const defaultObj = require('../../../config/defaultVariable');
const router = require('express').Router();

//오늘의 학식메뉴
router.post('/', (req, res) => {

  var content = req.body.action.detailParams;
  var d = new Date();
  var date = d.toFormat("YYYY-MM-DD");
  try {
    var location = content.eat_place.value;
  } catch {
    var location = 'R';
  }
  var day = d.getDay();

  if (location == '미래백년관')
    location = 'R';
  else if (location == '밀레니엄관')
    location = 'T';
  else if (location == '홍제')
    location = 'H';

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '학식정보가 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.eatQuickReplies)
    }
  };

  if (location != 'H' && (day == 0 || day == 6)) {
    message.template.outputs[0].simpleText.text = '오늘은 쉬는날이에요!! 😔'
    return res.json(message);
  } else {
    var sql = 'SELECT content FROM Eat WHERE date=? AND location=?'
    conn.query(sql, [date, location], function (err, rows) {
      if (err) {
        console.log(err);
        message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
        return res.json(message);
      }
      if (rows.length > 0) {
        rows = JSON.parse(rows[0].content);

        rows.forEach(function (el, idx) {
          if (idx == 0)
            el = date + dow[day] + '\n\n' + el
          message.template.outputs[idx] = {
            "simpleText": {
              "text": el
            }
          }
        });
      }
      
      return res.json(message);
    })
  }
})

//특정 날의
router.post('/day', (req, res) => {

  var content = req.body.action.detailParams;
  try {
    var location = content.eat_place.value;
  } catch {
    var location = 'R';
  }
  var date = JSON.parse(content.sys_date.value).date;
  var d = new Date(date);
  var day = d.getDay();

  if (location == '미래백년관')
    location = 'R';
  if (location == '밀레니엄관')
    location = 'T';

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '학식정보가 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.eatQuickReplies)
    }
  };
  if (location != 'H' && (day == 0 || day == 6)) {
    message.template.outputs[0].simpleText.text = '그날은 쉬는날이에요! 😔'
    return res.json(message);
  } else {
    var sql = 'SELECT content FROM Eat WHERE date=? AND location=?'
    conn.query(sql, [date, location], function (err, rows) {
      if (err) {
        console.log(err);
        message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
        return res.json(message);
      }
      if (rows.length > 0) {
        rows = JSON.parse(rows[0].content);

        rows.forEach(function (el, idx) {
          if (idx == 0)
            el = date + dow[day] + '\n\n' + el
          message.template.outputs[idx] = {
            "simpleText": {
              "text": el
            }
          }
        });

      }
      return res.json(message);
    })
  }
})

//이번주 학식 메뉴
router.post('/week', (req, res) => {

  var content = req.body.action.detailParams;
  try {
    var location = content.eat_place.value;
  } catch {
    var location = 'R';
  }
  var d = new Date();

  if (location == '미래백년관')
    location = 'R';
  if (location == '밀레니엄관')
    location = 'T';

  var date = d.toFormat("YYYY-MM-DD");
  var from = JSON.parse(content.sys_date_period.value).from.date;
  var to = JSON.parse(content.sys_date_period.value).to.date;

  if (date > from)
    from = date;

  if (d.getDay() == 0) { //일요일이라면
    d.setDate(d.getDate() + 1);
    from = d.toFormat("YYYY-MM-DD");

    d.setDate(d.getDate() + 3);
    to = d.toFormat("YYYY-MM-DD");
  }

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '학식정보가 업스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.eatQuickReplies)
    }
  };

  var sql = "select date, content from Eat where location=? AND date between date(?) and date(?)+1 LIMIT 7"

  conn.query(sql, [location, from, to], function (err, rows) {
    if (err) {
      console.log(err);
      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
      return res.json(message);
    }
    if (rows.length > 0) {
      rows.forEach(function (el, idx) {
        var d = new Date(el.date);
        var str = el.date + dow[d.getDay()] + '\n\n';
        var temp = JSON.parse(el.content);

        temp.forEach(function (el) {
          str += el + '\n\n';
        })

        // message.template.outputs[idx] = {
        //   "basicCard": {
        //     "title": str.trim()
        //   }
        // };

        message.template.outputs[idx] = {
          "simpleText": {
            "text": str.trim()
          }
        };
      });
    }
    return res.json(message);
  })
})



module.exports = router;