var cheerio = require('cheerio');
var request = require('request');


exports.search = function(keyword) {
  var url;

  if (keyword == '최근 글 보기')
    url = "http://www.smu.ac.kr/mbs/mobile/jsp/board/list.jsp?id=mobile_050100000000&boardId=14446";
  else
    url = "http://www.smu.ac.kr/mbs/mobile/jsp/board/list.jsp?boardId=14446&spage=1&listType=01&id=mobile_050100000000&column=TOTAL&search=" + encodeURIComponent(keyword);

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var jbAry;

        //게시판에 글이 존재 한다면 출력
        if ($("#boardList > li > a").length > 0) {
          //배열로 초기화
          jbAry = new Array(3);
          //제목 배열만 따로 빼야되기 때문에 이런식으로 배열을 구성함
          jbAry[0] = new Array(); //제목만 있는 배열
          jbAry[1] = new Array(); //모바일 url만 있는 배열
          jbAry[2] = new Array(); //PC url만 있는 배열

          $("#boardList").children().each(function(idx, el) {
            if(idx==10)
              return false; // break;

            title = $(el).children("a").children("strong").text().trim();
            title = title.split('\n')[2];   //제목 앞뒤로 짜름

            jbAry[0][idx] = title.substring(8, title.length);   //배열에 제목 추가
            longUrl = "http://www.smu.ac.kr/mbs/mobile/jsp/board/" + $(el).children("a").attr("href");
            longUrl2 = "https://www.smu.ac.kr/mbs/smu/jsp/board/" + $(el).children("a").attr("href").replace('mobile_050100000000','smu_040100000000')
            jbAry[1][idx] = longUrl;
            jbAry[2][idx] = longUrl2;



          });
        } else
          jbAry = '[등록된 게시물이 없습니다.]\n'

        resolve(jbAry);
      }

    });
  });
}
