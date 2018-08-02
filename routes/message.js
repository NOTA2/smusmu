module.exports = function(){
  var app = require('../app.js');
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.post('', (req, res) => {
    const member = {
      user_key: req.body.user_key,
      type: req.body.type,
      content: req.body.content
    };

    var massage;

    var idx = exports.user.findIndex(x => x.user_key == member.user_key);

    if (idx == -1) {
      exports.user[userCount] = {
        user_key: member.user_key,
        mode: 0,
        noticeObj : {page : 1, mode : defaultObj.NTC, keyword : ''},
        phoneArr : []
      }
      idx = userCount;
      userCount++;
      console.log(userCount + "번째 멤버 등록\n");
    }

    exports.user[idx].mode = setMode(member.content, exports.user[idx].mode);

    if (exports.user[idx].mode == defaultObj.MAIN) {
      return res.redirect("/main");
    } else if (exports.user[idx].mode == defaultObj.EX) {
      return res.redirect("/ex");
    } else if (bigMode(exports.user[idx].mode) == defaultObj.EAT) {
      return res.redirect("/eat?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + member.content);
    } else if (bigMode(exports.user[idx].mode) == defaultObj.NTC) {
      return res.redirect("/notice?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + getreplace(member.content));
    } else if (exports.user[idx].mode == defaultObj.WTR) {
      return res.redirect("/weather?idx="+idx);
    } else if(exports.user[idx].mode == defaultObj.SAL) {
       return res.redirect("/seoulAssembly?content=" + member.content);
    } else if(bigMode(exports.user[idx].mode) == defaultObj.CAL) {
      return res.redirect("/calendar?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + member.content);
    } else if(exports.user[idx].mode == defaultObj.FDMN){
      return res.redirect("/foodMenu?content=" + member.content);
    }
  });

  return route;
}

//받은 메시지를 바탕으로 모드를 정한다.
function setMode(content, mode){
  if (content == defaultObj.backstr)
    mode = bigMode(mode);
  else if (content ==  defaultObj.mainstr || content == defaultObj.firststr)
    mode = defaultObj.MAIN;
  else if (content == defaultObj.explanationbt)
    mode = defaultObj.EX;
  else if (content == defaultObj.eatstr)
    mode = defaultObj.EAT;
  else if (content == defaultObj.ntcstr)
    mode = defaultObj.NTC;
  else if (content == defaultObj.ntcbutton[1])
    mode = defaultObj.NTCLR;
  else if (content == defaultObj.ntcbutton[2])
    mode = defaultObj.NTCS;
  else if (mode == defaultObj.NTCS)
    mode = defaultObj.NTCLS;
  else if (mode == defaultObj.NTCLR && (content == '>' || content == '<'))
    mode = defaultObj.NTCLR;
  else if (mode == defaultObj.NTCLS && (content == '>' || content == '<'))
    mode = defaultObj.NTCLS;
  else if (mode == defaultObj.NTCLR || mode == defaultObj.NTCLS)
    mode = defaultObj.NTCR;
  else if (content == defaultObj.wtrstr)
    mode = defaultObj.WTR;
  else if(content == defaultObj.salstr)
    mode = defaultObj.SAL;
  else if(content == defaultObj.calstr)
    mode = defaultObj.CAL;
  else if (content == defaultObj.calbutton[1])
    mode = defaultObj.CALM
  else if (content == defaultObj.calbutton[2])
    mode = defaultObj.CALS
  else if(content == defaultObj.foodMenustr)
    mode = defaultObj.FDMN;

  return mode;
}

//뒤로가기를 누르거나 크게봤을때 어느 모드인지 정하기 위해
function bigMode(mode){
  return parseInt((mode)/10)*10
}
