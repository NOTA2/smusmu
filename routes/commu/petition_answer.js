var conn = require('../../config/db')();
var router = require('express').Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    cb(null, Math.floor(Math.random() * 90000000000) + 1000000000 + file.originalname + '.' + file.mimetype.split('/')[1])
  }
})
var upload = multer({
  storage: storage
})

router.get('/list', (req, res) => {
  var page;
  if (req.query.page) page = req.query.page;
  else page = 1;
  var mode;
  if (req.query.mode) mode = req.query.mode;
  else mode = 'latest';

  var sql = `
    SELECT count(*) as totalCount from petition WHERE answerState=1
    `
  conn.query(sql, (err, results) => {
    var totalCount = results[0].totalCount;
    if (totalCount == 0)
      totalCount = 1;

    var listCount = 10;
    var pageCount = 5;
    var totalPage = parseInt(totalCount / listCount);

    if (totalCount % listCount > 0)
      totalPage++;

    //url에서 임의로 page수를 바꿀 수 있으므로 총 페이지 수 보다 높은 페이지를 접근 못하게 예
    if (totalPage < page)
      page = totalPage;


    var startPage = parseInt((parseInt((page - 1) / pageCount)) * pageCount) + 1;
    //현재 페이지가 pageCount와 같을 때를 유의하며 (page-1)을 하고
    // +1은 첫페이지가 0이나 10이 아니라 1이나 11로 하기 위함임
    var endPage = startPage + pageCount - 1;
    // -1은 첫페이지가 1이나 11 등과 같을때 1~10, 11~20으로 지정하기 위함임

    //끝페이지를 계산해버리면 totalPage(총 페이지 수)보다 크게 잡힐 위험이 있으니 그것을 처리
    if (endPage > totalPage) {
      endPage = totalPage;
    }

    if (mode == 'recom')
      sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=1
            ORDER BY lik DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;
    else
      sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=1
            ORDER BY enrollTime DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;

    conn.query(sql, [(page - 1) * listCount], (err, results) => {


      res.render('commu/petition/petition', {
        user: req.user,
        info: {
          title: '답변 완료된 청원',
          titlehref: '/commu/petition/answer/list',
          headbar: [{
            title: '진행 중인 청원',
            href: '/commu/petition/list'
          }, {
            title: '답변 완료된 청원',
            href: '/commu/petition/answer/list'
          }]
        },
        mode: mode,
        page: page,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage,
        topics: results,
        menu : req.menu
      });
    })
  })
});



router.get('/write', (req, res) => {
  var id = req.query.id;

  var sql = `select *, petition.id AS pid
  FROM petition LEFT JOIN users ON petition.authId=users.id
  WHERE petition.id=?`;
  conn.query(sql, [id], (err, results) => {

    var topic = results[0];
    var infotitle = '진행 중인 청원';
    var titlehref = '/commu/petition/list'
    if (topic.answerId) {
      sql = `SELECT * from petitionAnswer WHERE id =?`;
      conn.query(sql, [topic.answerId], (err, results) => {
        var answer = results[0];
        res.render('commu/petition/petitionAnswer', {
          user: req.user,
          info: {
            title: infotitle,
            titlehref: titlehref,
            headbar: [{
              title: '진행 중인 청원',
              href: '/commu/petition/list'
            }, {
              title: '답변 완료된 청원',
              href: '/commu/petition/answer/list'
            }]
          },
          topic: topic,
          answer: answer
        });
      })
    } else {
      res.render('commu/petition/petitionAnswer', {
        user: req.user,
        info: {
          title: infotitle,
          titlehref: titlehref,
          headbar: [{
            title: '진행 중인 청원',
            href: '/commu/petition/list'
          }, {
            title: '답변 완료된 청원',
            href: '/commu/petition/answer/list'
          }]
        },
        topic: topic,
        menu : req.menu
      });
    }
  })
});


router.post('/write', (req, res, next) => {
  var sql = `
  INSERT INTO petitionAnswer (content, onTime, assoauthId, petitionId)
  VALUES (?, now(), ?, ?);
  `

  var param = [
    req.body.content,
    req.user.id,
    req.body.petitionId
  ];

  conn.query(sql, param, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500);
    } else {

      sql = `UPDATE petition SET answerId=? WHERE id=?`
      conn.query(sql, [result.insertId, req.body.petitionId], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500);
        }
        return res.redirect('/commu/petition/content?id=' + req.body.petitionId);
      })
    }

  })
})


router.post('/ok', (req, res) => {

  var sql = `
  UPDATE petition SET answerState=1, enrollTime=now() 
  WHERE id = ?
  `

  var param = [
    req.body.pid
  ];

  conn.query(sql, param, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    return res.json({
      status: true
    });
  })
});


module.exports = router;