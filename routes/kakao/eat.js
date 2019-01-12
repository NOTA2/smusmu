var conn = require('../../config/db')();
var dow = ['(일)','(월)','(화)','(수)','(목)','(금)','(토)'];

module.exports = function() {
  var defaultObj = require('../../config/defaultVariable');
  var route = require('express').Router();

  //오늘의 학식메뉴
  route.post('/', (req, res) => {

    var content = req.body.action.detailParams;
    var d = new Date();
    var date = d.toFormat("YYYY-MM-DD");
    var location = content.eat_place.value;
    var day = d.getDay();
    
    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '학식정보가 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu.concat([{
          "label": '학식정보',
          "action": "block",
          "messageText": '학식정보',
          "blockId": "5c271af35f38dd44d86a0dca"
        }])
      }
    };

    if(location != 'H' && (day==0 || day==6)){
      message.template.outputs[0].simpleText.text = '오늘은 쉬는날이에요! 😔'
      return res.json(message);
    }else{
      var sql = 'SELECT content FROM Eat WHERE date=? AND location=?'
      conn.query(sql, [date,location], function(err, rows){
        if(err){
          console.log(err);
          message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
          return res.json(message);
        }
        if(rows.length>0){
          rows = JSON.parse(rows[0].content);
        
          rows.forEach(function(el,idx){
            if(idx == 0)
              el = date + dow[day] + '\n' +el
            message.template.outputs[idx] = {
              "simpleText": {
                "text": el
              }
            } 
          });
        }
        return res.json(message);
      })
    }
  })

  //특정 날의
  route.post('/day', (req, res) => {

    var content = req.body.action.detailParams;
    var location = content.eat_place.value;
    var date = JSON.parse(content.sys_date.value).date;
    var d = new Date(date);
    var day = d.getDay();
    
    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '학식정보가 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu.concat([{
          "label": '학식정보',
          "action": "block",
          "messageText": '학식정보',
          "blockId": "5c271af35f38dd44d86a0dca"
        }])
      }
    };
    if(location != 'H' && (day==0 || day==6)){
      message.template.outputs[0].simpleText.text = '그날은 쉬는날이에요! 😔'
      return res.json(message);
    }else{
      var sql = 'SELECT content FROM Eat WHERE date=? AND location=?'
      conn.query(sql, [date,location], function(err, rows){
        if(err){
          console.log(err);
          message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
          return res.json(message);
        }
        if(rows.length>0){
          rows = JSON.parse(rows[0].content);
        
          rows.forEach(function(el,idx){
            if(idx == 0)
              el = date + dow[day] + '\n' +el
            message.template.outputs[idx] = {
              "simpleText": {
                "text": el
              }
            } 
          });
          
        }
        return res.json(message);
      })
    }
  })

  //이번주 학식 메뉴
  route.post('/week', (req, res) => {

    var content = req.body.action.detailParams;
    var location = content.eat_place.value;
    var d = new Date();
    var date = d.toFormat("YYYY-MM-DD");
    var from = JSON.parse(content.sys_date_period.value).from.date;
    var to = JSON.parse(content.sys_date_period.value).to.date;
    
    if(date > from)
      from = date;

    var message = {
      "version": "2.0",
      "template": {
        "outputs": [{
          "simpleText": {
            "text": '학식정보가 업스뮤 😔'
          }
        }],
        "quickReplies": defaultObj.Qu.concat([{
          "label": '학식정보',
          "action": "block",
          "messageText": '학식정보',
          "blockId": "5c271af35f38dd44d86a0dca"
        }])
      }
    };
    
    var sql = "select date, content from Eat where location=? AND date between date(?) and date(?)+1 LIMIT 7"
    
    conn.query(sql, [location,from,to], function(err, rows){
      if(err){
        console.log(err);
        message.template.outputs[0].simpleText.text = '잠시 문제가 생겼어요. 다시 시도해주세요 😔'
        return res.json(message);
      }
      if(rows.length>0){
        rows.forEach(function(el, idx){
          var d = new Date(el.date);
          var str = el.date + dow[d.getDay()]+ '\n\n';
          var temp = JSON.parse(el.content);

          temp.forEach(function(el){
            str+=el+'\n\n';
          })

          message.template.outputs[idx] = {
            "basicCard": {
              "title": str.trim()
            }
          };
        });
      }
      return res.json(message);
    })
  })



  return route;
}
