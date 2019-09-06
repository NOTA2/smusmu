var conn = require('../../../config/db');
var defaultObj = require('../../../config/defaultVariable');
var router = require('express').Router();

router.post('', function (req, res) {

  let infoId = req.body.action.clientExtra.id;

  let message = {
    "version": "2.0",
    "template": {
      "outputs": [{
        "simpleText": {
          "text": '문제가 생겼스뮤 😔 다시 시도해 주세요!'
        }
      }],
      "quickReplies": defaultObj.Qu.concat(defaultObj.eatQuickReplies)
    }
  };

  let sql = `SELECT * FROM andamiro_menu WHERE infoId = ? ORDER BY menuorder`


  conn.query(sql, [infoId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.json(message);
    }

    rows.forEach((el, idx) => {
      if (!message.template.outputs[el.col] || (message.template.outputs[el.col] && !message.template.outputs[el.col].carousel))
        message.template.outputs[el.col] = {
          "carousel": {
            "type": "basicCard",
            "items": []
          }
        }

      message.template.outputs[el.col].carousel.items[el.menuorder - 1] = {
        "title": el.title,
        "description": el.description,
        "thumbnail": {
          "imageUrl": encodeURI(`http://${defaultObj.ipadd}/img/andamiro/menu/${el.thumbnail}`),
          "fixedRatio": true,
          "width": 800,
          "height": 800
        }
      };
      if (!el.title)
        delete message.template.outputs[el.col].carousel.items[el.menuorder - 1].title

      if (!el.description)
        delete message.template.outputs[el.col].carousel.items[el.menuorder - 1].description

      if (!el.thumbnail)
        delete message.template.outputs[el.col].carousel.items[el.menuorder - 1].thumbnail
    })
    return res.json(message)
  });
});

module.exports = router;