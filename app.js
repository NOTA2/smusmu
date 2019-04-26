console.log('APIs initialize');

var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var passport = require('./config/passport')(app);

var eatKakaoRouter = require('./routes/kakao/eat');
var noticeKakaoRouter = require('./routes/kakao/notice');
var weatherKakaoRouter = require('./routes/kakao/weather');
var seoulAssemblyKakaoRouter = require('./routes/kakao/seoulAssembly');
var calendarKakaoRouter = require('./routes/kakao/calendar');
var foodMenuKakaoRouter = require('./routes/kakao/foodMenu');
var schoolInfoKakaoRouter = require('./routes/kakao/schoolInfo');
// var quizKakaoRouter = require('./routes/kakao/quiz');
var authKakaoRouter = require('./routes/kakao/auth')
var festivalKakaoRouter = require('./routes/kakao/festival')

app.use('/kakao/eat', eatKakaoRouter);
app.use('/kakao/notice', noticeKakaoRouter);
app.use('/kakao/weather', weatherKakaoRouter);
app.use('/kakao/seoulAssembly', seoulAssemblyKakaoRouter);
app.use('/kakao/calendar', calendarKakaoRouter);
app.use('/kakao/foodMenu', foodMenuKakaoRouter);
app.use('/kakao/schoolInfo', schoolInfoKakaoRouter);
// app.use('/kakao/quiz', quizKakaoRouter);
app.use('/kakao/auth', authKakaoRouter);
app.use('/kakao/festival', festivalKakaoRouter);


var index = require('./routes/index');
var auth = require('./routes/auth')(passport);
var commu = require('./routes/commu');
var asso = require('./routes/asso');

app.use('/', index);
app.use('/auth', auth);
app.use('/commu', commu);
app.use('/asso', asso);


app.use(function(req, res, next) {
  res.status(404).render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).render('500');
})

//서버를 계속 유지
app.listen(80, function () {
  console.log('Connect 80 port');
});