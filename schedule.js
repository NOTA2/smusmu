var CronJob = require('cron').CronJob;

var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);

var cEat = require('./crawling/crawling_Eat');
var chEat = require('./crawling/crawling_Eat_happy');
var kmaWeather = require('./crawling/weather');
var seoulAssembly = require('./crawling/seoulAssembly');
var calendar = require('./crawling/calendar');

(function () {
  new CronJob({
    cronTime: "00 10 9-11 * * 0-2",
    onTick: function () {
      cEat.search();
      chEat.search();
    },
    start: true,
    timeZone: 'Asia/Seoul',
    runOnInit: true
  });

  //학사일정정보 업데이트
  new CronJob({
    cronTime: "00 00 12 * * *",
    onTick: calendar.crawling,
    start: true,
    timeZone: 'Asia/Seoul',
    runOnInit: true
  });

  if (defaultObj.ipadd != '54.180.122.969') { //테스트 서버일 땐 하지 않습니다.
    new CronJob({
      cronTime: "00 43 * * * *",
      onTick: kmaWeather.search,
      start: true,
      timeZone: 'Asia/Seoul',
      runOnInit: true
    });
  }

  //집회정보 업데이트
  new CronJob({
    cronTime: "00 */5 0,6-8 * * *",
    onTick: seoulAssembly.search,
    start: true,
    timeZone: 'Asia/Seoul',
    runOnInit: true
  });
})();