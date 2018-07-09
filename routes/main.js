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
    
    res.set({
      'content-type': 'application/json'
    }).send(JSON.stringify(massage));
  });

  return route;
}
