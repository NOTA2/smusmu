module.exports = function(defaultObj){
  const cheerio = require('cheerio');
  const request = require('request');
  const deasync = require('deasync');

  (function (){
    request("http://169.254.169.254/latest/meta-data/public-ipv4", function(error, response, body) {
      if (!error && response.statusCode == 200) {
        defaultObj.ipadd  = body
      }
    });
    while (defaultObj.ipadd == undefined) {
      deasync.runLoopOnce();
    }
    if(defaultObj.ipadd ==  '52.78.69.176'){
      console.log(defaultObj.ipadd);
      defaultObj.mainstr = '공가미 사용하기';
      defaultObj.firstmsg = '원하는 버튼을 선택해주세요.';
      defaultObj.explanation = '상명대(서울) 공대 학우들을 위한 정보!\n공가미입니다.\n\n' + defaultObj.explanation;
      console.log('공가미 서버');
    }
    else{
      console.log(defaultObj.ipadd);
      defaultObj.mainstr = '스뮤스뮤 사용하기';
      defaultObj.firstmsg = '원하는 버튼을 선택해주스뮤!';
      defaultObj.explanation = '상명대(서울) 학우들을 위한 정보!\n스뮤스뮤입니다.\n\n' + defaultObj.explanation;
      console.log('스뮤스뮤 서버');
    }
  })();

  return defaultObj;
}
