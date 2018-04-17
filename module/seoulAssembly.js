var cheerio = require('cheerio');
var request = require('request');

exports.search = function() {
  return new Promise(function(resolve, reject) {
    url = "https://twitter.com/poltra02";

    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var result= new Array();
        //HTML body
        var $ = cheerio.load(body);
        strarr = $(".content:contains('집회') > .js-tweet-text-container").toArray();
        imgurl = $(".content:contains('집회') > .AdaptiveMediaOuterContainer > div > div > div > div > img").first();

        var d = new Date();
        today = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

        for(var i=0;i<strarr.length;i++){
          str=$(strarr[i]).text().trim();
          if(str.indexOf(today) != -1){
            rstr = str
            rimgurl = $(imgurl).attr("src");

            result = new Array();
            result.push(rstr.replace('#poltra','\n').replace('pic.', '\npic.') + '\n\n' + '[사진 크게 보기]\n'+rimgurl);
            result.push(rimgurl);
          }
        }
        
        resolve(result);
      }
    });

  });
}
