module.exports = function(){
  var app = require('../app.js');
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();



  route.get('', function(req, res){
    var mode = req.query.mode;
    var content = req.query.content;
    var idx = req.query.idx;
    //일주일 메뉴를 눌렀을 때
    if(content.indexOf('일주일') != -1 || mode == defaultObj.EATW){
      app.user[idx].mode = defaultObj.EATW;
      return res.redirect("/eat/eatw?mode=" +mode + "&content="+content);
    }

    //처음 학식 정보 버튼을 눌렀을때 혹은 오늘의 메뉴 버튼을 누른경
    else{
      if (content.indexOf('오늘') != -1)
        result = getResultEat(content, mode);
      else
        result = defaultObj.explanation_eat;

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: [defaultObj.firststr, "미래백년관(오늘)", "미래백년관(일주일)","밀레니엄관(오늘)","밀레니엄관(일주일)","홍제기숙사(오늘)","홍제기숙사(일주일)"]
        }
      };
    }

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });


  route.get('/eatw', function(req, res){

      var mode = req.query.mode;
      var content = req.query.content;

    //일주일 메뉴를 눌렀을 때
      var thisweek;

      //버튼을 생성하는 과정
      if(content.indexOf('미래백년관') != -1)
        weekbt = defaultObj.eatResult.R.bt;
      else if(content.indexOf('밀레니엄관') != -1)
        weekbt = defaultObj.eatResult.T.bt;
      else
        weekbt = defaultObj.eatResult.H.bt;

      if(content.indexOf('일주일') != -1)
        result = '원하는 날을 선택해 주세요.'
      else
        result = getResultEat(content, mode);

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: weekbt
        }
      };


    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });



  //요청한 학식 정보를 반환한다.
  function getResultEat(keyword, mode) {
    var d = new Date();
    var day;
    var eatResultTemp;

    if(keyword.indexOf('미래백년관') != -1)
      eatResultTemp = defaultObj.eatResult.R.contents;
    else if(keyword.indexOf('밀레니엄관') != -1)
      eatResultTemp = defaultObj.eatResult.T.contents;
    else if(keyword.indexOf('홍제기숙사') != -1)
      eatResultTemp = defaultObj.eatResult.H.contents;

    if(mode == defaultObj.EAT){    //오늘의 메뉴인 경우
      day = d.getDay() - 1;
      if(day == -1)
        day = 6

      keyword = ("00" + (d.getMonth() + 1)).slice(-2) + '/' + ("00" + d.getDate()).slice(-2);

      idx = eatResultTemp.findIndex(function(ele, i){
        return (ele.indexOf(this) != -1);
      }, keyword);


      if (idx == -1){
        if(day < 5)
          return '메뉴가 올라와 있지 않습니다.'
        return '오늘은 식당을 운영하지 않습니다.'
      }

    }
    else{
      keyword = keyword.split(' - ')[1].trim();

      idx = eatResultTemp.findIndex(function(ele, i){
        return (ele.indexOf(this) != -1);
      }, keyword);
    }

    return eatResultTemp[idx];
  }


  return route;
}
