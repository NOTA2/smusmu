var cheerio = require('cheerio');
var request = require('request');
var deasync = require('deasync');

exports.search = function() {
  return new Promise(function(resolve, reject) {
    urlt = "https://twitter.com/poltra02";    //트위터 주소
    urld = "http://www.smpa.go.kr/user/nd54882.do"     //상세정보를 얻기위한 서울지방 경찰청 주소
    var check = 0;
    var result = new Object();
    var d = new Date();
    result.check = false;
    result.str = '';

    request(urld, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);

        var today = (d.getFullYear()+'').substr(2,2) + ("00" + (d.getMonth() + 1)).slice(-2) + ("00" + d.getDate()).slice(-2);
        var boardNo = $("td.subject > a:contains('"+today+ "')").attr('href').split('\'');
        boardNo = boardNo[boardNo.length-2];

        request(urld+"?View&boardNo="+boardNo, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            //HTML body
            var $ = cheerio.load(body);

            if($(".reply-content > img").length){
              result.detail = 'http://www.smpa.go.kr/'+ $(".reply-content > img").attr("src");
            }
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
        var today = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

        //이미지가 있는 노드 찾기
        var ele = $(".content:contains('집') .AdaptiveMedia-photoContainer.js-adaptive-photo");

        if (ele.length) {
          //오늘 날자에 올라온 것인지 확인하기 위해서 time 변수 선언
          var time =  $(ele).parents(".AdaptiveMediaOuterContainer").siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
          time = parseInt(time.split(' ')[3]) + 1;

          if(d.getDate() != time){    //오늘 날짜에 올라온 것인지 판단
            result.check = false;     //아니라면 false를 저장
          } else{                   //오늘날짜에 올라온게 맞다면 아래를 수행

            //이미지가 있는 노드의 부모의 형제를 찾아감
            var str = $(ele).parents(".AdaptiveMediaOuterContainer").siblings(".js-tweet-text-container").text().trim();
            //이미지가 있는 노드의 자식인 img로 찾아감
            var imgurl = $(ele).find("img").attr("src")

            result.check = true;
            result.str = str.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl

            result.img = imgurl;

            if(result.detail != undefined)
              result.str+='\n\n[상세 정보 확인하기]\n'+ result.detail
          }
        }

        ele = $(".content:contains('공') .AdaptiveMedia-photoContainer.js-adaptive-photo");

        if (ele.length) {
          //오늘 날자에 올라온 것인지 확인하기 위해서 time 변수 선언
          var time =  $(ele).parents(".AdaptiveMediaOuterContainer").siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
          time = parseInt(time.split(' ')[3]) + 1;

          if(d.getDate() != time){    //오늘 날짜에 올라온 것인지 판단
            result.check = false;     //아니라면 false를 저장
          } else{                   //오늘날짜에 올라온게 맞다면 아래를 수행

            //이미지가 있는 노드의 부모의 형제를 찾아감
            var str2 = $(ele).parents(".AdaptiveMediaOuterContainer").siblings(".js-tweet-text-container").text().trim();
            //이미지가 있는 노드의 자식인 img로 찾아감
            var imgurl2 = $(ele).find("img").attr("src")

            result.check = true;
            result.str += '\n\n=============\n'
            result.str += '\n'+str2.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl2
          }
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
