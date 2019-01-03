module.exports = function(){
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../../config/db')();
  var foodmenu = [defaultObj.firststr];

  route.get('', function(req, res) {
    var sql = 'SELECT * FROM FoodMenu';

    conn.query(sql, [], (err, results) => {
      if (err) {
        console.err(err);
        return res.redirect('/err');
      } else {
        foodmenu = foodmenu.concat(results.map(x => x.name));
        message = {
          "message": {
            "text": '보고싶은 메뉴판을 누르뮤!'
          },
          "keyboard" : {
            type : 'buttons',
            buttons : foodmenu
          }
        };

        res.json(message);
      }
    });
  });


  route.get('/result', function(req, res) {
    var content = req.query.content;
    var sql = 'SELECT * FROM FoodMenu WHERE name=?';

    conn.query(sql, [content], (err, results) => {
      if (err) {
        console.err(err);
        return res.redirect('/err');
      } else {

        let img = 'http://' + defaultObj.ipadd + results[0].img;

        message = {
          "message": {
            "text": results[0].desc,
            "photo": {
              "url": img,
              "width": 480,
              "height": 640
            },
            "message_button": {
              "label" : '사진 크게 보기',
              "url" : img
            }
          },
          "keyboard" : {
            type : 'buttons',
            buttons : foodmenu
          }
        };

        res.json(message);
      }
    });
  });

  return route;
}
