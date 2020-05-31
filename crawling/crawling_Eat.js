const client = require('cheerio-httpcli');
const conn = require('../config/db');
const async = require('async');

exports.search = function () {
  var d = new Date();
  var bcheck = true;

  var dateTime = d.toFormat("YYYY-MM-DD HH24:MI:SS");
  var urlDate = d.toFormat("YYYY-MM-DD");
  var time = 'B';

  console.log(dateTime + ' 학식정보 업데이트 시작');

  var urlR = 'https://www.smu.ac.kr/ko/life/restaurantView.do?srMealCategory=' + time + '&srDt=' + urlDate;
  var urlT = 'https://www.smu.ac.kr/ko/life/restaurantView2.do?srMealCategory=L&srDt=' + urlDate;


  client.fetch(urlR, function (err, $, res) {
    //조식에 있는지 확인
    if (err) {
      console.log(err);
      return;
    }

    //조식이 있다면 잘못 작성된 것이지만 일단 추가
    var eatR;
    if ($('.menu-list-box td .s-dot').length > 0) {
      eatR = new Array();  
      bcheck = false;

      var eatDate = $('.menu-tab-box > div > p').text().split('~')[0].trim().replace(/[^0-9.]/g, '').split('.');
      var year = parseInt(eatDate[0])
      var month = parseInt(eatDate[1])
      var date = parseInt(eatDate[2])

      eatDate = new Date(year, month - 1, date);
      for (var idx = 0; idx < 5; idx++) {
        eatR[idx] = new Array();
        eatR[idx][0] = eatDate.toFormat("YYYY-MM-DD");
        eatDate.setDate(eatDate.getDate() + 1);

        eatR[idx][1] = 'R';
        eatR[idx][2] = new Array();
        eatR[idx][2][0] = '=====중식====='
      }

      $('.menu-list-box tr').each(function () {
        if ($(this).find('th').text().indexOf('오늘') != -1) { //tr이 오늘의 메뉴라면
          $(this).find('.s-dot').each(function (idx) {
            eatR[idx][2][0] += '\n\n[오늘의 메뉴]\n'
            $(this).find('li').each(function () {
              eatR[idx][2][0] += $(this).text().trim() + '\n';
            })

            eatR[idx][2][0] = eatR[idx][2][0].trim(); //공백제거
          })
        } else {
          $(this).find('.s-dot').each(function (idx) {
            eatR[idx][2][0] += '\n\n[뷔페식 메뉴]\n'
            $(this).find('li').each(function () {
              eatR[idx][2][0] += $(this).text().trim() + '\n';
            })
            eatR[idx][2][0] = eatR[idx][2][0].trim();
          })
        }
      });
    }
    
    //진짜 중식 추가
    time = 'L'
    urlR = 'https://www.smu.ac.kr/ko/life/restaurantView.do?srMealCategory=' + time + '&srDt=' + urlDate;

    client.fetch(urlR, function (err, $, res) {
      if (err) {
        console.log(err);
        return;
      }

      if ($('.menu-list-box td .s-dot').length > 0) {
        if (bcheck) { //조식에 아무런 정보가 없었다면 전체 실행
          eatR = new Array();
          bcheck = false;

          var eatDate = $('.menu-tab-box > div > p').text().split('~')[0].trim().replace(/[^0-9.]/g, '').split('.');
          var year = parseInt(eatDate[0])
          var month = parseInt(eatDate[1])
          var date = parseInt(eatDate[2])

          eatDate = new Date(year, month - 1, date);
          
          if($('.menu-list-box td .s-dot').length > 10)  //다음주에 적어야하는데 이번주에 적은 상황에
            eatDate.setDate(eatDate.getDate() + 7)

          for (var idx = 0; idx < 5; idx++) {
            eatR[idx] = new Array();
            eatR[idx][0] = eatDate.toFormat("YYYY-MM-DD");
            eatDate.setDate(eatDate.getDate() + 1);

            eatR[idx][1] = 'R';
            eatR[idx][2] = new Array();
            eatR[idx][2][0] = '=====중식====='
          }

          $('.menu-list-box tr').each(function (tridx) {
            if($('.menu-list-box tr').length>3 && tridx<3)
              return true;

            if ($(this).find('th').text().indexOf('오늘') != -1) { //tr이 오늘의 메뉴라면
              $(this).find('.s-dot').each(function (idx) {
                eatR[idx][2][0] += '\n\n[오늘의 메뉴]\n'
                $(this).find('li').each(function () {
                  eatR[idx][2][0] += $(this).text().trim() + '\n';
                })

                eatR[idx][2][0] = eatR[idx][2][0].trim(); //공백제거
              })
            } else {
              $(this).find('.s-dot').each(function (idx) {
                eatR[idx][2][0] += '\n\n[뷔페식 메뉴]\n'
                $(this).find('li').each(function () {
                  eatR[idx][2][0] += $(this).text().trim() + '\n';
                })
                eatR[idx][2][0] = eatR[idx][2][0].trim();
              })
            }
          });
        } else { //중식정보가 이미 추가되어 있다면 부분 실행
          $('.menu-list-box tr').each(function () {
            if ($(this).find('th').text().indexOf('오늘') != -1) { //tr이 오늘의 메뉴라면
              $(this).find('.s-dot').each(function (idx) {
                eatR[idx][2][0] += '\n\n[오늘의 메뉴]\n'
                $(this).find('li').each(function () {
                  eatR[idx][2][0] += $(this).text().trim() + '\n';
                })

                eatR[idx][2][0] = eatR[idx][2][0].trim(); //공백제거
              })
            } else {
              $(this).find('.s-dot').each(function (idx) {
                eatR[idx][2][0] += '\n\n[뷔페식 메뉴]\n'
                $(this).find('li').each(function () {
                  eatR[idx][2][0] += $(this).text().trim() + '\n';
                })
                eatR[idx][2][0] = eatR[idx][2][0].trim();
              })
            }
          });
        }
      } else {
        console.log("R관 중식 학식정보 없음");
      }

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
            if($('.menu-list-box td .s-dot').length > 5 && idx < 5)
            return true;
          if($('.menu-list-box td .s-dot').length > 5 && idx >= 5)
            idx-=5;

            eatR[idx][2][1] = '=====석식=====\n'

            $(this).find('li').each(function () {
              eatR[idx][2][1] += $(this).text().trim() + '\n';
            })

            //중식 석식을 배열에 저장하여 이를 문자열화 시킨 후 DB에 저장한다.
            //(출력시 따로 출력하기 위해)
            eatR[idx][2][1] = eatR[idx][2][1].trim();
            eatR[idx][2] = JSON.stringify(eatR[idx][2]);
          });
        }else{
          console.log("R관 석식 학식정보 없음");
        }        
        
        if (eatR != undefined && eatR.length > 0) {
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
        } else {
          console.log("R관 학식정보 없음");
        }
      });
    });
  })



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
      
      if($('.menu-list-box td .s-dot').length > 5)  //다음주에 적어야하는데 이번주에 적은 상황에
        eatDate.setDate(eatDate.getDate() + 7)
      

      for (var idx = 0; idx < 5; idx++) {
        eatT[idx] = new Array();
        eatT[idx][0] = eatDate.toFormat("YYYY-MM-DD");
        eatDate.setDate(eatDate.getDate() + 1);
      }

      $('.menu-list-box td .s-dot').each(function (idx) {
        if($('.menu-list-box td .s-dot').length > 5 && idx < 5)   //다음주에 적어야하는데 이번주에 적은 상황에
          return true;
        if($('.menu-list-box td .s-dot').length > 5 && idx >= 5)    //다음주에 적어야하는데 이번주에 적은 상황에
          idx-=5;

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