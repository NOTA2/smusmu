const conn = require('../../config/db');
const router = require('express').Router();

router.all('*', (req, res, next) => {
  if (req.user.grade == 1)
    next();
  else
    res.render('asso/kakao/grade', {
      user: req.user,
      info: {
        title: '관리페이지 홈',
        titlehref: '/asso',
        headbar: []
      }
    })
});


const mainMenu = require('./kakao/mainMenuRouter');
const schoolInfo = require('./kakao/schoolInfoRouter');
const calendar = require('./kakao/calendarRouter');
const foodMenu = require('./kakao/foodMenuRouter');
const taxi = require('./kakao/taxiRouter');
const faq = require('./kakao/faqRouter');
const job = require('./kakao/jobRouter');


router.use('/mainmenu', mainMenu);
router.use('/schoolInfo', schoolInfo);
router.use('/calendar', calendar);
router.use('/foodMenu', foodMenu);
router.use('/taxi', taxi);
router.use('/faq', faq);
router.use('/job', job);



router.post('/delete', (req, res) => {
  let table = req.body.table;
  let sql = `DELETE FROM ${table} WHERE id =?`;
  
  conn.query(sql, [req.body.val], (err, row) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    return res.json({
      status: true
    });
  })
})

module.exports = router;