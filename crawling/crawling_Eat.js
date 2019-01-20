var client = require('cheerio-httpcli');
var conn = require('../config/db')();
var async = require('async');

exports.search = function () {
  var d = new Date();

  var dateTime = d.toFormat("YYYY-MM-DD HH24:MI:SS");
  var urlDate = d.toFormat("YYYY-MM-DD");
  var time = 'L';

  console.log(dateTime + ' 학식정보 업데이트 시작');

  var urlR = 'https://www.smu.ac.kr/ko/life/restaurantView.do?srMealCategory=' + time + '&srDt=' + urlDate;
  var urlT = 'https://www.smu.ac.kr/ko/life/restaurantView2.do?srMealCategory=' + time + '&srDt=' + urlDate;

  client.fetch(urlR, function (err, $, res) {
    if (err) {
      console.log(err);
      return;
    }
    
    if ($('.menu-list-box td .s-dot').length > 0) {
      var eatR = new Array();
      var eatRIdx = 0;

      var eatDate = $('.menu-tab-box > div > p').text().split('~')[0].trim().replace(/[^0-9.]/g, '').split('.');
      var year = parseInt(eatDate[0])
      var month = parseInt(eatDate[1])
      var date = parseInt(eatDate[2])

      eatDate = new Date(year, month - 1, date);

      for(var idx =0;idx<5;idx++){
        eatR[idx] = new Array();
        eatR[idx][0] = eatDate.toFormat("YYYY-MM-DD");
        eatDate.setDate(eatDate.getDate() + 1);
      }

      $('.menu-list-box td .s-dot').each(function (idx) {
        if (idx % 2 == 0) {
          eatR[eatRIdx][1] = 'R';
          eatR[eatRIdx][2] = new Array();
        }

        if (idx % 2 == 1)
          eatR[eatRIdx][2][0] += '\n\n[오늘의 메뉴]\n'
        else
          eatR[eatRIdx][2][0] = '=====중식=====\n[뷔페식 메뉴]\n'

        $(this).find('li').each(function () {
          eatR[eatRIdx][2][0] += $(this).text().trim() + '\n';
        })
        //공백 제거
        eatR[eatRIdx][2][0] = eatR[eatRIdx][2][0].trim();
        if (idx % 2 == 1)
          eatRIdx++;
      });

      //석식 추가
      time = 'D'
      urlR = 'https://www.smu.ac.kr/ko/life/restaurantView.do?srMealCategory=' + time + '&srDt=' + urlDate;

      client.fetch(urlR, function (err, $, res) {
        if (err) {
          console.log(err);
          return;
        }
        if ($('.menu-list-box td .s-dot').length > 0) {
          $('.menu-list-box td .s-dot').each(function (idx) {
            eatR[idx][2][1] = '=====석식=====\n'

            $(this).find('li').each(function () {
              eatR[idx][2][1] += $(this).text().trim() + '\n';
            })

            //중식 석식을 배열에 저장하여 이를 문자열화 시킨 후 DB에 저장한다.
            //(출력시 따로 출력하기 위해)
            eatR[idx][2][1] = eatR[idx][2][1].trim();
            eatR[idx][2] = JSON.stringify(eatR[idx][2]);
          });
        }

        var date = eatR.map(x => x[0]);
        var location = eatR.map(x => x[1]);

        var sql = `
        INSERT INTO Eat (date, location, content)
        SELECT * FROM (SELECT ?) AS tmp
        WHERE NOT EXISTS (
            SELECT date, location FROM Eat WHERE date=? AND location =?
        ) LIMIT 1;`


        async.forEachOf(eatR, function (param, i, inner_callback) {
          conn.query(sql, [param, date[i], location[i]], function (err, rows) {
            if (!err) {
              inner_callback(null);
            } else {
              console.log("R관 학식정보 INSERT 에러");
              inner_callback(err);
            };
          });
        }, function (err) {
          if (err) {
            throw err
          } else {
            console.log("R관 학식정보 업데이트 완료");
          }
        });
      });
    } else {
      console.log("R관 학식정보 없음");
    }
  });


  //T관 업데이트
  client.fetch(urlT, function (err, $, res) {
    if (err) {
      console.log(err);
      return;
    }

    if ($('.menu-list-box td .s-dot').length > 0) {
      var eatT = new Array();

      var eatDate = $('.menu-tab-box > div > p').text().split('~')[0].trim().replace(/[^0-9.]/g, '').split('.');
      var year = parseInt(eatDate[0])
      var month = parseInt(eatDate[1])
      var date = parseInt(eatDate[2])

      eatDate = new Date(year, month - 1, date);
      
      for(var idx =0;idx<5;idx++){
        eatR[idx] = new Array();
        eatR[idx][0] = eatDate.toFormat("YYYY-MM-DD");
        eatDate.setDate(eatDate.getDate() + 1);
      }

      $('.menu-list-box td .s-dot').each(function (idx) {
        eatT[idx][1] = 'T';
        eatT[idx][2] = new Array();
        eatT[idx][2][0] = '=====중식=====\n'

        $(this).find('li').each(function () {
          eatT[idx][2][0] += $(this).text().trim() + '\n';
        });

        //중식 석식을 배열에 저장하여 이를 문자열화 시킨 후 DB에 저장한다.
        //(출력시 따로 출력하기 위해)
        eatT[idx][2][0] = eatT[idx][2][0].trim(); //공백제거
        eatT[idx][2] = JSON.stringify(eatT[idx][2]);
      });

      // DB에 추가
      var date = eatT.map(x => x[0]);
      var location = eatT.map(x => x[1]);

      var sql = `
        INSERT INTO Eat (date, location, content)
        SELECT * FROM (SELECT ?) AS tmp
        WHERE NOT EXISTS (
            SELECT date, location FROM Eat WHERE date=? AND location =?
        ) LIMIT 1;`

      async.forEachOf(eatT, function (param, i, inner_callback) {
        conn.query(sql, [param, date[i], location[i]], function (err, rows) {
          if (!err) {
            inner_callback(null);
          } else {
            console.log("T관 학식정보 업데이트 에러");
            inner_callback(err);
          };
        });
      }, function (err) {
        if (err) {
          throw err
        } else {
          console.log("T관 학식정보 업데이트 완료");
        }
      });
    } else {
      console.log("T관 학식정보 없음");
    }
  });

}