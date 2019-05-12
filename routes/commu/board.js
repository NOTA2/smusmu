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


router.get('/list', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  var page;
  if (req.query.page)
    page = req.query.page;
  else
    page = 1;

  var sql = `
    SELECT count(*) as totalCount from topic WHERE bid=0
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

    if (totalPage < page)
      page = totalPage;

    var startPage = parseInt((parseInt((page - 1) / pageCount)) * pageCount) + 1;
    var endPage = startPage + pageCount - 1;
    if (endPage > totalPage) {
      endPage = totalPage;
    }

    sql = `select topic.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime, lik, mode, comment, users.name as name, users.nickname as nickname
    FROM topic LEFT JOIN users ON topic.authId=users.id
    WHERE bid=0
    ORDER BY topic.id DESC
    LIMIT 10 OFFSET ?`;

    conn.query(sql, [(page - 1) * listCount], (err, results) => {

      res.render('commu/board', {
        user: req.user,
        info: {
          title: '익명 자유게시판',
          titlehref: '/commu/board/list?board=free',
          headbar: []
        },
        page: page,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage,
        topics: results,
        bid: 1,
        board: 'free'
      });
    })
  })
});

router.get('/write', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  res.render('commu/board/write', {
    user: req.user,
    info: {
      title: '익명 자유게시판',
      titlehref: '/commu/board/list?board=free',
      headbar: []
    },
    board: req.query.board
  });
});

router.post('/write', (req, res) => {

  var sql = `
  INSERT INTO topic (bid, title, content, onTime, authId, mode)
  VALUES (0, ?, ?, now(), ?, ?);
  `

  var param = [
    req.body.title,
    req.body.content,
    req.user.id,
    req.body.mode
  ];

  conn.query(sql, param, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    return res.redirect('/commu/board/list');
    // return res.redirect('/commu/board/content?id=' + result.insertId);
  })
});


router.get('/content', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  var id = req.query.id;
  var page;
  if (req.query.page) page = req.query.page;
  else page = 1;

  var sql = `select *, topic.id AS pid, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime
  FROM topic LEFT JOIN users ON topic.authId=users.id
  WHERE topic.id=?`;


  conn.query(sql, [id], (err, results) => {
    if (err || results.length == 0) {
      console.log(err);
      return res.status(500);
    }

    var topic = results[0];

    var sql = `
    SELECT count(*) as totalCount from topic WHERE bid=0
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

      if (totalPage < page)
        page = totalPage;

      var startPage = parseInt((parseInt((page - 1) / pageCount)) * pageCount) + 1;
      var endPage = startPage + pageCount - 1;
      if (endPage > totalPage) {
        endPage = totalPage;
      }

      sql = `select topic.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime, lik, mode, comment, users.name as name, users.nickname as nickname
      FROM topic LEFT JOIN users ON topic.authId=users.id
      WHERE bid=0
      ORDER BY topic.id DESC
      LIMIT 10 OFFSET ?`;


      //글 목록 불러오기
      conn.query(sql, [(page - 1) * listCount], (err, results1) => {

        var topics = results1;

        sql = `SELECT id, content,DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime, lik, authId, reauthId, recommentId
              FROM comment
              WHERE topicId=?
              ORDER BY IF(ISNULL(recommentId), id, recommentId)`


        //댓글들 불러오기
        conn.query(sql, [topic.pid], (err, results2) => {


          var comments = results2;
          var params = {
            user: req.user,
            info: {
              title: '익명 자유게시판',
              titlehref: '/commu/board/list?board=free',
              headbar: []
            },
            page: page,
            totalPage: totalPage,
            startPage: startPage,
            endPage: endPage,
            topic: topic,
            topics: topics,
            comments: comments
          }

          res.render('commu/content', params);
        })
      })
    })
  })
});


router.post('/like', (req, res) => {
  var sql = `
  SELECT id from lik WHERE targetType=? AND targetId=? AND authId=?
  `
  conn.query(sql, [req.body.targetType, req.body.pid, req.body.uid], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }
    if (results.length > 0) { //이미 추천한 경우
      return res.json({
        status: true
      });
    } else {
      var sql = `
      INSERT INTO lik (targetId, targetType, authId, targetAuthId, likeType)
      VALUES (?, ?, ?, ?, 1);
      `
      conn.query(sql, [req.body.pid, req.body.targetType, req.body.uid, req.body.tid], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500);
        } else {
          if (req.body.targetType == 1)
            sql = `UPDATE topic SET lik=lik+1 WHERE id=?`
          else
            sql = `UPDATE comment SET lik=lik+1 WHERE id=?`

          conn.query(sql, [req.body.pid], (err, results) => {
            return res.json({
              status: false
            });
          });
        }
      })
    }
  })
});

router.post('/comment', (req, res) => {

  var sql = `
  INSERT INTO comment (content, onTime, authId, topicId)
  VALUES (?,now(),?,?)
  `

  var param = [
    req.body.body,
    req.body.uid,
    req.body.pid
  ];

  if (req.body.ruid) {
    sql = `
    INSERT INTO comment (content, onTime, authId, topicId,reauthId,recommentId)
    VALUES (?,now(),?,?,?,?)
    `

    param.push(req.body.ruid);
    param.push(req.body.rcid);
  }

  conn.query(sql, param, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500);
    }

    sql = `UPDATE topic SET comment=comment+1 WHERE id=?`
    conn.query(sql, [req.body.pid], (err, result) => {
      return res.redirect('/commu/board/content?id=' + req.body.pid);
    })
  })
});


module.exports = router;