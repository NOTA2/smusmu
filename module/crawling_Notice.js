var cheerio = require('cheerio');
var request = require('request');
var GoogleURL = require('google-url');
var deasync = require('deasync');

var googleShortURLApikey = "AIzaSyBS0v_OtW7snmwlXe_qf04BLMsn_gw0i00";
googleUrl = new GoogleURL({
  key: googleShortURLApikey
});


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
          jbAry = new Array();
          $("#boardList").children().each(function(idx, el) {
            if(idx==4)
              return false; // break;

            //게시글 제목, URL 2개를 저장해야 되므로 각 요소에 2개의 배열 추가
            jbAry[idx] = new Array(2);

            title = $(el).children("a").children("strong").text().trim();
            title = title.split('\n')[2];

            jbAry[idx][0] = title.substring(8, title.length);
            longUrl = "http://www.smu.ac.kr/mbs/mobile/jsp/board/" + $(el).children("a").attr("href");

            googleUrl.shorten(longUrl, function(err, shortUrl) {
              jbAry[idx][1] = shortUrl.substring(8, result.length);
            });

            while (jbAry[idx][1] == undefined)
              deasync.runLoopOnce();

          });
        } else
          jbAry = '[등록된 게시물이 없습니다.]\n'

          console.log(jbAry);
        resolve(jbAry);
      }

    });
  });
}
