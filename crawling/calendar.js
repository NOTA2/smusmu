var cheerio = require('cheerio');
var phantom = require('phantom');
var conn = require('../config/db');
var async = require('async');

exports.crawling = function () {

  var url = "https://www.smu.ac.kr/ko/life/academicCalendar.do?mode=list";
  var body = undefined;
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");
  var test = 0;

  //phantom을 사용하여 크롤링
  console.log(time + ' 학사정보 업데이트 시작!!!');

  (async function () { //phantom js 사용

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.on('onResourceRequested', function (requestData) {});
    const status = await page.open(url);
    var content = await page.property('content');

    var $ = cheerio.load(content);

    while ($('.smu-table.pd-b-con > tbody > tr > td').length == 0) {
      console.log("학사정보 리로드");

      await instance.exit();
      const instance = await phantom.create();
      const page = await instance.createPage();
      await page.on('onResourceRequested', function (requestData) {});
      const status = await page.open(url);

      var content = await page.property('content');
      $ = cheerio.load(content);
      test++;
      if (test > 20) {
        console.log(content);
        break;
      }
    }
    body = content;

    //크롤링 후 데이터 정리
    var $ = cheerio.load(body);
    if ($('.smu-table.pd-b-con > tbody > tr > td').length > 0) {
      var params = new Array();

      var idx = 0;
      var month;

      $(".smu-table.pd-b-con > tbody > tr > td").each(function () {

        td = $(this).text().trim();
        td = td.replace(/\t/g, "").replace(/\n/g, "");

        if (td.indexOf('년') != -1 && td.indexOf('월') != -1) {
          month = td;
        } else if (td.indexOf(' ~ ') != -1) { //기간인 경우
          if (td.split(' ~ ')[0] == td.split(' ~ ')[1])
            td = td.split(' ~ ')[0];
          params[idx] = new Array();
          params[idx][0] = month;
          params[idx][1] = td;    //date 추가
        } else { //행사명인경우
          td = $(this).find('a').text().trim();
          params[idx][2] = td;      //content 추가
          idx++;
        }
      });

      var month = params.map(x => x[0]);
      var date = params.map(x => x[1]);
      var contents = params.map(x => x[2]);

      // var rowslength = 0;
      var sql = `
    INSERT INTO academicCalendar (month, date, content)
    SELECT * FROM (SELECT ?) AS tmp
    WHERE NOT EXISTS (
        SELECT month, date, content FROM academicCalendar WHERE month=? AND date =? AND content = ? 
    ) LIMIT 1;`


      async.forEachOf(params, function (param, i, inner_callback) {
        conn.query(sql, [param, month[i], date[i], contents[i]], function (err, rows) {
          if (!err) {
            // rowslength += rows.affectedRows
            inner_callback(null);
          } else {
            console.log("Error while performing Query");
            inner_callback(err);
          };
        });
      }, function (err) {
        if (err) {
          throw err
        } else {
          console.log("학사정보 업데이트 완료");
        }
      });
    } else {
      console.log('학사정보 읽기 실패');
    }
    await instance.exit();
  })();
}