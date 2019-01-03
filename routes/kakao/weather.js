module.exports = function () {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();

  route.post('', function (req, res) {
    result = defaultObj.weatherResult;

    if (result == '날씨정보가 없스뮤.') {
      message = {
        "version": "2.0",
        "template": {
          "outputs": [{
            "simpleText": {
              "text": result +' 😔'
            }
          }],
          "quickReplies" : defaultObj.Qu
        }
      };
    } else {
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
          }],
          "quickReplies" : defaultObj.Qu
        }
      };
    }

    res.json(message);
  });

  return route;
}