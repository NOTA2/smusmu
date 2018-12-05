var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var deasync = require('deasync');
var CronJob = require('cron').CronJob;

var cEat = require('./crawling/crawling_Eat');
var chEat = require('./crawling/crawling_Eat_happy');
var kmaWeather = require('./crawling/weather');
var seoulAssembly = require('./crawling/seoulAssembly');
var calendar = require('./crawling/calendar');

exports.user = new Array();
var userCount = 0;

var messageRouter = require('./routes/message')();
var errRouter = require('./routes/err')();

var mainRouter = require('./routes/main')();
var exRouter = require('./routes/ex')();
var eatRouter = require('./routes/eat')();
var noticeRouter = require('./routes/notice')();
var weatherRouter = require('./routes/weather')();
var seoulAssemblyRouter = require('./routes/seoulAssembly')();
var calendarRouter = require('./routes/calendar')();
var foodMenuRouter = require('./routes/foodMenu')();

app.use('/message', messageRouter);
app.use('/err', errRouter);

app.use('/main', mainRouter);
app.use('/ex', exRouter);
app.use('/eat', eatRouter);
app.use('/notice', noticeRouter);
app.use('/weather', weatherRouter);
app.use('/seoulAssembly', seoulAssemblyRouter);
app.use('/calendar', calendarRouter);
app.use('/foodMenu', foodMenuRouter);



/*********************************
초기 설정 코드
**********************************/

console.log('APIs initialize');


//서버를 계속 유지
app.listen(80, function() {
  console.log('Connect 80 port');
});


//jade의 index파일로 연결
app.get('/', function(req, res){
  var loginFail='';
  if(req.query.mode == 1){
    loginFail = '다시 입력해주세요.'
  }

  res.render('index', {loginFail:loginFail});
});

app.post('/signIn', function(req, res){
  var memberId = req.body.memberId;
  var memberPw = req.body.memberPw;

  if(checkMember(memberId, memberPw)){   //아이디와 비밀번호가 일치하면
    res.redirect('/home');
  }
  else{   //일치하지 않으면
    console.log('redirect');
    res.redirect(301, '/?mode=1');
  }
});


app.get('/home', function(req, res){
  res.render('home');
});


function checkMember(id, pw){
  if(id == 'a')
    return true;
  else
    return false;
}


var scheduleEat = new CronJob({
  cronTime: "00 10 6-11 * * 0-2",
  onTick: setResultEat,
  start: true,
  timeZone: 'Asia/Seoul',
  runOnInit : true
});

var scheduleSeoulAssembly = new CronJob({
  cronTime: "00 */5 6-9 * * *",
  onTick: setseoulAssembly,
  start: true,
  timeZone: 'Asia/Seoul',
  runOnInit : true
});

var scheduleCalendar = new CronJob({
  cronTime: "00 00 12 */10 1,2,12 *",
  onTick: setCalendar,
  start: true,
  timeZone: 'Asia/Seoul',
  runOnInit : true
});


if(defaultObj.ipadd !=  '52.78.151.4'){     //테스트 서버일 땐 하지 않습니다.
  var scheduleWeather = new CronJob({
    cronTime: "00 43 * * * *",
    onTick: setResultWeather,
    start: true,
    timeZone: 'Asia/Seoul',
    runOnInit : true
  });
}



app.get('/keyboard', (req, res) => {
  res.json({
    type: 'buttons',
    buttons: [defaultObj.mainstr]
  });
});


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

//집회 정보 업데이트
function setseoulAssembly(){
  var result = new Object();
  result.bt = new Array()

  var d = new Date();
  var day;
  var time = d.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("집회/공사 정보 업데이트");
  beforeseoulAssemblyResult = defaultObj.seoulAssemblyResult;

  seoulAssembly.search()
    .then(temp => {
      defaultObj.seoulAssemblyResult = temp;
    });

    while (defaultObj.seoulAssemblyResult == beforeseoulAssemblyResult) {
      deasync.runLoopOnce();
    }
    result.check = defaultObj.seoulAssemblyResult.check;
    if(defaultObj.seoulAssemblyResult.check){    //오늘 데이터가 있었으면
      result.str = defaultObj.seoulAssemblyResult.str;
      result.img = defaultObj.seoulAssemblyResult.img;
    }
    
    defaultObj.seoulAssemblyResult = result;
}


//학사정보 업데이트
function setCalendar(){
  var calendartemp;
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log('학사정보 업데이트');
  calendar.crawling()
    .then(temp => {
      calendartemp = temp
    });

  while (calendartemp == undefined) {
    deasync.runLoopOnce();
  }

  defaultObj.calendarResult = calendartemp;
}
