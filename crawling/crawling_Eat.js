var cheerio = require('cheerio');
var request = require('request');
var deasync = require('deasync');

exports.search = function(keyword) {

  var url;

  if (keyword == '미래백년관 - ')
    url = "https://www.smu.ac.kr/mbs/smu/jsp/restaurant/restaurant.jsp?configIdx=27144&id=smu_040501000000";
  else
    url = "https://www.smu.ac.kr/mbs/smu/jsp/restaurant/restaurant.jsp?configIdx=27145&id=smu_040501020000";

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var eatObj = new Object();
        var tempArr = new Array();
        eatObj.bt = new Array();
        eatObj.contents = new Array();
        var tableCheck = $("table").hasClass("info_table_type11");

        // 식단이 나타나는 테이블의 존재 유무를 따져서 식단이 존재하는지 검사
        while (tableCheck == false) {
          var requestCheck = 0;

          thisweekmon = $("#subContents > div:nth-child(5)").text().replace(/ /gi, "").replace('▶', '').replace('◀', '').split('-');
          thisweekmon = thisweekmon[0] + '-' + thisweekmon[1] + '-' + thisweekmon[2];
          var d = new Date(thisweekmon.trim());

          var rday = d.setDate(d.getDate() - 7)
          rday = d.toFormat("YYYY-MM-DD");

          var rurl = url + '&firstWeekDay=' + rday;

          request(rurl, function(error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(keyword + '저번주로 재접속' + rday);
              //HTML body
              $ = cheerio.load(body);
              tableCheck = $("table").hasClass("info_table_type11");
              requestCheck = 1;
            }
          });
          while (requestCheck == 0) {
            deasync.runLoopOnce();
          }
        }

        $(".th_type2").each(function(idx, el) {
          temp = $(el).text().trim();
          temp = temp.split('.');
          month = temp[0];
          date = temp[1].split(' ')[0];
          day = temp[1].split(' ')[1];
          eatObj.bt[idx] = keyword + ("00" + month).slice(-2) + '/' + ("00" + date).slice(-2) + ' ' + day;
        });

        var regex = /<br\s*[\/]?>/gi;

        $(".subj").each(function(idx, el) {
          var str = $(el).html();
          var el_clone = $(el).html(str.replace(regex, "\n"));
          tempArr[idx] = $(el_clone).text().trim();
        });


        var temp = '';


        for (i = 0; i < 5; i++) {
          day = i;

          temp += eatObj.bt[i]+ '식단입니다.\n\n';
          if (keyword == '미래백년관 - ') {
            day *= 4;
            temp += '======중식======\n';
            temp += '[뷔페식]\n';
            temp += tempArr[day];
            temp += '\n\n[오늘의 메뉴]\n';
            temp += tempArr[day + 1];
            temp += '\n\n======석식======\n';
            temp += tempArr[day + 3];
          } else {
            day *= 2;
            temp += '======중식======\n';
            temp += tempArr[day];
            temp += '\n\n[후식] : ';
            temp += tempArr[day + 1];
          }
          eatObj.contents[i] = temp;
          temp = '';
        }

        eatObj.bt.unshift('뒤로가기');
        resolve(eatObj);
      }
    });
  });
}
