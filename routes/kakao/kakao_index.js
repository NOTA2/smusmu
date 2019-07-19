var router = require('express').Router();

var eatKakaoRouter = require('./eat/schoolEat');
var noticeKakaoRouter = require('./schoolInfo/notice');
var weatherKakaoRouter = require('./gotowork/weather');
var seoulAssemblyKakaoRouter = require('./gotowork/seoulAssembly');
var calendarKakaoRouter = require('./schoolInfo/calendar');
var foodMenuKakaoRouter = require('./eat/foodMenu');
var schoolInfoKakaoRouter = require('./schoolInfo/schoolInfo');
var professorKakaoRouter = require('./schoolInfo/professor');
var rentKakaoRouter = require('./asso/rent')
var authKakaoRouter = require('./main/auth')
// var quizKakaoRouter = require('./event/quiz');
//var festivalKakaoRouter = require('./event/festival')

router.use('/eat', eatKakaoRouter);
router.use('/notice', noticeKakaoRouter);
router.use('/weather', weatherKakaoRouter);
router.use('/seoulAssembly', seoulAssemblyKakaoRouter);
router.use('/calendar', calendarKakaoRouter);
router.use('/foodMenu', foodMenuKakaoRouter);
router.use('/schoolInfo', schoolInfoKakaoRouter);
router.use('/professor', professorKakaoRouter);
router.use('/rent', rentKakaoRouter);
router.use('/auth', authKakaoRouter);
//router.use('/festival', festivalKakaoRouter);
// router.use('/quiz', quizKakaoRouter);


module.exports = router;