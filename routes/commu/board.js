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
  if (req.query.page)
    page = req.query.page;
  else
    page = 1;

  var boardKey = req.query.board;
  var sql = `select id as bid, boardName, boardGrade, boardKey FROM board WHERE boardKey=?`

  conn.query(sql, [boardKey], (err, rows) => {
    if (err)
      throw err;
  
    var board = rows[0];

    sql = `SELECT count(*) as totalCount from topic WHERE bid=?`

    conn.query(sql, [board.bid], (err, results) => {
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
    WHERE bid=?
    ORDER BY topic.id DESC
    LIMIT 10 OFFSET ?`;

      conn.query(sql, [board.bid, (page - 1) * listCount], (err, results) => {

        res.render('commu/board', {
          user: req.user,
          info: {
            title: board.boardName,
            titlehref: `/commu/board/list?board=${board.boardKey}`,
            headbar: []
          },
          page: page,
          totalPage: totalPage,
          startPage: startPage,
          endPage: endPage,
          topics: results,
          board: board,
          menu : req.menu
        });
      })
    })
  })
});

router.get('/write', (req, res) => {
  var sql = `select * from board where boardKey=?`

  conn.query(sql, [req.query.board], (err, rows)=>{
    if(err)
      throw err;
    
    var board = rows[0];
    
    //1. 등급제한이 없는 경우
    //2. 등급제한은 있는 경우, usergrade가 더 같거나 낮은경우
    if((board.boardGrade==null && (req.user.grade == null || req.user.grade == 4)) || (board.boardGrade && req.user.grade && board.boardGrade >= req.user.grade)){
      res.render('commu/write', {
        user: req.user,
        info: {
          title: board.boardName,
          titlehref: `/commu/board/list?board=${board.boardKey}`,
          headbar: []
        },
        board: board,
        menu : req.menu
      });
    }else{
      return res.redirect(`/commu/board/list?board=${req.query.board}`);
    }
  })
})
.post('/write', (req, res) => {

  var sql = `
  INSERT INTO topic (bid, title, content, onTime, authId, mode)
  VALUES (?, ?, ?, now(), ?, ?);
  `

  var param = [
    req.body.bid,
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
    return res.redirect(`/commu/board/list?board=${req.body.boardKey}`);
  })
});


router.get('/content', (req, res) => {

  var boardKey = req.query.board;
  var sql = `select id as bid, boardName, boardGrade, boardKey
  FROM board WHERE boardKey=?`

  conn.query(sql, [boardKey], (err, rows) => {
    if(err)
    throw err;
    
    var board = rows[0];
    var id = req.query.id;
    var page;

    if (req.query.page) page = req.query.page;
    else page = 1;
  
    var sql = `select *, topic.id AS pid, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime
    FROM topic LEFT JOIN users ON topic.authId=users.id
    WHERE topic.id=?`;

    conn.query(sql, [id], (err, results) => {
      if (err || results.length == 0)
        throw err;
  
      var topic = results[0];
  
      var sql = `
      SELECT count(*) as totalCount from topic WHERE bid=?
      `
      conn.query(sql, [board.bid], (err, results) => {
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
        WHERE bid=?
        ORDER BY topic.id DESC
        LIMIT 10 OFFSET ?`;
  
  
        //글 목록 불러오기
        conn.query(sql, [board.bid, (page - 1) * listCount], (err, results1) => {
  
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
                title: board.boardName,
                titlehref: `/commu/board/list?board=${board.boardKey}`,
                headbar: []
              },
              page: page,
              totalPage: totalPage,
              startPage: startPage,
              endPage: endPage,
              topic: topic,
              topics: topics,
              comments: comments,
              menu : req.menu,
              board : board
            }
  
            res.render('commu/content', params);
          })
        })
      })
    })

  });
});


router.post('/like', (req, res) => {
  var sql = `
  SELECT id from lik WHERE targetType=? AND targetId=? AND authId=?
  `
  conn.query(sql, [req.body.targetType, req.body.pid, req.body.uid], (err, results) => {
    if (err)
      throw err;
      
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
    if (err) 
      throw err;

    sql = `UPDATE topic SET comment=comment+1 WHERE id=?`

    conn.query(sql, [req.body.pid], (err, result) => {
      return res.redirect(`/commu/board/content?id=${req.body.pid}&board=${req.body.boardKey}&page=${req.body.page}`);
    })
  })
});


module.exports = router;