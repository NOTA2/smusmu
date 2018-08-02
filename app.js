var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var deasync = require('deasync');
var schedule = require('node-schedule');

var cEat = require('./module/crawling_Eat');
var chEat = require('./module/crawling_Eat_happy');
var kmaWeather = require('./module/weather');
var seoulAssembly = require('./module/seoulAssembly');
var calendar = require('./module/calendar');

exports.user = new Array();
var userCount = 0;

var messageRouter = require('./routes/message')();
var mainRouter = require('./routes/main')();
var exRouter = require('./routes/ex')();
var eatRouter = require('./routes/eat')();
var noticeRouter = require('./routes/notice')();
var weatherRouter = require('./routes/weather')();
var seoulAssemblyRouter = require('./routes/seoulAssembly')();
var calendarRouter = require('./routes/calendar')();
var foodMenuRouter = require('./routes/foodMenu')();

app.use('/message', messageRouter);
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


//최소 서버 실행시
setResultEat(); //학식 정보 업데이트
if(defaultObj.ipadd !=  '52.78.151.4')     //테스트 서버일 땐 하지 않습니다.
  setResultWeather(); //날씨 정보 최초 업데이트
setseoulAssembly();   //시위정보 최초 업데이트
setCalendar();        //학사일정 최초 업데이트


//매일 마다 학식 정보가 업데이트 되게 한다.
var ruleEat = new schedule.RecurrenceRule();
ruleEat.hour = new schedule.Range(6, 11, 1);
ruleEat.minute = new schedule.Range(0, 59, 19);
var scheduleEat = schedule.scheduleJob(ruleEat, function() {
  setResultEat();
});

//22분 마다 날씨 업데이트
if(defaultObj.ipadd !=  '52.78.151.4'){     //테스트 서버일 땐 하지 않습니다.
  var ruleWeather = new schedule.RecurrenceRule();
  ruleWeather.minute = new schedule.Range(0, 59, 22);
  var scheduleWeather = schedule.scheduleJob(ruleWeather, function() {
    setResultWeather();
  });
}
//매일 6~9시에 5분 마다 집회정보 업데이트
var ruleseoulAssembly = new schedule.RecurrenceRule();
ruleseoulAssembly.hour = new schedule.Range(5, 12, 1);
ruleseoulAssembly.minute = new schedule.Range(0, 59, 5);
var scheduleSeoulAssembly = schedule.scheduleJob(ruleseoulAssembly, function() {
  setseoulAssembly();
});



/*********************************
여기서 부터는 카카오톡 응답 관련 코드
**********************************/

app.get('/keyboard', (req, res) => {
  res.json({
    type: 'buttons',
    buttons: [defaultObj.mainstr]
  });
});


//일주일치 학식정보를 업데이트
async function setResultEat() {
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
async function setResultWeather() {
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
async function setseoulAssembly(){
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

    day = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

    result.bt.push(defaultObj.firststr);

    if(defaultObj.seoulAssemblyResult.check){    //오늘 데이터가 있었으면
      result.bt.push(day);
      result.str = defaultObj.seoulAssemblyResult.str;
      result.img = defaultObj.seoulAssemblyResult.img;
    }

    defaultObj.seoulAssemblyResult = result;
}


//학사정보 업데이트
async function setCalendar(){
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


function getreplace(inum) {
    inum = inum.replace(/&/g,"%26");
    inum = inum.replace(/\+/g,"%2B");
    return inum;
}
