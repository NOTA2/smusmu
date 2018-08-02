module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res){
    var massage = {
      "message": {
        "text": defaultObj.firstmsg
      },
      "keyboard": {
        type: 'buttons',
        buttons: defaultObj.mainbutton
      }
    };
    console.log(massage);
    res.json(massage);
  });

  return route;
}
