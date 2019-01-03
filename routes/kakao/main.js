module.exports = function(){
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();

  route.get('', function(req, res){
    var message = {
      "message": {
        "text": defaultObj.firstmsg
      },
      "keyboard": {
        type: 'buttons',
        buttons: defaultObj.mainbutton
      }
    };

    res.json(message);
  });

  return route;
}
