module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../config/db')();

  route.get('', function(req, res){
    var sql = 'SELECT explanation FROM Description WHERE route=?';

    conn.query(sql, ['main'], (err, results) => {
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
            buttons: defaultObj.mainbutton
          }
        };

        res.json(massage);
      }
    });
  });

  return route;
}