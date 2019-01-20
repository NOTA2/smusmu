var conn = require('../../config/db')();

module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();

  route.post('', function (req, res) {
    var content = req.body.action.detailParams;

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

    var sql = "SELECT date,content FROM academicCalendar ";

    try {
      content = JSON.parse(content.date.value);
      
      var year = content.to.date.split('-')[0].substr(2,2);;
      var month = content.to.date.split('-')[1];

      sql += "WHERE month LIKE ('%" + year + "%') AND month LIKE ('%" + month + "월%')";
    } catch (e) {
      content = content.content.value;
      sql += "WHERE month LIKE ('%"+ year + "%') AND content LIKE ('%" + content + "%') OR homonym LIKE ('%" + content + "%')"
    } finally {

      conn.query(sql, function (err, rows) {
        if (err){
          console.err(err);
          return res.json(message);
        }
        rows = JSON.parse(JSON.stringify(rows))
        
        if (rows.length > 0)
          message = getmessage(rows);
      
        res.json(message);
      });
    }
  });

  return route;
}

function getmessage(rows) {
  var calresultstr = '';
  var defaultObj = require('../../config/defaultVariable');

  rows.forEach((row, idx) =>{
    calresultstr+='['+row.date+']\n';
    if(idx == rows.length - 1)
      calresultstr+=row.content;
    else
      calresultstr+=row.content+'\n\n';
  }) 
  var result ={
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": calresultstr
        }
      }],
      "quickReplies": defaultObj.Qu
    }
  };


  return result;
}