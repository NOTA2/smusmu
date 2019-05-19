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

var answer = require('./petition_answer');
router.use('/answer', answer);



router.get('/list', (req, res) => {
  var page;
  if (req.query.page)
    page = req.query.page;
  else
    page = 1;
  var mode;
  if (req.query.mode)
    mode = req.query.mode;
  else
    mode = 'latest';

  var sql = `
    SELECT count(*) as totalCount from petition WHERE answerState=0
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

    //좋아요가 높은 순
    sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, content
    FROM petition LEFT JOIN users ON petition.authId=users.id
    WHERE answerState=0 AND lik = (select max(lik) from petition WHERE answerState=0 AND lik > 0)
    LIMIT 5`;


    conn.query(sql, (err, results2) => {
      var top = results2;

      if (mode == 'recom')
        sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, answerId
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=0
            ORDER BY lik DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;
      else
        sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, answerId
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=0
            ORDER BY onTime DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;

      conn.query(sql, [(page - 1) * listCount], (err, results) => {

        res.render('commu/petition', {
          user: req.user,
          info: {
            title: '진행 중인 청원',
            titlehref: '/commu/petition/list',
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
          top: top,
          menu : req.menu
        });
      })
    })
  })
});



router.get('/content', (req, res) => {
  var id = req.query.id;
  var page;
  if (req.query.page) page = req.query.page;
  else page = 1;
  var mode;
  if (req.query.mode) mode = req.query.mode;
  else mode = 'latest';


  var sql = `select *, petition.id AS pid, major.college, major.major
  FROM petition
  LEFT JOIN users ON petition.authId=users.id
  LEFT JOIN major ON major.id=users.majorId
  WHERE petition.id=?`;

  conn.query(sql, [id], (err, results) => {
    if (err || results.length == 0) {
      console.log(err);
      return res.status(500);
    }

    var topic = results[0];

    var sql = `
    SELECT count(*) as totalCount from petition WHERE answerState=?
    `
    conn.query(sql, [topic.answerState], (err, results) => {
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

      if (mode == 'recom')
        sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, answerId
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=?
            ORDER BY lik DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;
      else {
        if (topic.answerState == 1)
          sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, answerId
            FROM petition LEFT JOIN users ON petition.authId=users.id
            WHERE answerState=?
            ORDER BY enrollTime DESC, petition.id DESC
            LIMIT 10 OFFSET ?`;
        else
          sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, mode, comment, users.name as name, answerState, answerId
          FROM petition LEFT JOIN users ON petition.authId=users.id
          WHERE answerState=?
          ORDER BY onTime DESC, petition.id DESC
          LIMIT 10 OFFSET ?`;
      }

      //글 목록 불러오기
      conn.query(sql, [topic.answerState, (page - 1) * listCount], (err, results1) => {
        var topics = results1;
        var infotitle = '진행 중인 청원';
        var titlehref = '/commu/petition/list'
        if (topic.answerState == 1) {
          titlehref = '/commu/petition/answer/list'
          infotitle = '답변 완료된 청원';
        }


        sql = `SELECT id, content,DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime, lik, authId, reauthId, recommentId
              FROM petitionComment
              WHERE petitionId=?
              ORDER BY IF(ISNULL(recommentId), id, recommentId)`


        //댓글들 불러오기
        conn.query(sql, [topic.pid], (err, results2) => {


          var comments = results2;
          var params = {
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
            mode: mode,
            page: page,
            totalPage: totalPage,
            startPage: startPage,
            endPage: endPage,
            topic: topic,
            topics: topics,
            comments: comments,
            menu : req.menu
          }


          if (topic.answerId) { //답변이 있는경우
            sql = `SELECT * from petitionAnswer WHERE id=?`
            //답변
            conn.query(sql, [topic.answerId], (err, results3) => {
              var answer = results3[0];
              params.answer = answer;
              res.render('commu/petitionContent', params);
            })
          } else {
            res.render('commu/petitionContent', params);
          }
        })
      })
    })
  })
});

router.get('/write',(req, res) => {
  res.render('commu/petitionWrite', {
    user: req.user,
    info: {
      title: '학생 청원 제도',
      titlehref: '/commu/petition/list',
      headbar: [{
        title: '진행 중인 청원',
        href: '/commu/petition/list'
      }, {
        title: '답변 완료된 청원',
        href: '/commu/petition/answer/list'
      }]
    },
    menu : req.menu
  });
})
.post('/write', (req, res) => {

  var sql = `
  INSERT INTO petition (title, content, onTime, authId, mode)
  VALUES (?, ?, now(), ?, ?);
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

    return res.redirect('/commu/petition/content?id=' + result.insertId);
  })
});

router.post('/upload', upload.single('upload'), (req, res) => {
  res.status(200).json({
    "uploaded": true,
    "url": req.file.path.replace('public', '')
  });
});


router.post('/like', (req, res) => {
  var sql = `
  SELECT id from petitionLike WHERE targetType=? AND targetId=? AND authId=?
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
      INSERT INTO petitionLike (targetId, targetType, authId, targetAuthId, likeType)
      VALUES (?, ?, ?, ?, 1);
      `
      conn.query(sql, [req.body.pid, req.body.targetType, req.body.uid, req.body.tid], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500);
        } else {
          if (req.body.targetType == 1)
            sql = `UPDATE petition SET lik=lik+1 WHERE id=?`
          else
            sql = `UPDATE petitionComment SET lik=lik+1 WHERE id=?`

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


router.post('/delete', (req, res) => {
  var sql
  if (req.body.pc == 1)
    sql = `DELETE from petition WHERE id = ?`
  else
    sql = `UPDATE petitionComment SET content=NULL WHERE id = ?`;

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


router.post('/comment', (req, res) => {

  var sql = `
  INSERT INTO petitionComment (content, onTime, authId, petitionId)
  VALUES (?,now(),?,?)
  `

  var param = [
    req.body.body,
    req.body.uid,
    req.body.pid
  ];

  if (req.body.ruid) {
    sql = `
    INSERT INTO petitionComment (content, onTime, authId, petitionId,reauthId,recommentId)
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

    sql = `UPDATE petition SET comment=comment+1 WHERE id=?`
    conn.query(sql, [req.body.pid], (err, result) => {
      return res.redirect('/commu/petition/content?id=' + req.body.pid);
    })
  })
});

module.exports = router;