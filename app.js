console.log('APIs initialize');

var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var passport = require('./config/passport')(app);

//서버를 계속 유지
app.listen(80, function () {
  console.log('Connect 80 port');
});

var schedule = require('./config/schedule')();

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
