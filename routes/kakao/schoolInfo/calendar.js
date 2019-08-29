var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {
  var content = req.body.action.detailParams;

  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '검색결과를 찾을 수 업스뮤 😔\n버튼을 다시 누르거나 학사일정이라고 말해줘스뮤 😔'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.schoolQuickReplies.slice(0,2).concat(defaultObj.noticeQuickReplies))
    }
  };

  var sql = "SELECT DISTINCT date,content FROM academicCalendar ";

  try {
    content = JSON.parse(content.date.value);

    var year = content.to.date.split('-')[0].substr(2, 2);;
    var month = content.to.date.split('-')[1];

    sql += `WHERE month LIKE (${conn.escape('%'+year+'%')}) AND month LIKE (${conn.escape('%'+month+'월%')})`;
  } catch (e) {
    content = content.content.value;
    var d = new Date();
    var year = d.getFullYear();
    sql += `WHERE month LIKE (${conn.escape('%'+year+'%')}) AND content LIKE (${conn.escape('%'+content+'%')}) OR homonym LIKE (${conn.escape('%'+content+'%')})`
  } finally {
    conn.query(sql, function (err, rows) {
      if (err) {
        console.log(err);
        return res.json(message);
      }
      rows = JSON.parse(JSON.stringify(rows))

      if (rows.length > 0)
        message = getmessage(rows);

      res.json(message);
    });
  }
});

module.exports = router;

function getmessage(rows) {
  var calresultstr = '';
  var defaultObj = require('../../../config/defaultVariable');

  rows.forEach((row, idx) => {
    calresultstr += '[' + row.date + ']\n';
    if (idx == rows.length - 1)
      calresultstr += row.content;
    else
      calresultstr += row.content + '\n\n';
  })
  var result = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": calresultstr
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.schoolQuickReplies.slice(0,2).concat(defaultObj.noticeQuickReplies))
    }
  };


  return result;
}