const defaultObj = require('../../config/defaultVariable');
const route = require('express').Router();
const conn = require('../../config/db')();

route.post('', function (req, res) {

  console.log(req.body.action.detailParams.smyouth);

  message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '500 SMYOUTH POINT 획득!\n다시 포인트를 얻으려면 아래의 [SMYOUTH POINT 얻기] (노랑 버튼)을 눌러주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat([{
        "label": 'SMYOUTH POINT 얻기',
        "action": "block",
        "messageText": 'SMYOUTH POINT',
        "blockId": "5cb86d4905aaa7241fe0e64e"
      }])
    }
  };

  return res.json(message);
});

module.exports = route;