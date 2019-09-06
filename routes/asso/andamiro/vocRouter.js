const conn = require('../../../config/db');
const router = require('express').Router();

router.get('', (req, res) => {
  let page;
  if (req.query.page)
    page = req.query.page;
  else
    page = 1;

  let sql = `SELECT count(*) as totalCount from andamiro_voc`

  conn.query(sql, (err, results) => {
    let totalCount = results[0].totalCount;
    if (totalCount == 0)
      totalCount = 1;

    let listCount = 30;
    let pageCount = 5;
    let totalPage = parseInt(totalCount / listCount);

    if (totalCount % listCount > 0)
      totalPage++;

    if (totalPage < page)
      page = totalPage;

    let startPage = parseInt((parseInt((page - 1) / pageCount)) * pageCount) + 1;
    let endPage = startPage + pageCount - 1;
    if (endPage > totalPage) {
      endPage = totalPage;
    }

    sql = `SELECT andamiro_voc.id, vocdate, DATE_FORMAT(vocdate, '%Y-%m-%d') AS date, content, major.major
      FROM andamiro_voc
      LEFT JOIN users ON andamiro_voc.uId=users.id
      LEFT JOIN major ON users.majorId=major.id
      ORDER BY andamiro_voc.id DESC
      LIMIT 30 OFFSET ?`;

    conn.query(sql, [(page - 1) * listCount], (err, rows) => {

      res.render('asso/andamiro/voc', {
        user: req.user,
        info: {
          title: '',
          titlehref: '/asso/andamiro/voc',
          headbar: []
        },
        voc : rows,
        page: page,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage
      });
    })
  });
});


module.exports = router;