var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var deasync = require('deasync');
var CronJob = require('cron').CronJob;
var passport = require('./config/passport')(app);

var cEat = require('./crawling/crawling_Eat');
var chEat = require('./crawling/crawling_Eat_happy');
var kmaWeather = require('./crawling/weather');
var seoulAssembly = require('./crawling/seoulAssembly');
var calendar = require('./crawling/calendar');

var eatRouter = require('./routes/kakao/eat')();
var noticeRouter = require('./routes/kakao/notice')();
var weatherRouter = require('./routes/kakao/weather')();
var seoulAssemblyRouter = require('./routes/kakao/seoulAssembly')();
var calendarRouter = require('./routes/kakao/calendar')();
var foodMenuRouter = require('./routes/kakao/foodMenu')();

// app.use('/message', messageRouter);
app.use('/eat', eatRouter);
app.use('/notice', noticeRouter);
app.use('/weather', weatherRouter);
app.use('/seoulAssembly', seoulAssemblyRouter);
app.use('/calendar', calendarRouter);
app.use('/foodMenu', foodMenuRouter);

var auth = require('./routes/asso/auth')(passport);
app.use('/auth/', auth);


/*********************************
초기 설정 코드
**********************************/

console.log('APIs initialize');


//서버를 계속 유지
app.listen(80, function () {
  console.log('Connect 80 port');
});


//jade의 index파일로 연결
app.get('/', function (req, res) {
  res.redirect('/auth/login')
});


app.get('/home', function (req, res) {
  if (req.user) {
    res.render('home');
  } else {
    res.redirect('/auth/login');
  }
});


// var scheduleEat = new CronJob({
//   cronTime: "00 10 6-11 * * 0-2",
//   onTick: setResultEat,
//   start: true,
//   timeZone: 'Asia/Seoul',
//   runOnInit: true
// });

var scheduleSeoulAssembly = new CronJob({
  cronTime: "00 */5 6-8 * * *",
  onTick: seoulAssembly.search,
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


if (defaultObj.ipadd != '54.180.122.96') { //테스트 서버일 땐 하지 않습니다.
var scheduleWeather = new CronJob({
  cronTime: "00 43 * * * *",
  onTick: setResultWeather,
  start: true,
  timeZone: 'Asia/Seoul',
  runOnInit: true
});
}


//일주일치 학식정보를 업데이트
function setResultEat() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("학식 정보를 업데이트 합니다\n");

  //변수의 변화를 감지해야 하기 때문에 과거의 값을 저장해 둔다.
  var teatR = undefined;
  var teatT = undefined;
  var teatH = undefined;

  cEat.search('미래백년관 - ')
    .then(temp1 => {
      teatR = temp1;
    });

  cEat.search('밀레니엄관 - ')
    .then(temp2 => {
      teatT = temp2;
    });

  chEat.search()
    .then(temp3 => {
      teatH = temp3;
    })

  while (teatR == undefined || teatT == undefined || teatH == undefined) {
    deasync.runLoopOnce();
  }

  defaultObj.eatResult.R = teatR;
  defaultObj.eatResult.T = teatT;
  defaultObj.eatResult.H = teatH;
  console.log(defaultObj.eatResult.R.bt);
  console.log(defaultObj.eatResult.T.bt);
  console.log(defaultObj.eatResult.H.bt);
}

//날씨 정보를 업데이트
function setResultWeather() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("날씨 정보를 업데이트 합니다\n");

  kmaWeather.search()
    .then(temp => {
      defaultObj.weatherResult = temp;
    });

}
