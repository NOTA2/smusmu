var cheerio = require('cheerio');
var request = require('request');

exports.search = function(keyword) {

  var url = "http://www.smu.ac.kr/mbs/smu/jsp/telephone/telephone_smuc_db2.jsp?id=smu_010903000000&spage=1&mode=3&search=" + encodeURIComponent(keyword)+"&x=0&y=0";

  return new Promise(function(resolve, reject) {
      request(url, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            //HTML body
            var $ = cheerio.load(body);

            var jbAry = new Array();
            var pnAry = new Array();
            pnAry[0] = new Array();
            pnAry[1] = new Array();

            if ($(".info_table_type3 > tbody > tr").length > 1) {
              $(".info_table_type3 >tbody > tr:nth-child(n+2)").each(function(i, v) {
                jbAry[i] = Array();
                $(this).children('td').each(function(j, vv) {
                  if(j==4)
                    return false;
                  jbAry[i][j] = $(this).text();
                  if(j == 3 && jbAry[i][j] == '')
                    jbAry[i][j] = '전화번호가 없습니다.'
                });
              });

              for(var i in jbAry){
                pnAry[0][i] = jbAry[i][0] + ' / ' + jbAry[i][1] + ' / ' + jbAry[i][2];
                pnAry[1][i] = jbAry[i][3];
              }
              resolve(pnAry);

            }
            else{
              resolve('검색결과가 없습니다.');
            }
          }
          });
      });
  }
