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

require('./config/schedule')();

var eatRouter = require('./routes/kakao/eat')();
var noticeRouter = require('./routes/kakao/notice')();
var weatherRouter = require('./routes/kakao/weather')();
var seoulAssemblyRouter = require('./routes/kakao/seoulAssembly')();
var calendarRouter = require('./routes/kakao/calendar')();
var foodMenuRouter = require('./routes/kakao/foodMenu')();
var schoolInfoRouter = require('./routes/kakao/schoolInfo')();
var quizRouter = require('./routes/kakao/quiz');

app.use('/eat', eatRouter);
app.use('/notice', noticeRouter);
app.use('/weather', weatherRouter);
app.use('/seoulAssembly', seoulAssemblyRouter);
app.use('/calendar', calendarRouter);
app.use('/foodMenu', foodMenuRouter);
app.use('/schoolInfo', schoolInfoRouter);
app.use('/quiz', quizRouter);


app.post('/test', (req, res) =>{
  console.log(req.body.action.detailParams);
})

// var index = require('./routes/index')();
// var auth = require('./routes/auth')(passport);

// app.use('/', index);
// app.use('/auth/', auth);