var cheerio = require('cheerio');
var request = require('request');


exports.crawling = function() {
  var url = "https://www.smu.ac.kr/mbs/smu/jsp/academic_calender/academic_calender.jsp?academicIdx=26499&id=smu_040200000000";

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        resultarr = new Array();

        //학사일정이 있는 월 리스트를 생성
        monthList = $("div.sub4_date > h3").toArray();
        for (var i = 0; i < monthList.length; i++) {
          monthList[i] = $(monthList[i]).text().trim();
        }
        monthList.unshift('뒤로가기')

        //학사일정 내용 배열 생성
        contentsList = new Array();

        $("table.sub4_inf").each(function() {
          var arrayOfThisRow = [];
          var tableData = $(this).find('td');
          if (tableData.length > 0) {
            tableData.each(function() {
              td = $(this).text().trim();
              td= td.replace(/\t/g, "");
              td= td.replace(/\n/g, "");

              if(td.indexOf('~') != -1){
                t1 = td.split('~')[0];
                t2 = td.split('~')[1];
                if(t1 == t2)
                 td = t1;
              }
              arrayOfThisRow.push(td);
            });
            contentsList.push(arrayOfThisRow);
          }
        });

        resultarr.push(monthList);
        resultarr.push(contentsList);

        resolve(resultarr);
      }

    });
  });
}
