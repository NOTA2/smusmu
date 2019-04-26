var conn = require('../config/db')();
var route = require('express').Router();
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

route.get('/', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  sql = `select petition.id as id, title, DATE_FORMAT(onTime,'%Y-%m-%d') AS date, lik, comment
  FROM petition LEFT JOIN users ON petition.authId=users.id
  WHERE answerState=0
  ORDER BY lik DESC, petition.id DESC
  LIMIT 10`;

  conn.query(sql,(err,results)=>{
   
    res.render('commu/index', {
      user: req.user,
      info: {
        title: '커뮤니티 홈',
        titlehref: '/commu/',
        headbar: []
      },
      topics: results
    });
  })

});

route.get('/myinfo', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  req.user.phone = req.user.phone.split('-');

  res.render('commu/myinfo', {
    user: req.user,
    info: {
      title: '내 정보',
      titlehref: '/commu/myinfo',
      headbar: []
    }
  });
});

route.post('/myinfo', (req, res) => {

  var param = [
    req.body.name,
    req.body.college,
    req.body.department,
    req.body.nickname,
    req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3,
    req.body.id
  ]

  var sql = 'UPDATE users SET name=?, college=?, department=?, nickname=?, phone=? WHERE id=?'
  conn.query(sql, param, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).end();
    } else {
      req.user.name = req.body.name
      req.user.college = req.body.college
      req.user.department = req.body.department
      req.user.nickname = req.body.nickname
      req.user.phone = [req.body.phone1, req.body.phone2, req.body.phone3]

      res.render('commu/myinfo', {
        user: req.user,
        info: {
          title: '내 정보',
          titlehref: '/commu/myinfo',
          headbar: []
        }
      });
    }
  })
});


route.get('/petition', (req, res, next) => {
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
            titlehref: '/commu/petition',
            headbar: [{
              title: '진행 중인 청원',
              href: '/commu/petition'
            }, {
              title: '답변 완료된 청원',
              href: '/commu/petitionanswer'
            }]
          },
          mode: mode,
          page: page,
          totalPage: totalPage,
          startPage: startPage,
          endPage: endPage,
          topics: results,
          top: top
        });
      })
    })


  })
});

route.get('/petitionanswer', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
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


      res.render('commu/petition', {
        user: req.user,
        info: {
          title: '답변 완료된 청원',
          titlehref: '/commu/petitionanswer',
          headbar: [{
            title: '진행 중인 청원',
            href: '/commu/petition'
          }, {
            title: '답변 완료된 청원',
            href: '/commu/petitionanswer'
          }]
        },
        mode: mode,
        page: page,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage,
        topics: results
      });
    })
  })
});



