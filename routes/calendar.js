module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res){
    var mode = req.query.mode;
    var content = req.query.content;
    var idx = req.query.idx;

    if(content == "월 별 검색"){
      return res.redirect("/calendar/month");
    }
    else if(content == "일정 검색"){
      return res.redirect("/calendar/search");
    }
    else if(mode == defaultObj.CALM){
      return res.redirect("/calendar/month/result?content=" + content);
    }
    else if(mode == defaultObj.CALS){
      return res.redirect("/calendar/search/result?content=" + content);
    }

    var sql = 'SELECT explanation FROM Description WHERE route=?';

    conn.query(sql, ['cal'], (err, results) => {
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
            buttons: defaultObj.calbutton
          }
        };
        res.json(massage);
      }
    });
  });


  route.get('/month', function(req, res){

    massage = {
      "message" : {
        "text" : "검색할 달을 선택해 주세요."
      },
      "keyboard" : {
        type : 'buttons',
        buttons : defaultObj.calendarResult.monthbt
      }
    }

    res.json(massage);
  });



  route.get('/search', function(req, res){
    massage = {
      "message" : {
        "text" : "검색할 일정을 입력해 주세요."
      }
    }

    res.json(massage);
  });


  route.get('/month/result', function(req, res){

    var content = req.query.content;
    var result = getclaendar(content, defaultObj.calendarResult)

    massage = {
      "message" : {
        "text" : result
      },
      "keyboard" : {
        type : 'buttons',
        buttons : defaultObj.calendarResult.monthbt
      }
    };

    res.json(massage);
  });



  route.get('/search/result', function(req, res){

    var content = req.query.content;
    var result = getclaendar(content, defaultObj.calendarResult)

    massage = {
      "message" : {
        "text" : result
      },
      "keyboard" : {
        type : 'buttons',
        buttons : defaultObj.calbutton
      }
    };


    res.json(massage);
  });

  return route;
}

function getclaendar(keyword, calendarResult){
  var calresultstr = '';
  var ch = 0

  if(calendarResult.monthbt.indexOf(keyword) != -1){   //달 검색일 경우
    keyword = keyword.substring(0, keyword.length-1);
    var selectMonth = keyword.split('년 ')[0] + '.' + keyword.split('년 ')[1];

    for(var i =0;i<calendarResult.contents.length;i++){
      if(calendarResult.contents[i].date.indexOf(selectMonth) != -1){
        calresultstr += calendarResult.contents[i].date+'\n'
        calresultstr += calendarResult.contents[i].content+'\n\n'
      }
    }
  }
  else{          //일정명 검색일 경우
    for(var i = 0; i<calendarResult.contents.length;i++){
      if(calendarResult.contents[i].content.indexOf(keyword) != -1){
        calresultstr += calendarResult.contents[i].date+'\n'
        calresultstr += calendarResult.contents[i].content+'\n\n'
        ch++;
      }
    }
    if(ch == 0)
      calresultstr = '검색 결과가 없습니다.'
  }

  calresultstr = calresultstr.trim();

  return calresultstr
}
