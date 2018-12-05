module.exports = function() {
  var app = require('../../app.js');
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../../config/db')();

  route.get('', function(req, res) {

    var sql = 'SELECT explanation FROM Description WHERE route=?';

    conn.query(sql, ['eat'], (err, results) => {
      if(err){
        console.log(err);
        return res.redirect('/err');
      } else{
        var massage = {
          "message": {
            "text": results[0].explanation
          },
          "keyboard": {
            type: 'buttons',
            buttons: defaultObj.eatbutton
          }
        };
        res.json(massage);
      }
    });
  });

  route.get('/day', (req, res) => {
    var content = req.query.content;

    result = getDayResult(content);

    var massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: defaultObj.eatbutton
      }
    };
    res.json(massage);
  })

  route.get('/week', (req, res) => {
    var content = req.query.content;

    //버튼을 생성하는 과정
    if (content.indexOf('미래백년관') != -1)
      weekbt = defaultObj.eatResult.R.bt;
    else if (content.indexOf('밀레니엄관') != -1)
      weekbt = defaultObj.eatResult.T.bt;
    else
      weekbt = defaultObj.eatResult.H.bt;

    if (content.indexOf('일주일') != -1)
      result = '원하는 날을 선택해 주세요.'
    else
      result = getWeekResult(content);

    massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: weekbt
      }
    };

    res.json(massage);
  });


  //요청한 학식 정보를 반환한다.
  function getDayResult(keyword) {
    var d = new Date();
    var day;
    var eatResultTemp;

    if (keyword.indexOf('미래백년관') != -1)
      eatResultTemp = defaultObj.eatResult.R.contents;
    else if (keyword.indexOf('밀레니엄관') != -1)
      eatResultTemp = defaultObj.eatResult.T.contents;
    else if (keyword.indexOf('홍제기숙사') != -1)
      eatResultTemp = defaultObj.eatResult.H.contents;

    day = d.getDay() - 1;
    if (day == -1)
      day = 6

    keyword = ("00" + (d.getMonth() + 1)).slice(-2) + '/' + ("00" + d.getDate()).slice(-2);

    var idx = eatResultTemp.findIndex(function(ele, i) {
      return (ele.indexOf(this) != -1);
    }, keyword);


    if (idx == -1) {
      if (day < 5)
        return '메뉴가 올라와 있지 않습니다.'
      return '오늘은 식당을 운영하지 않습니다.'
    }

    return eatResultTemp[idx];
  }

  function getWeekResult(keyword) {
    var eatResultTemp;

    if (keyword.indexOf('미래백년관') != -1)
      eatResultTemp = defaultObj.eatResult.R.contents;
    else if (keyword.indexOf('밀레니엄관') != -1)
      eatResultTemp = defaultObj.eatResult.T.contents;
    else if (keyword.indexOf('홍제기숙사') != -1)
      eatResultTemp = defaultObj.eatResult.H.contents;

    keyword = keyword.split(' - ')[1].trim();

    var idx = eatResultTemp.findIndex(function(ele, i) {
      return (ele.indexOf(this) != -1);
    }, keyword);

    return eatResultTemp[idx];
  }

  return route;
}
