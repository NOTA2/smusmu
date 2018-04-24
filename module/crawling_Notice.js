var cheerio = require('cheerio');
var request = require('request');

const NTCLR= 31;
const NTCLS= 33;

exports.search = function(keyword, page, mode, realkeyword) {
  var url;

  if (mode == NTCLR)
    url = "http://www.smu.ac.kr/mbs/mobile/jsp/board/list.jsp?id=mobile_050100000000&boardId=14446&spage="+page;
  else
    url = "http://www.smu.ac.kr/mbs/mobile/jsp/board/list.jsp?boardId=14446&spage="+page+"&listType=01&id=mobile_050100000000&column=TOTAL&search=" + encodeURIComponent(realkeyword);


  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var noticeObj;

        //게시판에 글이 존재 한다면 출력
        if ($("#boardList > li > a").length > 0) {
          //배열로 초기화
          noticeObj = new Object();

          noticeObj.bt = new Array();
          noticeObj.contents = new Array();

          $("#boardList").children().each(function(idx, el) {
            noticeObj.contents[idx] = new Object();

            if(idx==10)
              return false; // break;

            titlestr = $(el).children("a").children("strong").text().trim().split('\n')[2];

            noticeObj.contents[idx].title = titlestr.substring(8, titlestr.length);   //배열에 제목 추가
            noticeObj.contents[idx].mobile = "http://www.smu.ac.kr/mbs/mobile/jsp/board/" + $(el).children("a").attr("href");
            noticeObj.contents[idx].pc = "https://www.smu.ac.kr/mbs/smu/jsp/board/" + $(el).children("a").attr("href").replace('mobile_050100000000','smu_040100000000')

          });

          for(idx in noticeObj.contents){
            noticeObj.bt[idx] = noticeObj.contents[idx].title;
          }

          noticeObj.page = page;
          noticeObj.mode = mode;
          noticeObj.keyword = realkeyword;

          if($(".prev").attr('href').indexOf('없습니다.') == -1)
            noticeObj.bt.unshift('<');
          if($(".next").attr('href').indexOf('없습니다.') == -1)
            noticeObj.bt.unshift('>');

        } else{
          noticeObj = '[등록된 게시물이 없습니다.]\n'
        }

        resolve(noticeObj);
      }

    });
  });
}
