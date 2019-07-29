console.log('APIs initialize');

var app = require('./config/express')();
var defaultObj = require('./config/defaultVariable');
require('./config/ip')(defaultObj);
require('date-utils');
var passport = require('./config/passport')(app);

//챗봇 응답용 라우터 연결
var kakao = require('./routes/kakao/kakao_index');
app.use('/kakao', kakao);

//커뮤니티 라우터 연결
var index = require('./routes/index');
var auth = require('./routes/auth/auth_index')(passport);
var commu = require('./routes/commu/commu_index');
var asso = require('./routes/asso/asso_index');

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