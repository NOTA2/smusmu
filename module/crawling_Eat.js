var cheerio = require('cheerio');
var request = require('request');

exports.search = function(keyword) {

  var url;
  if(keyword=='R')
    url = "https://www.smu.ac.kr/mbs/smu/jsp/restaurant/restaurant.jsp?configIdx=27144&id=smu_040501000000";
  else
    url = "https://www.smu.ac.kr/mbs/smu/jsp/restaurant/restaurant.jsp?configIdx=27145&id=smu_040501020000";

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var jbAry = new Array();

        // 식단이 나타나는 테이블의 존재 유무를 따져서 식단이 존재하는지 검사
        if ($("table").hasClass("info_table_type11")) {
          $(".subj").each(function(idx, el) {
            jbAry[idx] = $(el).text().trim();
          });

          var temp='';
          var eatAry = new Array();

          for(i=0; i<5;i++){
            day=i;
            if(keyword=='R'){
              day*=4;
              temp+='======중식======\n';
              temp+='[뷔페식]\n';
              temp+=jbAry[day];
              temp+='\n\n[오늘의 메뉴]\n';
              temp+=jbAry[day+1];
              temp+='\n\n======석식======\n';
              temp+=jbAry[day+3];
            }
            else{
               day*=2;
               temp+='======중식======\n';
               temp+=jbAry[day];
               temp+='\n\n[후식] : ';
               temp+=jbAry[day+1];
             }
             eatAry[i]=temp;
             temp='';
          }
          resolve(eatAry);
        } else {  //식단이 등록되지 않았다면
          eatAry = new Array(5);
          for(i=0; i<eatAry.length;i++){
            eatAry[i] = '등록된 식단이 없습니다.';
          }
          resolve(eatAry);
        }
      }
    });
  });
}
