module.exports = function(){
  var app = require('../app.js');
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res) {
    var idx = req.query.idx;
    result = defaultObj.weatherResult;

    massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: defaultObj.mainbutton
      }
    };
    app.user[idx].mode = defaultObj.MAIN;

    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });


  return route;
}
