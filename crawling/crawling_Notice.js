var client = require('cheerio-httpcli');

exports.search = function (keyword, page, im, major) {
  var url = 'http://www.smu.ac.kr/lounge/notice/notice.do';
  var alimit = 10;
  var offset = ((page - 1) * alimit)

  if(major.state)
    url = `https://www.smu.ac.kr/${major.homepage}/community/notice.do`

  if (keyword.length > 0) //검색시
    var listUrl = url + '?mode=list&srSearchVal=' + keyword + '&articleLimit=' + alimit;
  else //평상시
    var listUrl = url + '?mode=list&articleLimit=' + alimit + '&article.offset=' + offset;
  
  listUrl = encodeURI(listUrl)

  return new Promise(function (resolve, reject) {
    client.fetch(listUrl, function (err, $, res) {
      if (err) {
        console.log(err);
        return;
      }
      var noticeObj;

      if (im) { //중요 공지사항인 경우
        if ($(".board-thumb-content-wrap.noti").length > 0) {
          noticeObj = new Array();

          $(".board-thumb-content-wrap.noti").each(function (idx) {
            if ($(this).find('.cmp.cheon').length)
              return true;

            if (idx > (page * alimit))
              return true;

            if (page > 1 && idx <= offset)
              return true;

            noticeObj[idx] = new Object();

            var title = $(this).find('a').clone().children().remove().end().text().trim()      //text().trim().split(']')
            // title = title[title.length - 1].trim();

            var desc = '게시일 : ' + $(this).find('.board-thumb-content-date').text().replace(/[^-0-9]/g,'').trim();
            
            if ($(this).siblings('.list-file').length > 0)
              desc += '\n첨부파일 있음'

            noticeObj[idx].title = title.trim();
            noticeObj[idx].desc = desc.trim();

            var src = $(this).find('a').attr('href');
            noticeObj[idx].src = url + src;
          });
        } else {
          noticeObj = 'false';
        }
      } else if (keyword.length > 0) { //검색하기일 경우

        if ($(".board-thumb-content-wrap").length > 0) {
          noticeObj = new Array();

          $(".board-thumb-content-wrap").each(function (idx) {
            if ($(this).find('.cmp.cheon').length)
              return true;

            if (noticeObj.filter(Boolean).length > alimit)
              return true;

            var title = $(this).find('a').clone().children().remove().end().text().trim()      //text().trim().split(']')
            // title = title[title.length - 1].trim();

            if ($(this).find('.noti').length && title.indexOf(keyword) == -1)
              return true;
            
            var desc = '게시일 : ' + $(this).find('.board-thumb-content-date').text().replace(/[^-0-9]/g,'').trim();
            
            if ($(this).siblings('.list-file').length > 0)
              desc += '\n첨부파일 있음'

            noticeObj[idx] = new Object();
            noticeObj[idx].title = title.trim();
            noticeObj[idx].desc = desc.trim();

            var src = $(this).find('a').attr('href');
            noticeObj[idx].src = url + src;
          });
        } else {
          noticeObj = 'false';
        }

      } else { //최근 공지사항일 경우
        //게시판에 글이 존재 한다면 출력
        if ($(".board-thumb-content-wrap:not(.noti)").length > 0) {
          noticeObj = new Array();

          $(".board-thumb-content-wrap:not(.noti)").each(function (idx) {
            if ($(this).find('.cmp.cheon').length)
              return true;

            noticeObj[idx] = new Object();

            var title = $(this).find('a').clone().children().remove().end().text().trim()      //text().trim().split(']')
            // title = title[title.length - 1].trim();

            var desc = '게시일 : ' + $(this).find('.board-thumb-content-date').text().replace(/[^-0-9]/g,'').trim();
            
            if ($(this).siblings('.list-file').length > 0)
              desc += '\n첨부파일 있음'

            noticeObj[idx].title = title.trim();
            noticeObj[idx].desc = desc.trim();

            var src = $(this).find('a').attr('href');
            noticeObj[idx].src = url + src;
          });
        } else {
          noticeObj = 'false';
        }
      }

      if (noticeObj.length == 0) {
        noticeObj = 'false'
      }
      resolve(noticeObj);
    });
  });
}