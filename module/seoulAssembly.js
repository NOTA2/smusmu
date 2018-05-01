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
    result.detail = '';
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

            $(".reply-content > img").each(function(idx, el){
              result.detail += '\n['+idx+'] : ' + 'http://www.smpa.go.kr/'+ $(el).attr("src");
            });

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
        d.setDate(d.getDate() - 1);
        var today = d.getDate();


        ele = $(".AdaptiveMediaOuterContainer");

        $(ele).each(function(idx, el){
          var time =  $(el).siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
          time = parseInt(time.split(' ')[3]);
          temptext = $(el).siblings(".js-tweet-text-container").text().replace(/ /gi, "").replace(/\t/g, "").replace(/\n/g, "");

          if(today != time){    //오늘 날짜에 올라온 것인지 판단
              return true;
          }

          //이미지가 있는 노드의 부모의 형제를 찾아감
          var str = $(el).siblings(".js-tweet-text-container").text().trim();
          //이미지가 있는 노드의 자식인 img로 찾아감
          var imgurl = $(el).find("img").attr("src")

          if(result.check)
            result.str += '\n\n=============\n\n'
          result.str += str.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl
          if(temptext.indexOf('집회') != -1 || temptext.indexOf('집 회') != -1){
            result.img = imgurl;
            if(result.detail != '')
              result.str+='\n\n[상세 정보 확인하기]'+ result.detail
          }
          result.check = true;
        })

        //
        // $(ele).each(function(idx, el){
        //   //오늘 날자에 올라온 것인지 확인하기 위해서 time 변수 선언
        //   var time =  $(el).siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
        //   time = parseInt(time.split(' ')[3]) + 1;
        //
        //   temptext = $(el).siblings(".js-tweet-text-container").text().replace(/ /gi, "").replace(/\t/g, "").replace(/\n/g, "");
        //
        //   if(d.getDate() != time){    //오늘 날짜에 올라온 것인지 판단
        //     return true;
        //   } else if(temptext.indexOf('집회') != -1){
        //     return true;
        //   }else{                   //오늘날짜에 올라온게 맞다면 아래를 수행
        //     console.log('공사정보 업데이트');
        //     //이미지가 있는 노드의 부모의 형제를 찾아감
        //     var str2 = $(el).siblings(".js-tweet-text-container").text().trim();
        //     //이미지가 있는 노드의 자식인 img로 찾아감
        //     var imgurl2 = $(el).find("img").attr("src")
        //
        //     result.check = true;
        //     result.str += str2.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl2
        //     result.img = imgurl2;
        //   }
        // });
        //
        //
        // //이미지가 있는 노드 찾기
        // var ele = $(".content:contains('집') .AdaptiveMediaOuterContainer");
        //
        // $(ele).each(function(idx, el){
        //   //오늘 날자에 올라온 것인지 확인하기 위해서 time 변수 선언
        //   var time =  $(el).siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
        //   time = parseInt(time.split(' ')[3]) + 1;
        //   temptext = $(el).siblings(".js-tweet-text-container").text().replace(/ /gi, "").replace(/\t/g, "").replace(/\n/g, "");
        //   if(d.getDate() != time){    //오늘 날짜에 올라온 것인지 판단
        //     return true;
        //   } else if(temptext.indexOf('공사') != -1){
        //     return true;
        //   }else{                   //오늘날짜에 올라온게 맞다면 아래를 수행
        //     console.log('집회정보 업데이트');
        //     //이미지가 있는 노드의 부모의 형제를 찾아감
        //     var str = $(el).siblings(".js-tweet-text-container").text().trim();
        //     //이미지가 있는 노드의 자식인 img로 찾아감
        //     var imgurl = $(el).find("img").attr("src")
        //
        //
        //
        //     result.check = true;
        //     result.str += str.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+imgurl
        //
        //     result.img = imgurl;
        //
        //
        //   }
        // });
        //



        check++;
      }
    });

    while (check != 2) {
      deasync.runLoopOnce();
    }

    resolve(result);
  });
}
