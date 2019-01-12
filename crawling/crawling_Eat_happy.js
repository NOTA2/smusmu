var cheerio = require('cheerio');
var phantom = require('phantom');
var deasync = require('deasync');
var conn = require('../config/db')();
var async = require('async');

exports.search = function () {

  var d = new Date();
  var url = "https://hongje.happydorm.or.kr/hongje/60/6050.kmc";
  //일요일 일 경우 월요일로 바꿔서 다음주 메뉴 가져오기
  if (d.getDay() == 0) {
    d.setDate(d.getDate() + 1);
    url = 'https://hongje.happydorm.or.kr/hongje/food/getWMLastNext.kmc?sch_date=' + d.toFormat("YYYY-MM-DD");
  }
  var test = 0;

  var body = undefined;

  (async function () { //phantom js 사용

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.on('onResourceRequested', function (requestData) {});
    const status = await page.open(url);
    var content = await page.property('content');
    var $ = cheerio.load(content);

    while ($('#fo_menu_mor1 > li').length == 0) {
      console.log("홍제 행복기숙사 리로드");
      var content = await page.property('content');
      $ = cheerio.load(content);
      test++;
      if (test > 20) {
        console.log(content);
        break;
      }
    }
    body = content;

    var $ = cheerio.load(body);
    if ($('.fmenu.iconbuf li').length > 0) {
      var eatH = new Array();

      //첫 날짜 구하기
      var date = $(".monday:nth-child(1)").text().replace(/ /gi, "").trim();
      var year = d.getFullYear();
      if ((month == 12) && (d.getMonth() + 1 != month))
        year = parseInt(year) - 1
      var month = parseInt(date.split('월')[0]) - 1;
      var day = parseInt(date.split('월')[1]);

      eatDate = new Date(year, month, day);

      $('.monday').each(function (idx) {
        eatH[idx] = new Array();
        eatH[idx][0] = eatDate.toFormat("YYYY-MM-DD");
        eatDate.setDate(eatDate.getDate() + 1);
      })

      var tcnt = 0;
      var temp = new Array();

      $(".fmenu").each(function (idx, ulel) {
        var str = '';
        $(ulel).children('li').each(function (idx, el) {
          if (idx != 0)
            str += '\n';
          str += $(el).text().trim();
        })
        if (idx % 6 == 0)
          temp[idx - tcnt * 3] = '=====조식=====\n' + str;
        else if (idx % 6 == 1)
          temp[idx - tcnt * 3] = '=====중식=====\n' + str;
        else if (idx % 6 == 2)
          temp[idx - tcnt * 3] = '=====석식=====\n' + str;
        else if (idx % 6 == 3)
          temp[idx - tcnt * 3 - 3] += '\n\n[빵식(Take-out)]\n' + str;
        else if (idx % 6 == 4)
          temp[idx - tcnt * 3 - 3] += '\n\n[샐러드/후식]\n' + str;
        else if (idx % 6 == 5) {
          temp[idx - tcnt * 3 - 3] += '\n\n[샐러드/후식]\n' + str;
          tcnt++
        }
      });

      for (var idx = 0, cnt = 0; idx < temp.length; idx += 3, cnt++) {
        eatH[cnt][1] = 'H';
        eatH[cnt][2] = new Array();
        eatH[cnt][2].push(temp[idx]);
        eatH[cnt][2].push(temp[idx + 1]);
        eatH[cnt][2].push(temp[idx + 2]);
        eatH[cnt][2] = JSON.stringify(eatH[cnt][2])
      }

      var date = eatH.map(x => x[0]);
      var location = eatH.map(x => x[1]);

      var sql = `
          INSERT INTO Eat (date, location, content)
          SELECT * FROM (SELECT ?) AS tmp
          WHERE NOT EXISTS (
              SELECT date, location FROM Eat WHERE date=? AND location =?
          ) LIMIT 1;`


      async.forEachOf(eatH, function (param, i, inner_callback) {
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
      console.log("홍제기숙사 학식정보 없음");
    }

    await instance.exit();
  })();
}