module.exports = function() {
  var conn = require('../config/db')();
  var app = require('../app.js');
  var defaultObj = require('../config/defaultVariable');
  var route = require('express').Router();

  route.post('', (req, res) => {
    var uKey = req.body.user_key;
    var content = getreplace(req.body.content);

    var sql = 'SELECT * FROM ChatUser WHERE uKey=?';

    conn.query(sql, [uKey], (err, results) => {
      if (err) {
        console.log(err);
        return res.redirect('/err');
      } else {
        var user = results[0];

        //유저 정보가 없으면 등록
        if (!user) {
          console.log('새로운 유저. DB에 등록');
          
          user = {
            uKey: uKey,
            uRoute: 'main'
          }
          sql = 'INSERT INTO ChatUser SET ?';
          conn.query(sql, user, (err, results) => {
            if (err) {
              console.err(err);
              return res.redirect('/err');
            }
          });
        }
        console.log(content);



        //URL을 어떻게 처리할 것인지 방법을 깊이 고민해 보자

        //뒤로가기 라우팅
        if (content == defaultObj.backstr) {
          // /로 구분짓고 마지막 라우터를 ''으로 치환
          
          let arr = user.uRoute.split('/');
          console.log(arr);
          console.log('/'+arr[arr.length-1]);
          
          
          user.uRoute.replace('/'+arr[arr.length-1], '');
        }
        //메인화면 라우팅
        else if (content == defaultObj.mainstr || content == defaultObj.firststr)
          user.uRoute = 'main';

        //설명서 라우팅
        else if (content == defaultObj.explanationbt)
          user.uRoute = 'ex';

        //학식정보 라우팅
        else if (content == defaultObj.eatstr)
          user.uRoute = 'eat'
        else if (user.uRoute.indexOf('eat') != -1){
          if(content.indexOf('오늘') != -1)
            user.uRoute = 'eat/day'
          else if (content.indexOf('일주일') != -1)
            user.uRoute = 'eat/week';
        }
        //날씨 라우팅
        else if (content == defaultObj.wtrstr)
          user.uRoute = 'weather';

        //집회정보 라우팅
        else if (content == defaultObj.salstr)
          user.uRoute = 'seoulAssembly';
        else if (user.uRoute.indexOf('seoulAssembly') != -1)
          user.uRoute = 'seoulAssembly/result';

        //메뉴판 라우팅
        else if(content == defaultObj.foodMenustr)
          user.uRoute = 'foodMenu';
        else if(user.uRoute.indexOf('foodMenu') != -1)
          user.uRoute = 'foodMenu/result';


        sql = 'UPDATE ChatUser SET uRoute=? WHERE uKey=?';
        conn.query(sql, [user.uRoute, user.uKey], (err, results) => {
          if (err) {
            console.err(err);
            return res.redirect('/err');
          } else {
            console.log(user.uRoute);
            return res.redirect('/' + user.uRoute + '?content=' + content + '&uKey=' + uKey);
          }
        });

        // else if (content == defaultObj.ntcstr)
        //   mode = defaultObj.NTC;
        // else if (content == defaultObj.ntcbutton[1])
        //   mode = defaultObj.NTCLR;
        // else if (content == defaultObj.ntcbutton[2])
        //   mode = defaultObj.NTCS;
        // else if (mode == defaultObj.NTCS)
        //   mode = defaultObj.NTCLS;
        // else if (mode == defaultObj.NTCLR && (content == '>' || content == '<'))
        //   mode = defaultObj.NTCLR;
        // else if (mode == defaultObj.NTCLS && (content == '>' || content == '<'))
        //   mode = defaultObj.NTCLS;
        // else if (mode == defaultObj.NTCLR || mode == defaultObj.NTCLS)
        //   mode = defaultObj.NTCR;

        // else if(content == defaultObj.calstr)
        //   mode = defaultObj.CAL;
        // else if (content == defaultObj.calbutton[1])
        //   mode = defaultObj.CALM
        // else if (content == defaultObj.calbutton[2])
        //   mode = defaultObj.CALS
      }
    });

    // var idx = exports.user.findIndex(x => x.user_key == reqObj.user_key);
    //
    // if (idx == -1) {
    //   exports.user[userCount] = {
    //     user_key: reqObj.user_key,
    //     mode: 0,
    //     noticeObj : {page : 1, mode : defaultObj.NTC, keyword : ''},
    //     phoneArr : []
    //   }
    //   idx = userCount;
    //   userCount++;
    //   console.log(userCount + "번째 멤버 등록\n");
    // }

    //   exports.user[idx].mode = setMode(reqObj.content, exports.user[idx].mode);
    //
    //   if (exports.user[idx].mode == defaultObj.MAIN) {
    //     return res.redirect("/main");
    //   } else if (exports.user[idx].mode == defaultObj.EX) {
    //     return res.redirect("/ex");
    //   } else if (bigMode(exports.user[idx].mode) == defaultObj.EAT) {
    //     return res.redirect("/eat?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + reqObj.content);
    //   } else if (bigMode(exports.user[idx].mode) == defaultObj.NTC) {
    //     return res.redirect("/notice?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + getreplace(reqObj.content));
    //   } else if (exports.user[idx].mode == defaultObj.WTR) {
    //     return res.redirect("/weather?idx="+idx);
    //   } else if(exports.user[idx].mode == defaultObj.SAL) {
    //      return res.redirect("/seoulAssembly?content=" + reqObj.content);
    //   } else if(bigMode(exports.user[idx].mode) == defaultObj.CAL) {
    //     return res.redirect("/calendar?idx="+idx+"&mode=" + exports.user[idx].mode +"&content=" + reqObj.content);
    //   } else if(exports.user[idx].mode == defaultObj.FDMN){
    //     return res.redirect("/foodMenu?content=" + reqObj.content);
    //   }
  });


  return route;
}


function getreplace(inum) {
  inum = inum.replace(/&/g, "%26");
  inum = inum.replace(/\+/g, "%2B");
  return inum;
}
