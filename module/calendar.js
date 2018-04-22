var cheerio = require('cheerio');
var request = require('request');


exports.crawling = function() {
  var url = "https://www.smu.ac.kr/mbs/smu/jsp/academic_calender/academic_calender.jsp?academicIdx=26499&id=smu_040200000000";

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        calresultObj = new Object();
        calresultObj.monthbt = new Array();
        resultarr = new Array();

        //학사일정이 있는 월 리스트를 생성
        calresultObj.monthbt.push('뒤로가기');
        $("div.sub4_date > h3").each(function() {
          monthstr = $(this).text().trim();
          monthstr = monthstr.substring(0, monthstr.length-1);
          monthstr = monthstr.split('년 ')[0] + '년 ' + ("00" + (monthstr.split('년 ')[1])).slice(-2)+'월';

          calresultObj.monthbt.push(monthstr);
        });

        //학사일정 내용 배열 생성
        calresultObj.contents = new Array();
        var idx = 0;

        $("table.sub4_inf").find('td').each(function() {    //12개월을 구분하기 위해


          td = $(this).text().trim();
          td= td.replace(/\t/g, "").replace(/\n/g, "");

          if(td.indexOf('~') != -1){    //기간인 경우
            calresultObj.contents[idx] = new Object();
            if(td.split('~')[0] == td.split('~')[1])
             td = td.split('~')[0];

            calresultObj.contents[idx].date = td;
           }else{
             calresultObj.contents[idx].content = td;
             idx++;
           }
        });

        resolve(calresultObj);
      }

    });
  });
}
