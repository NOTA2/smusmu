var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();
const conn = require('../../../config/db');

router.post('', function (req, res) {
  var d = new Date();
  var date = d.toFormat("YYYY-MM-DD");
  var message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '날씨정보가 없스뮤. 😔'
        }
      }]
    }
  };

  console.log('전현태 병신');
  
  var sql = 'SELECT * FROM weather WHERE date = ?';

  conn.query(sql, [date], function(err, rows){
    if (err) {
      console.log(err);
      message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
      return res.json(message);
    }

    if(rows.length > 0){
      result = JSON.parse(rows[0].content);
      
      message = {
        "version": "2.0",
        "template": {
          "outputs": [{
            "simpleText": {
              "text": result[0]
            }
          }, {
            "simpleText": {
              "text": result[1]
            }
          }, {
            "simpleText": {
              "text": result[2]
            }
          }]
        }
      };
    }

    message.template.quickReplies = defaultObj.Qu.concat(defaultObj.goQuickReplies.slice(0,2))
    res.json(message);
  })

});

module.exports = router;