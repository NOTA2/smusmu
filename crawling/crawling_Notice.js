var client = require('cheerio-httpcli');

exports.search = function (keyword, page) {
  var url = 'http://www.smu.ac.kr/lounge/notice/notice.do';

  if (keyword.length > 0) //검색시
    var listUrl = url + '?mode=list&srCampus=smu&srSearchVal=' + keyword + '&articleLimit=10';
  else //평상시
    var listUrl = url + '?mode=list&srCampus=smu&articleLimit=8&article.offset=' + ((page - 1) * 8);

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

        $(".board-thumb-content-wrap:not(.noti) dt a").each(function(idx) {
          noticeObj[idx] = new Object();

          var title = $(this).text().trim().split(']')
          
          title = title[title.length - 1].trim();

          var titleArr = title.split(' ');
          title = '';
          var desc = '';
          var check = true

          titleArr.forEach((el, idx) => {
            // if (check && (title + el + ' ').length < 20)
              title += el + ' ';
            // else{
            //   desc += el + ' ';
            //   check = false
            // }
          })
          noticeObj[idx].title = title.trim();
          noticeObj[idx].desc = desc.trim();

          var src = $(this).attr('href');
          noticeObj[idx].src = url + src;
        });
      } else {
        noticeObj = 'false';
      } 

      resolve(noticeObj);
    });
  });
}