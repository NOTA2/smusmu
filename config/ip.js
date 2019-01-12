module.exports = function (defaultObj) {
  const request = require('request');
  const deasync = require('deasync');

  (function () {
    request("http://169.254.169.254/latest/meta-data/public-ipv4", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        defaultObj.ipadd = body
        if (defaultObj.ipadd == '54.180.122.96')
          console.log(defaultObj.ipadd + ' 테스트 서버');
        else
          console.log(defaultObj.ipadd + ' 리얼 서버');
      }
    });
    while (defaultObj.ipadd == undefined) {
      deasync.runLoopOnce();
    }
  })();

  return defaultObj;
}