route.get('/petition/content', (req, res, next) => {
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
  var mode;
  if (req.query.mode) mode = req.query.mode;
  else mode = 'latest';


  var sql = `select *, petition.id AS pid
  FROM petition LEFT JOIN users ON petition.authId=users.id
  WHERE petition.id=?`;
  conn.query(sql, [id], (err, results) => {
    if(err || results.length==0){
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
      else{
        if(topic.answerState==1)
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
        var titlehref = '/commu/petition'
        if (topic.answerState == 1) {
          titlehref = '/commu/petitionanswer'
          infotitle = '답변 완료된 청원';
        }


        sql = `SELECT id, content,DATE_FORMAT(onTime,'%Y-%m-%d') AS date, TIME_TO_SEC(TIMEDIFF(now(), onTime)) as dtime, lik, authId, reauthId, recommentId
              FROM petitionComment
              WHERE petitionId=?
              ORDER BY IF(ISNULL(recommentId), id, recommentId)`

        
        //댓글들 불러오기
        conn.query(sql, [topic.pid], (err,results2)=>{

          
          var comments = results2;
          var params = {
            user: req.user,
            info: {
              title: infotitle,
              titlehref: titlehref,
              headbar: [{
                title: '진행 중인 청원',
                href: '/commu/petition'
              }, {
                title: '답변 완료된 청원',
                href: '/commu/petitionanswer'
              }]
            },
            mode: mode,
            page: page,
            totalPage: totalPage,
            startPage: startPage,
            endPage: endPage,
            topic: topic,
            topics: topics,
            comments : comments
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

route.get('/petition/write', (req, res, next) => {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  res.render('commu/petitionWrite', {
    user: req.user,
    info: {
      title: '학생 청원 제도',
      titlehref: '/commu/petition',
      headbar: [{
        title: '진행 중인 청원',
        href: '/commu/petition'
      }, {
        title: '답변 완료된 청원',
        href: '/commu/petitionanswer'
      }]
    }
  });
});

route.post('/petition/write', (req, res) => {

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

route.post('/upload', upload.single('upload'), (req, res) => {
  res.status(200).json({
    "uploaded": true,
    "url": req.file.path.replace('public', '')
  });

});


route.post('/petition/like', (req, res) => {
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
          if(req.body.targetType == 1)
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



route.get('/petition/answerwrite', (req, res, next) => {
  if (req.user.grade == 1) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  var id = req.query.id;

  var sql = `select *, petition.id AS pid
  FROM petition LEFT JOIN users ON petition.authId=users.id
  WHERE petition.id=?`;
  conn.query(sql, [id], (err, results) => {

    var topic = results[0];
    var infotitle = '진행 중인 청원';
    var titlehref = '/commu/petition'
    if(topic.answerId){
      sql = `SELECT * from petitionAnswer WHERE id =?`;
      conn.query(sql,[topic.answerId], (err,results)=>{
        var answer = results[0];
        res.render('commu/petitionAnswer', {
          user: req.user,
          info: {
            title: infotitle,
            titlehref: titlehref,
            headbar: [{
              title: '진행 중인 청원',
              href: '/commu/petition'
            }, {
              title: '답변 완료된 청원',
              href: '/commu/petitionanswer'
            }]
          },
          topic: topic,
          answer:answer
        });
      })
    }else{
      res.render('commu/petitionAnswer', {
        user: req.user,
        info: {
          title: infotitle,
          titlehref: titlehref,
          headbar: [{
            title: '진행 중인 청원',
            href: '/commu/petition'
          }, {
            title: '답변 완료된 청원',
            href: '/commu/petitionanswer'
          }]
        },
        topic: topic
      });
    }
  })
});

route.post('/petition/answer', (req, res, next) => {
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

route.post('/petition/answerok', (req, res) => {

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

route.post('/petition/delete', (req, res) => {
  var sql
  if(req.body.pc==1)
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


route.post('/petition/comment', (req, res) => {

  var sql = `
  INSERT INTO petitionComment (content, onTime, authId, petitionId)
  VALUES (?,now(),?,?)
  `

  var param = [
    req.body.body,
    req.body.uid,
    req.body.pid
  ];

  if(req.body.ruid){
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
    
    sql =`UPDATE petition SET comment=comment+1 WHERE id=?`
    conn.query(sql,[req.body.pid], (err,result)=>{
      return res.redirect('/commu/petition/content?id=' + req.body.pid);
    })
  })
});


route.get('/board', (req, res, next) =>  {
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
            titlehref: '/commu/board?board=free',
            headbar: []
          },
          page: page,
          totalPage: totalPage,
          startPage: startPage,
          endPage: endPage,
          topics: results,
          bid : 1,
          board : 'free'
        });
      
    })
  })


});

route.get('/write', (req, res, next) =>  {
  if (req.user) {
    if (req.user.token == 'true') next();
    else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
  } else
    res.redirect('/auth/login');
}, (req, res) => {
  res.render('commu/write', {
    user: req.user,
    info: {
      title: '익명 자유게시판',
      titlehref: '/commu/board?board=free',
      headbar: []
    },
    board : req.query.board
  });
});

route.post('/write', (req, res) => {

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
    return res.redirect('/commu/board');
    // return res.redirect('/commu/content?id=' + result.insertId);
  })
});


route.get('/content', (req, res, next) => {
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
    if(err || results.length==0){
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
        conn.query(sql, [topic.pid], (err,results2)=>{

          
          var comments = results2;
          var params = {
            user: req.user,
            info: {
              title: '익명 자유게시판',
              titlehref: '/commu/board?board=free',
              headbar: []
            },
            page: page,
            totalPage: totalPage,
            startPage: startPage,
            endPage: endPage,
            topic: topic,
            topics: topics,
            comments : comments
          }

          res.render('commu/content', params);
        })
      })
    })
  })
});


route.post('/like', (req, res) => {
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
          if(req.body.targetType == 1)
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

route.post('/comment', (req, res) => {

  var sql = `
  INSERT INTO comment (content, onTime, authId, topicId)
  VALUES (?,now(),?,?)
  `

  var param = [
    req.body.body,
    req.body.uid,
    req.body.pid
  ];

  if(req.body.ruid){
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
    
    sql =`UPDATE topic SET comment=comment+1 WHERE id=?`
    conn.query(sql,[req.body.pid], (err,result)=>{
      return res.redirect('/commu/content?id=' + req.body.pid);
    })
  })
});

module.exports = route;