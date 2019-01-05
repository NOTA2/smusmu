var cheerio = require('cheerio');
var request = require('request');
var defaultObj = require('../config/defaultVariable');

exports.search = function(keyword, page) {
  var url = 'http://www.smu.ac.kr/lounge/notice/notice.do';

  if(page == undefined)
    page = 1;

  //평상시
    url += '?mode=list&srCampus=smu&srSearchVal=&articleLimit=5&article.offset='+((page-1)*5);
  
  //검색시
  if(search)
    url += '?mode=list&srCampus=smu&srSearchVal='+ keyword +'&articleLimit=5&article.offset='+((page-1)*5);


  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var noticeObj;

        //게시판에 글이 존재 한다면 출력
        if ($(".board-thumb-content-wrap:not(.notice)").length > 0) {
          noticeObj = new Object();
          console.log($(this).find('a').not('span').text().trim);


          //배열로 초기화
          // noticeObj = new Object();

          // noticeObj.bt = new Array();
          // noticeObj.contents = new Array();

          // $("#boardList").children().each(function(idx, el) {
          //   noticeObj.contents[idx] = new Object();

          //   if(idx==10)
          //     return false; // break;

          //   titlestr = $(el).children("a").children("strong").text().trim().split('\n')[2];

          //   noticeObj.contents[idx].title = titlestr.substring(8, titlestr.length);   //배열에 제목 추가
          //   noticeObj.contents[idx].mobile = "http://www.smu.ac.kr/mbs/mobile/jsp/board/" + $(el).children("a").attr("href");
          //   noticeObj.contents[idx].pc = "https://www.smu.ac.kr/mbs/smu/jsp/board/" + $(el).children("a").attr("href").replace('mobile_050100000000','smu_040100000000')

          // });

          // for(idx in noticeObj.contents){
          //   noticeObj.bt[idx] = noticeObj.contents[idx].title;
          // }

          // noticeObj.page = page;
          // noticeObj.mode = mode;
          // noticeObj.keyword = realkeyword;

          // if($(".prev").attr('href').indexOf('없습니다.') == -1)
          //   noticeObj.bt.unshift('<');
          // if($(".next").attr('href').indexOf('없습니다.') == -1)
          //   noticeObj.bt.unshift('>');

        } else{
          noticeObj = '[등록된 게시물이 없습니다.]\n'
        }

        resolve(noticeObj);
      }

    });
  });
}
