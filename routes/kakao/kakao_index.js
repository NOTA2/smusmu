const router = require('express').Router();


const mainmenu = require('./main/mainmenu')
const auth = require('./main/auth')

const eat = require('./eat/schoolEat');
const foodMenu = require('./eat/foodMenu');

const notice = require('./schoolInfo/notice');
const calendar = require('./schoolInfo/calendar');
const schoolInfo = require('./schoolInfo/schoolInfo');
const professor = require('./schoolInfo/professor');
const faq = require('./schoolInfo/faq')
const volunteer = require('./schoolInfo/volunteer')

const weather = require('./gotowork/weather');
const seoulAssembly = require('./gotowork/seoulAssembly');
const taxi = require('./gotowork/taxi')

const rent = require('./regi/rent')
const job = require('./regi/job')

const andamiro = require('./andamiro/andamiro')


router.use('/mainmenu', mainmenu);
router.use('/auth', auth);

router.use('/eat', eat);
router.use('/foodMenu', foodMenu);

router.use('/notice', notice);
router.use('/calendar', calendar);
router.use('/schoolInfo', schoolInfo);
router.use('/professor', professor);
router.use('/faq', faq);
router.use('/volunteer', volunteer);

router.use('/taxi', taxi);
router.use('/weather', weather);
router.use('/seoulAssembly', seoulAssembly);

router.use('/rent', rent);
router.use('/job', job);

router.use('/andamiro', andamiro);


// const quiz = require('./event/quiz');
// const festival = require('./event/festival')
// router.use('/festival', festival);
// router.use('/quiz', quiz);


module.exports = router;