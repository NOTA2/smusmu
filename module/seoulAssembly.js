var cheerio = require('cheerio');
var request = require('request');
var deasync = require('deasync');

exports.search = function() {
  return new Promise(function(resolve, reject) {
    urlt = "https://twitter.com/poltra02";    //트위터 주소
    urld = "http://www.smpa.go.kr/user/nd54882.do"     //상세정보를 얻기위한 서울지방 경찰청 주소
    var check = 0;
    var result = new Object();
    result.check = false;


    request(urld, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var d = new Date();
        var today = (d.getFullYear()+'').substr(2,2) + ("00" + (d.getMonth() + 1)).slice(-2) + ("00" + d.getDate()).slice(-2);
        var boardNo = $("td.subject > a:contains('"+today+ "')").attr('href').split('\'');
        boardNo = boardNo[boardNo.length-2];

        request(urld+"?View&boardNo="+boardNo, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            //HTML body
            var $ = cheerio.load(body);

            if($(".reply-content > img").length)
              result.detail = 'http://www.smpa.go.kr/'+ $(".reply-content > img").attr("src");
            check++;
          }
        });
      }
    });

    while (check != 1) {
      deasync.runLoopOnce();
    }

    request(urlt, function(error, response, body) {
      if (!error && response.statusCode == 200) {

        //HTML body
        var $ = cheerio.load(body);
        var d = new Date();
        var today = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

        var ele = $(".content:contains('집회') > .js-tweet-text-container:contains('"+today+ "')");

        if (ele.length) {
          strarr = $(ele).text().trim();
          imgurl = $(".content:contains('집회') > .js-tweet-text-container:contains('"+today+ "')").siblings(".AdaptiveMediaOuterContainer").find('img').attr("src")

          result.check = true;
          result.str = strarr.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl

          if(result.detail != undefined)
            result.str+='\n\n[상세 정보 확인하기]\n'+ result.detail

          result.img = imgurl;
        }
        check++;
      }
    });



    while (check != 2) {
      deasync.runLoopOnce();
    }

    resolve(result);
  });
}
