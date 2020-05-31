const conn = require('../config/db');
const async = require('async');
const request = require('request');

exports.search = function search(nextweek, check) {
  if (!check) { //check가 undefined거나 0일때만 실행된다. (무한 반복을 피하기 위해)
    let d = new Date();
    let url;

    if (nextweek)
      url = `https://hongje.happydorm.or.kr/hongje/food/getWeeklyMenu.kmc?locgbn=AA&sch_date=${nextweek}`
    else
      url = `https://hongje.happydorm.or.kr/hongje/food/getWeeklyMenu.kmc?locgbn=AA&sch_date=${d.toFormat("YYYY-MM-DD")}`

    request({method:'GET', uri:encodeURI(url)}, (err, res, body) => {
      if (err || res.statusCode != 200) {
        console.log(body);
        return;
      }

      let jdata = JSON.parse(body).root[0].WEEKLYMENU;

      if (jdata.length > 0) {
        jdata = jdata[0]
        let result = new Array();

        for (let i = 1; i <= 7; i++) {
          let _i = i - 1
          result[_i] = new Array(3);

          result[_i][0] = jdata[`fo_date${i}`];
          result[_i][1] = 'H';
          
          result[_i][2] = new Array(3);
          result[_i][2][0] = `=====조식=====\n${jdata[`fo_menu_mor${i}`].replace(/,/g,'\n')}\n\n[빵식(Take-out)]\n${jdata[`fo_sub_mor${i}`]}`
          result[_i][2][1] = `=====중식=====\n${jdata[`fo_menu_lun${i}`].replace(/,/g,'\n')}\n\n[샐러드/후식]\n${jdata[`fo_sub_lun${i}`]}`
          result[_i][2][2] = `=====석식=====\n${jdata[`fo_menu_eve${i}`].replace(/,/g,'\n')}\n\n[샐러드/후식]\n${jdata[`fo_sub_eve${i}`]}`
          result[_i][2] = JSON.stringify(result[_i][2])
        }

        let date = result.map(x => x[0]);
        let location = result.map(x => x[1]);

        let sql = `INSERT INTO Eat (date, location, content)
            SELECT * FROM (SELECT ?) AS tmp
            WHERE NOT EXISTS (
                SELECT date, location FROM Eat WHERE date=? AND location =?
            ) LIMIT 1;`

        async.forEachOf(result, function (param, i, inner_callback) {
          conn.query(sql, [param, date[i], location[i]], function (err, rows) {
            if (!err) {
              inner_callback(null);
            } else {
              console.log("홍제기숙사 학식정보 INSERT 에러");
              inner_callback(err);
            };
          });
        }, function (err) {
          if (err) {
            throw err
          } else {
            console.log("홍제기숙사 학식정보 업데이트 완료");
          }
        });
      } else {
        if (!nextweek)
          nextweek = JSON.parse(body).root[0].LASTNEXT[0].mon_date;
        
        if (!check)     //check가 undefined일 때
          check = 0;
        else if (check == 0)
          check = 1;

        console.log(`홍제기숙사 학식정보 없음. 다음주(${nextweek}) 검색`);

        search(nextweek, check)
      }
    })
  }
}