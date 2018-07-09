module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();
  const fs = require('fs');

  var foodMenubutton = foodMenuBtMake();

  route.get('', function(req, res) {
    var content = req.query.content;

    if (content != '학교 근처 식당 메뉴판') {
      return res.redirect("/foodMenu/result?content=" + content);
    }

    massage = {
      "message": {
        "text": '보고싶은 메뉴판을 누르뮤!'
      },
      "keyboard" : {
        type : 'buttons',
        buttons : foodMenubutton
      }
    };

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });


  route.get('/result', function(req, res) {
    var content = req.query.content;

    result = getfoodMenu(content);

    massage = {
      "message": {
        "text": result.str,
        "photo": {
          "url": result.img,
          "width": 480,
          "height": 640
        },
        "message_button": {
          "label" : '사진 크게 보기',
          "url" : result.img
        }
      },
      "keyboard" : {
        type : 'buttons',
        buttons : foodMenubutton
      }
    };

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });


  function foodMenuBtMake(){
    var foodMenuJSON = fs.readFileSync('./asset/foodMenu.json', 'utf8');
    var foodMenudatas = JSON.parse(foodMenuJSON);

    return [defaultObj.firststr].concat(Object.keys(foodMenudatas));
  }

  function getfoodMenu(keyword){
    var foodMenuJSON = fs.readFileSync('./asset/foodMenu.json', 'utf8');
    var foodMenudatas = JSON.parse(foodMenuJSON);

    var menuResult = new Object();

    menuResult.str = foodMenudatas[keyword].str

    menuResult.img = 'http://' + defaultObj.ipadd +foodMenudatas[keyword].img;

    return menuResult;
  }

  return route;
}
