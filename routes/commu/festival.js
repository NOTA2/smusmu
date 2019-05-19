const conn = require('../../config/db')();
const router = require('express').Router();
require('date-utils');

router.get('/', (req, res) => {
  res.render('commu/festival/index', {
    user: req.user,
    info: {
      title: '록록록',
      titlehref: '/commu/festival',
      headbar: []
    }
  })
})

router.get('/info', (req, res) => {
  res.render('commu/festival/index', {
    user: req.user,
    info: {
      title: '록록록',
      titlehref: '/commu/festival',
      headbar: []
    }
  })
})

router.get('/myinfo', (req, res) => {

  var d = new Date();
  // var d = new Date('2019-05-22 12:00:00'); //실 서버 배포시 삭제
  var dday = new Date('2019-05-22 00:00:00');
  var status = false;

  if (d >= dday)
    status = true;


  var sql = `select host, eventName, startTime, endTime, location, type, description, point,
            users.name, users.majorId, major,
            DATE_FORMAT(onTime, "%H시 %i분") as onTime
            from festivalstatus
            LEFT JOIN festival ON festival.id=festivalstatus.fid
            LEFT JOIN users ON users.id=festivalstatus.uid
            LEFT JOIN major ON users.majorId=major.id
            WHERE kakaoId = ?
            ORDER BY festivalstatus.onTIme DESC`

  conn.query(sql, [req.user.kakaoId], (err, rows) => {
    if (err)
      throw err;

    var myinfo = rows;

    res.render('commu/festival/myinfo', {
      user: req.user,
      info: {
        title: '록록록',
        titlehref: '/commu/festival',
        headbar: []
      },
      myinfo :myinfo,
      status: status
    })
  })
})

router.get('/now', (req, res) => {
  var d = new Date();
  // var d = new Date('2019-05-22 12:00:00'); //실 서버 배포시 삭제
  var dday = new Date('2019-05-22 00:00:00');
  var status = false;

  if (d >= dday)
    status = true;

  var sql = `select host, eventName, startTime, endTime, location, type, description, point,
              users.name, users.majorId, major,
              DATE_FORMAT(onTime, "%H시 %i분") as onTime
              from festivalstatus
              LEFT JOIN festival ON festival.id=festivalstatus.fid
              LEFT JOIN users ON users.id=festivalstatus.uid
              LEFT JOIN major ON users.majorId=major.id
              ORDER BY festivalstatus.onTIme DESC
              LIMIT 30`

  conn.query(sql, (err, rows) => {
    if (err)
      throw err;

    var now;
    if (rows.length > 0)
      now = rows;
    else
      now = [];

    sql = `select sum(point) as sumPoint,
          users.name, users.majorId, major
          from festivalstatus
          LEFT JOIN festival ON festival.id=festivalstatus.fid
          LEFT JOIN users ON users.id=festivalstatus.uid
          LEFT JOIN major ON users.majorId=major.id
          GROUP BY users.kakaoId
          ORDER BY sumPoint DESC
          LIMIT 100`

    conn.query(sql, (err, rows) => {
      if (err)
        throw err;

      var rank;
      if (rows.length > 0)
        rank = rows;
      else
        rank = [];

      res.render('commu/festival/now', {
        user: req.user,
        info: {
          title: '록록록',
          titlehref: '/commu/festival',
          headbar: []
        },
        now: now,
        rank: rank,
        status: status
      })
    })
  })
})

router.get('/today', (req, res) => {
  var d = new Date();
  // var d = new Date('2019-05-22 12:00:00'); //실 서버 배포시 삭제
  var dday = new Date('2019-05-22 00:00:00');
  var status = false;

  if (d >= dday)
    status = true;


  //WHERE DATE(post_date)='2012-01-22';
  var sql = `select distinct host, eventName, DATE_FORMAT(DATE_ADD(startTime, INTERVAL 1 HOUR), "%H:%i") as startTime, DATE_FORMAT(DATE_SUB(endTime, INTERVAL 1 HOUR), "%H:%i") as endTime, location, type, description
            from festival 
          WHERE DATE(startTime)=? AND host!='스뮤스뮤'
          order by startTime`
  var today = d.toFormat("YYYY-MM-DD");

  conn.query(sql, [today], (err, rows) => {
    if (err)
      throw err;

    var festival;
    if (rows.length > 0)
      festival = rows;
    else
      festival = [];

    res.render('commu/festival/today', {
      user: req.user,
      info: {
        title: '록록록',
        titlehref: '/commu/festival',
        headbar: []
      },
      festival: festival,
      status: status
    })
  })


})


module.exports = router;