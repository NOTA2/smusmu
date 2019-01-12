var client = require('cheerio-httpcli');

exports.search = function (keyword, page) {
  var url = 'http://www.smu.ac.kr/lounge/notice/notice.do';

  if (keyword.length > 0) //검색시
    var listUrl = url + '?mode=list&srSearchVal=' + keyword + '&articleLimit=10';
  else //평상시
    var listUrl = url + '?mode=list&articleLimit=10&article.offset=' + ((page - 1) * 10);

  listUrl = encodeURI(listUrl)

  return new Promise(function (resolve, reject) {
    client.fetch(listUrl, function (err, $, res) {
      if (err) {
        console.log(err);
        return;
      }
      var noticeObj;
      
      //게시판에 글이 존재 한다면 출력
      if ($(".board-thumb-content-wrap:not(.noti)").length > 0) {
        noticeObj = new Array();

        $(".board-thumb-content-wrap:not(.noti)").each(function(idx) {
          if($(this).find('.cmp.cheon').length)
            return true;

          noticeObj[idx] = new Object();

          var title = $(this).find('a').text().trim().split(']')
          title = title[title.length - 1].trim();
          
          var desc = '';  //clip

          if($(this).siblings('.list-file').length > 0)
            desc = '첨부파일 있음'

          noticeObj[idx].title = title.trim();
          noticeObj[idx].desc = desc.trim();

          var src = $(this).find('a').attr('href');
          noticeObj[idx].src = url + src;
        });
      } else {
        noticeObj = 'false';
      } 

      resolve(noticeObj);
    });
  });
}