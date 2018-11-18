var cheerio = require('cheerio');
var request = require('request');
var phantom = require('phantom');
var deasync = require('deasync');

exports.search = function() {

  var url = "https://hongje.happydorm.or.kr/hongje/60/6050.kmc";

  return new Promise(function(resolve, reject ) {
    var happyResult = new Object();
    happyResult.bt = new Array();
    happyResult.contents = new Array();

    var daystr = ['월', '화', '수', '목', '금', '토', '일'];
    var cnt = 0;
    var btcnt = 0;
    var temp = new Object();
    var test =0;

    do{
      var body = undefined;

      (async function() {         //phantom js 사용

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
            test++;
            if(test > 20){
              console.log(content);
              break;
            }
        }
        body = content;

        await instance.exit();
      })();

      while (body == undefined) {
        deasync.runLoopOnce();
      }

      var $ = cheerio.load(body);


      //버튼 생성
      $(".monday").each(function(idx, el) {
        temp = $(el).text().replace(/ /gi, "").trim();
        temp = temp.split('월');
        month = temp[0];
        date = temp[1].split('일')[0];

        happyResult.bt[btcnt++] = '홍제기숙사 - ' + ("00" + month).slice(-2) + '/' + ("00" + date).slice(-2) + ' (' + daystr[idx] + ')';
      });

      temp = makeContents($, happyResult, cnt, happyResult.bt);

      happyResult = temp.hR;
      cnt=temp.cn;

      //다음주 식단이 있는지 확인
      nextcheck = $(".btnnextfood").attr('onclick');
      nextcheck = nextcheck.indexOf('없습니다');
      if(nextcheck == -1){    // 없습니다 없으니까 다음주가 있는거
        nextweek = $(".btnnextfood").attr('onclick').split('\'')[1].split('\'')[0];
        url = 'https://hongje.happydorm.or.kr/hongje/food/getWMLastNext.kmc?sch_date=' + nextweek;
        console.log(url);
        console.log('다음주 것을 가져옵니다.');
      }
    }while(nextcheck == -1);  //다음주가 있으면 계속 실행


    happyResult.bt.unshift('뒤로가기');
    resolve(happyResult);
  });
}

function makeContents($, happyResult ,cnt, day){
  var jbAry = new Array();
  var temp = new Object();
  var tcnt = 0;

  $(".fmenu").each(function(idx, ulel) {
    str = '';
    $(ulel).children('li').each(function(idx, el){
      if(idx != 0)
        str += '\n';
      str += $(el).text().trim();
    })
    if(idx % 6 == 0)
      jbAry[idx - tcnt*3] = '[조식]\n' + str;
    else if(idx % 6 == 1)
      jbAry[idx - tcnt*3] = '[중식]\n' + str;
    else if(idx % 6 == 2)
      jbAry[idx - tcnt*3] = '[석식]\n' + str;
    else if(idx % 6 == 3)
      jbAry[idx - tcnt*3 -3] += '\n\n[빵식(Take-out)]\n' + str;
    else if(idx % 6 == 4)
      jbAry[idx - tcnt*3 -3] += '\n\n[샐러드/후식]\n' + str;
    else if(idx % 6 == 5){
      jbAry[idx - tcnt*3 -3] += '\n\n[샐러드/후식]\n' + str;
      tcnt++
    }

  });

  for(var idx =0;idx<jbAry.length;idx+=3,cnt++){
    happyResult.contents[cnt] = day[cnt] + '식단입니다.\n\n';
    happyResult.contents[cnt] += jbAry[idx];
    happyResult.contents[cnt] += "\n\n=================\n\n";
    happyResult.contents[cnt] += jbAry[idx+1];
    happyResult.contents[cnt] += "\n\n=================\n\n";
    happyResult.contents[cnt] += jbAry[idx+2];
  }

  temp.hR = happyResult;
  temp.cn = cnt;

  return temp;
}
