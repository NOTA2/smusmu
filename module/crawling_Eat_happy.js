var cheerio = require('cheerio');
var request = require('request');
var phantom = require('phantom');
var deasync = require('deasync');

exports.search = function() {

  var url = "https://hongje.happydorm.or.kr/hongje/60/6050.kmc";

  return new Promise(function(resolve, reject ) {
    var body;

    (async function() {
      const instance = await phantom.create();
      const page = await instance.createPage();
      await page.on('onResourceRequested', function(requestData) {
      });
      const status = await page.open(url);
      var content = await page.property('content');
      var $ = cheerio.load(content);

      while($('#fo_menu_mor1 > li').length == 0) {
          console.log("홍제 행복기숙사 리로드");
          var content = await page.property('content');
          $ = cheerio.load(content);
      }

      body = content;
      await instance.exit();
    })();

    while (body == undefined) {
      deasync.runLoopOnce();
    }
    var $ = cheerio.load(body);

    var jbAry = new Array();
    var happyResult = new Array();
    var cnt = 0;

    $(".fmenu").each(function(idx, ulel) {
      str = '';
      $(ulel).children('li').each(function(idx, el){
        if(idx != 0)
          str += '\n';
        str += $(el).text().trim();
      })
      if(idx % 6 == 0)
        jbAry[idx - cnt*3] = '[조식]\n' + str;
      else if(idx % 6 == 1)
        jbAry[idx - cnt*3] = '[중식]\n' + str;
      else if(idx % 6 == 2)
        jbAry[idx - cnt*3] = '[석식]\n' + str;
      else if(idx % 6 == 3)
        jbAry[idx - cnt*3 -3] += '\n\n[빵식(Take-out)]\n' + str;
      else if(idx % 6 == 4)
        jbAry[idx - cnt*3 -3] += '\n\n[샐러드/후식]\n' + str;
      else if(idx % 6 == 5){
        jbAry[idx - cnt*3 -3] += '\n\n[샐러드/후식]\n' + str;
        cnt++
      }

    });

    for(var idx =0, cnt = 0;idx<jbAry.length;idx+=3,cnt++){
      happyResult[cnt] = jbAry[idx];
      happyResult[cnt] += "\n\n=================\n\n";
      happyResult[cnt] += jbAry[idx+1];
      happyResult[cnt] += "\n\n=================\n\n";
      happyResult[cnt] += jbAry[idx+2];
    }

    resolve(happyResult);
  });
}
