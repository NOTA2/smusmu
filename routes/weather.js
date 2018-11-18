module.exports = function(){
  var app = require('../app.js');
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res) {
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

    res.json(massage);
  });


  return route;
}
