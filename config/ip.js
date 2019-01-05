module.exports = function(defaultObj){
  const cheerio = require('cheerio');
  const request = require('request');
  const deasync = require('deasync');

  (function (){
    request("http://169.254.169.254/latest/meta-data/public-ipv4", function(error, response, body) {
      if (!error && response.statusCode == 200) {
        defaultObj.ipadd  = body
        console.log(defaultObj.ipadd);
        console.log('스뮤스뮤 서버');
      }
    });
    while (defaultObj.ipadd == undefined) {
      deasync.runLoopOnce();
    }
  })();

  return defaultObj;
}
