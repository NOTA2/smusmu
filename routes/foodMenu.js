module.exports = function(){
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();
  var conn = require('../config/db')();

  route.get('', function(req, res) {
    var sql = 'SELECT * FROM FoodMenu';

    conn.query(sql, [], (err, results) => {
      if (err) {
        console.err(err);
        return res.redirect('/err');
      } else {

        console.log(results.name);

        massage = {
          "message": {
            "text": '보고싶은 메뉴판을 누르뮤!'
          },
          "keyboard" : {
            type : 'buttons',
            buttons : results.name
          }
        };

        res.json(massage);
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

        massage = {
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
            buttons : results.name
          }
        };

        res.json(massage);
      }
    });
  });

  return route;
}
