module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res) {
    var content = req.query.content;

    if (content == '서울시 공사/집회정보'){
      result = defaultObj.explanation_seoulAssembly;

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: defaultObj.seoulAssemblyResult.bt
        }
      };
    }
    else{
      return res.redirect("/seoulAssembly/content");
    }

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });


  route.get('/content', function(req, res) {
    massage = {
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
        buttons: defaultObj.seoulAssemblyResult.bt
      }
    };

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });

  return route;
}
