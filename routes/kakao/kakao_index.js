const router = require('express').Router();

const eat = require('./eat/schoolEat');
const notice = require('./schoolInfo/notice');
const weather = require('./gotowork/weather');
const seoulAssembly = require('./gotowork/seoulAssembly');
const calendar = require('./schoolInfo/calendar');
const foodMenu = require('./eat/foodMenu');
const schoolInfo = require('./schoolInfo/schoolInfo');
const professor = require('./schoolInfo/professor');
const rent = require('./regi/rent')
const auth = require('./main/auth')
const mainmenu = require('./main/mainmenu')
const taxi = require('./gotowork/taxi')
const job = require('./regi/job')

router.use('/eat', eat);
router.use('/notice', notice);
router.use('/weather', weather);
router.use('/seoulAssembly', seoulAssembly);
router.use('/calendar', calendar);
router.use('/foodMenu', foodMenu);
router.use('/schoolInfo', schoolInfo);
router.use('/professor', professor);
router.use('/rent', rent);
router.use('/auth', auth);
router.use('/mainmenu', mainmenu);
router.use('/taxi', taxi);
router.use('/job', job);


// const quiz = require('./event/quiz');
// const festival = require('./event/festival')
// router.use('/festival', festival);
// router.use('/quiz', quiz);


module.exports = router;