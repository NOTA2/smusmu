var CronJob = require('cron').CronJob;

var cEat = require('../crawling/crawling_Eat');
var chEat = require('../crawling/crawling_Eat_happy');
var kmaWeather = require('../crawling/weather');
var seoulAssembly = require('../crawling/seoulAssembly');
var calendar = require('../crawling/calendar');

module.exports = function () {
    var scheduleEat = new CronJob({
        cronTime: "00 10 9-11 * * 0-2",
        onTick: function () {
            cEat.search();
            chEat.search();
        },
        start: true,
        timeZone: 'Asia/Seoul',
        runOnInit: true
    });

    //학사정보 업데이트
    var scheduleCalendar = new CronJob({
        cronTime: "00 00 12 */10 0,1 *",
        onTick: calendar.crawling,
        start: true,
        timeZone: 'Asia/Seoul',
        runOnInit: true
    });

    // if (defaultObj.ipadd != '54.180.122.96') { //테스트 서버일 땐 하지 않습니다.
    var scheduleWeather = new CronJob({
        cronTime: "00 43 * * * *",
        onTick: kmaWeather.search,
        start: true,
        timeZone: 'Asia/Seoul',
        runOnInit: true
    });
    // }

    //집회정보 업데이트
    var scheduleSeoulAssembly = new CronJob({
        cronTime: "00 */5 0,6-8 * * *",
        onTick: seoulAssembly.search,
        start: true,
        timeZone: 'Asia/Seoul',
        runOnInit: true
    });
}