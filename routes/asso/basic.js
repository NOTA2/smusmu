
const router = require('express').Router();
const conn = require('../../config/db');

const rent = require('./basic/rent');
const ahome = require('./basic/ahome');


router.use('/rent', rent);
router.use('/home', ahome);

router.get('/', (req, res) => {
  res.render('asso/home/index', {
    user: req.user,
    info: {
      title: '관리페이지 홈',
      titlehref: '/asso',
      headbar: []
    }
  });
});

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