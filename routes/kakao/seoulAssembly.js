module.exports = function(){
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../../config/db')();

  route.get('', function(req, res) {


    var m
    
    if(!defaultObj.seoulAssemblyResult.check){
      message = {
        "message": {
          "text": '오늘 집회정보가 없스뮤 ㅠㅠ',
        },
        "keyboard": {
          type: 'buttons',
          buttons: defaultObj.mainbutton
        }
      };

    }
    else{
      message = {
        "message": {
          "text": defaultObj.seoulAssemblyResult.str,
          "photo": {
            "url": defaultObj.seoulAssemblyResult.img,
            "width": 640,
            "height": 480
          },
          "message_button": {
            "label" : '사진 크게 보기',
            "url" : defaultObj.seoulAssemblyResult.img
          }
        },
        "keyboard": {
          type: 'buttons',
          buttons: defaultObj.mainbutton
        }
      };
    }


    res.json(message);
  });


  return route;
}
