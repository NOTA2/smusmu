const conn = require('../../config/db');
const router = require('express').Router();

router.all('*', (req, res, next) => {
  if (req.user.grade == 1 || req.user.grade == 5)
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


const main = require('./andamiro/mainRouter');
const info = require('./andamiro/infoRouter');
const menu = require('./andamiro/menuRouter');
const event = require('./andamiro/eventRouter');
const faq = require('./andamiro/faqRouter');
const voc = require('./andamiro/vocRouter');


router.use('/main', main);
router.use('/info', info);
router.use('/menu', menu);
router.use('/event', event);
router.use('/faq', faq);
router.use('/voc', voc);



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