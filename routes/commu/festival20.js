const conn = require('../../config/db');
const defaultObj = require('../../config/defaultVariable');
const router = require('express').Router();
require('date-utils');


router.get('*', (req, res, next) => {

  var sql = `SELECT users.id as id, username, kakaoId, token, email, majorId, major.college, major.major, schoolId, name, nickname,
  assoname, phone, grade, assoId, assocollege, location, logo, description, assoemail, assophone
  fROM users
  LEFT JOIN asso ON users.assoId=asso.id
  LEFT JOIN major ON users.majorId=major.id
  WHERE kakaoId=?`

  conn.query(sql, [req.query.kakaoId], (err, rows) => {
    if (err)
      throw err;

    if ((rows.length > 0 && rows[0].token == 'true')) {
      req.user = rows[0];
    }
    next();
  })
})

router.get('/', (req, res) => {
  res.render('commu/festival20/index', {
    user: req.user,
    info: {
      title: '2020 축제',
      titlehref: '/commu/festival',
      headbar: []
    }
  })
})

router.get('/info', (req, res) => {
  res.render('commu/festival20/index', {
    user: req.user,
    info: {
      title: '2020 동화제',
      titlehref: '/commu/festival',
      headbar: []
    }
  })
})

router.get('/circlesInfo', (req, res) => {
  res.render('commu/circles/circlesInfo', {
    user: req.user,
    info: {
      title: '2019 동화제',
      titlehref: '/commu/festival/circlesInfo',
      headbar: []
    }
  })
})

router.get('/myinfo', (req, res) => {
  var sql = `SELECT users.id as id, username, kakaoId, token, email, majorId, major.college, major.major, schoolId, name, nickname,
  assoname, phone, grade, assoId, assocollege, location, logo, description, assoemail, assophone
  fROM users
  LEFT JOIN asso ON users.assoId=asso.id
  LEFT JOIN major ON users.majorId=major.id
  WHERE kakaoId=?`

  conn.query(sql, [req.query.kakaoId], (err, rows) => {
    if (err)
      throw err;

    if (rows.length > 0) {
      req.user = rows[0];

      sql = `select host, eventName, location, point, DATE_FORMAT(onTime, "%H시 %i분") as onTime
      from festival_20_status
      LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
      LEFT JOIN users ON users.id=festival_20_status.uid
      WHERE kakaoId = ?
      ORDER BY festival_20_status.onTIme DESC`

      conn.query(sql, [req.user.kakaoId], (err, rows) => {
        if (err)
          throw err;
        var myinfo = new Object();
        myinfo.now = rows;

        sql = `SELECT COUNT(distinct uid) as count, SUM(point) as sum
        FROM festival_20_status
        LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid`

        conn.query(sql, (err, rows) => {
          if (err)
            throw err;

          var schoolInfo = rows[0];
          schoolInfo.avg = (schoolInfo.sum / schoolInfo.count).toFixed(0);
          sql = `SELECT COUNT(distinct uid) as count, SUM(point) as sum
FROM festival_20_status
LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
LEFT JOIN users ON users.id=festival_20_status.uid
LEFT JOIN major ON users.majorId=major.id
WHERE college=?`

          conn.query(sql, [req.user.college], (err, rows) => {
            if (err)
              throw err;

            var collegeInfo = rows[0];
            collegeInfo.avg = (collegeInfo.sum / collegeInfo.count).toFixed(0);
            sql = `SELECT COUNT(distinct uid) as count, SUM(point) as sum
FROM festival_20_status
LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
LEFT JOIN users ON users.id=festival_20_status.uid
LEFT JOIN major ON users.majorId=major.id
WHERE majorId=?`

            conn.query(sql, [req.user.majorId], (err, rows) => {
              if (err)
                throw err;

              var majorInfo = rows[0];
              majorInfo.avg = (majorInfo.sum / majorInfo.count).toFixed(0);
              sql = `SELECT
              sumpoint, a.uid, majorId, eventCount,
              ( @rank := @rank + 1 ) AS rank
          FROM
              (SELECT count(*) AS eventCount, sum(point) AS sumpoint, kakaoId, uid, majorId, college
              FROM festival_20_status 
              LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
              LEFT JOIN users ON users.id=festival_20_status.uid
              LEFT JOIN major ON users.majorId=major.id
              GROUP BY uid) AS a,
          ( SELECT @rank := 0 ) AS b 
          WHERE majorId=?
          ORDER BY
              a.sumpoint DESC, eventCount DESC`

              conn.query(sql, [req.user.majorId], (err, rows) => {
                if (err)
                  throw err;

                var majorRank = rows;

                if (rows.length > 0) {
                  majorRank = majorRank.filter(x => x.uid == req.user.id)[0]

                  if (majorRank) {
                    myinfo.sumpoint = majorRank.sumpoint;
                    myinfo.eventCount = majorRank.eventCount;
                    majorRank = majorRank.rank;
                  }
                }

                sql = `SELECT
                sumpoint, a.uid, majorId,eventCount,
                ( @rank := @rank + 1 ) AS rank
            FROM
                (SELECT count(*) AS eventCount, sum(point) AS sumpoint, kakaoId, uid, majorId, college
                FROM festival_20_status 
                LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
                LEFT JOIN users ON users.id=festival_20_status.uid
                LEFT JOIN major ON users.majorId=major.id
                GROUP BY uid) AS a,
                ( SELECT @rank := 0 ) AS b 
                WHERE college=?
            ORDER BY
                a.sumpoint DESC, eventCount DESC`

                conn.query(sql, [req.user.college], (err, rows) => {
                  if (err)
                    throw err;

                  var collegeRank = rows;
                  if (rows.length > 0)
                    collegeRank = collegeRank.filter(x => x.uid == req.user.id)[0]
                  if (collegeRank)
                    collegeRank = collegeRank.rank

                  sql = `SELECT
                  sumpoint, a.uid, majorId,eventCount,
                  ( @rank := @rank + 1 ) AS rank
              FROM
                  (SELECT count(*) AS eventCount,sum(point) AS sumpoint, kakaoId, uid, majorId, college
                  FROM festival_20_status 
                  LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
                  LEFT JOIN users ON users.id=festival_20_status.uid
                  LEFT JOIN major ON users.majorId=major.id
                  GROUP BY uid) AS a,
                  ( SELECT @rank := 0 ) AS b 
              ORDER BY
                  a.sumpoint DESC, eventCount DESC`

                  conn.query(sql, (err, rows) => {
                    if (err)
                      throw err;

                    var schoolRank = rows;
                    if (rows.length > 0)
                      schoolRank = schoolRank.filter(x => x.uid == req.user.id)[0]
                    if (schoolRank)
                      schoolRank = schoolRank.rank


                    res.render('commu/festival20/myinfo', {
                      user: req.user,
                      info: {
                        title: '2020 동화제',
                        titlehref: '/commu/festival',
                        headbar: []
                      },
                      myinfo: myinfo,
                      schoolInfo: schoolInfo,
                      collegeInfo: collegeInfo,
                      majorInfo: majorInfo,
                      majorRank: majorRank,
                      collegeRank: collegeRank,
                      schoolRank: schoolRank
                    })
                  });
                });
              });
            })
          })
        })
      })
    } else {
      return res.redirect('/commu/festival/info')
    }
  })
})

router.get('/record', (req, res) => {

  // var sql = `select host, eventName, startTime, endTime, location, type, description, point,
  //             users.name, users.majorId, major, uid,
  //             DATE_FORMAT(onTime, "%H시 %i분") as onTime
  //             from festival_20_status
  //             LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
  //             LEFT JOIN users ON users.id=festival_20_status.uid
  //             LEFT JOIN major ON users.majorId=major.id
  //             ORDER BY festival_20_status.onTIme DESC
  //             LIMIT 30`

  sql = `select sum(point) as sumPoint, count(*) AS eventCount,
              users.name, users.majorId, major
              from festival_20_status
              LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
              LEFT JOIN users ON users.id=festival_20_status.uid
              LEFT JOIN major ON users.majorId=major.id
              GROUP BY users.kakaoId
              ORDER BY sumPoint DESC, eventCount DESC
              `

  conn.query(sql, (err, rows) => {
    if (err)
      throw err;

    var rank;
    if (rows.length > 0)
      rank = rows;
    else
      rank = [];

    res.render('commu/festival20/record', {
      user: req.user,
      info: {
        title: '2020 동화제',
        titlehref: '/commu/festival',
        headbar: []
      },
      rank: rank
    })
  })
})

router.get('/final', (req, res) => {

  var sql = `select sum(point) as sumPoint, count(*) AS eventCount,
              users.name, users.majorId, major, phone
              from festival_20_status
              LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
              LEFT JOIN users ON users.id=festival_20_status.uid
              LEFT JOIN major ON users.majorId=major.id
              GROUP BY users.kakaoId
              ORDER BY sumPoint DESC, eventCount DESC
              LIMIT 100`

  conn.query(sql, (err, rows) => {
    if (err)
      throw err;

    var rank = rows;

    //점수 순위
    sql = `SELECT
            sumpoint, name, major,
            ( @rank := @rank + 1 ) AS rank
            FROM
            (SELECT count(*) AS eventCount,sum(point) AS sumpoint, kakaoId, uid, majorId, college, name, major
            FROM festival_20_status 
            LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
            LEFT JOIN users ON users.id=festival_20_status.uid
            LEFT JOIN major ON users.majorId=major.id
            GROUP BY uid) AS a,
            ( SELECT @rank := 0 ) AS b 
            ORDER BY
            a.sumpoint DESC
            LIMIT 5`

    conn.query(sql, (err, rows) => {
      if (err)
        throw err;

      var point = rows;

      //참여 행사 순위
      sql = `SELECT
      eventCount, name, major,
      ( @rank := @rank + 1 ) AS rank
      FROM
      (SELECT count(*) AS eventCount,sum(point) AS sumpoint, kakaoId, uid, majorId, college, name, major
      FROM festival_20_status 
      LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
      LEFT JOIN users ON users.id=festival_20_status.uid
      LEFT JOIN major ON users.majorId=major.id
      GROUP BY uid) AS a,
      ( SELECT @rank := 0 ) AS b 
      ORDER BY
      eventCount DESC
      LIMIT 5`

      conn.query(sql, (err, rows) => {
        if (err)
          throw err;

        var count = rows;

        //가장 많이 참여한 행사
        sql = ` select count(distinct uid) as eventu, host, eventName
                from festival_20_status LEFT JOIN festival_20 ON festival_20_status.fid=festival_20.id
                GROUP BY host, eventName ORDER BY eventu DESC
                LIMIT 5`

        conn.query(sql, (err, rows) => {
          if (err)
            throw err;

          var eventMax = rows;

          //총 점수  학교 평균 점수  전체 참여자 수  QR코드 찍힌 횟수   1인당 평균 참여 행사 수    
          sql = ` select sum(point) as sumpoint, count(distinct uid) as cu, count(*) as sumcount
          From festival_20_status 
          LEFT JOIN festival_20 ON festival_20_status.fid=festival_20.id`

          conn.query(sql, (err, rows) => {
            if (err)
              throw err;

            var etc = rows[0];
            etc.avgpoint = (etc.sumpoint / etc.cu).toFixed(2);
            etc.avgcount = (etc.sumcount / etc.cu).toFixed(2);


            sql = `SELECT
            college, count(distinct uid) as uidc, sum(sumpoint) as collegesp, sum(eventCount) as collegeec, avg(sumpoint) as collegeavg
            FROM
            (SELECT count(*) AS eventCount, sum(point) AS sumpoint, kakaoId, uid, majorId, college
            FROM festival_20_status 
            LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
            LEFT JOIN users ON users.id=festival_20_status.uid
            LEFT JOIN major ON users.majorId=major.id
            GROUP BY uid) AS a
            WHERE college is not NULL
            GROUP BY college
            ORDER BY collegesp DESC`

            conn.query(sql, (err, rows) => {
              if (err)
                throw err;

              var college = rows;
              sql = `SELECT
                    major, count(distinct uid) as uidc, sum(sumpoint) as majorsp, sum(eventCount) as majorec , avg(sumpoint) as majoravg
                    FROM
                    (SELECT count(*) AS eventCount, sum(point) AS sumpoint, kakaoId, uid, majorId, college, major.major
                    FROM festival_20_status 
                    LEFT JOIN festival_20 ON festival_20.id=festival_20_status.fid
                    LEFT JOIN users ON users.id=festival_20_status.uid
                    LEFT JOIN major ON users.majorId=major.id
                    GROUP BY uid) AS a
                    WHERE college is not NULL
                    GROUP BY majorId
                    ORDER BY uidc DESC`

              conn.query(sql, (err, rows) => {
                if (err)
                  throw err;

                var major = rows;

                res.render('commu/festival20/final', {
                  user: req.user,
                  info: {
                    title: '2020 동화제',
                    titlehref: '/commu/festival',
                    headbar: []
                  },
                  rank: rank,
                  point: point,
                  count: count,
                  eventMax: eventMax,
                  etc: etc,
                  college: college,
                  major: major
                })
              });
            });
          });
        });
      });
    });
  })
})

router.get('/circles', (req, res) => {
  var sql = `SELECT users.id as id, username, kakaoId, token, email, majorId, major.college, major.major, schoolId, name, nickname,
  assoname, phone, grade, assoId, assocollege, location, logo, description, assoemail, assophone
  fROM users
  LEFT JOIN asso ON users.assoId=asso.id
  LEFT JOIN major ON users.majorId=major.id
  WHERE kakaoId=?`

  conn.query(sql, [req.query.kakaoId], (err, rows) => {
    if (err)
      throw err;

    if (rows.length > 0) {
      req.user = rows[0];

      sql = `select host, eventName, location, point, DATE_FORMAT(onTime, "%H시 %i분") as onTime
      from circlesstatus
      LEFT JOIN circles ON circles.id=circlesstatus.fid
      LEFT JOIN users ON users.id=circlesstatus.uid
      WHERE kakaoId = ?
      ORDER BY circlesstatus.onTIme DESC`

      conn.query(sql, [req.user.kakaoId], (err, rows) => { //쿼리문에 설문조사 횟수 * 15 를 더한걸 sumpoint로 해야 됨
        if (err)
          throw err;
        var myinfo = new Object();
        myinfo.now = rows;


        sql = `SELECT
                  sumpoint, a.uid, majorId,eventCount, major, name, surveycount,
                  ( @rank := @rank + 1 ) AS rank
              FROM
                  (SELECT count(*) AS eventCount, count(circlesstatus.survey) AS surveycount, sum(point)+(count(circlesstatus.survey)*15) AS sumpoint, kakaoId, uid, majorId, college, major.major as major, users.name as name
                  FROM circlesstatus 
                  LEFT JOIN circles ON circles.id=circlesstatus.fid
                  LEFT JOIN users ON users.id=circlesstatus.uid
                  LEFT JOIN major ON users.majorId=major.id
                  GROUP BY uid) AS a,
                  ( SELECT @rank := 0 ) AS b 
              ORDER BY
                  a.sumpoint DESC, eventCount DESC, surveycount DESC`

        conn.query(sql, (err, rows) => {
          if (err)
            throw err;

          let rank = rows.slice();

          rank = rank.map(x => {
            return {
              sumpoint: x.sumpoint,
              major: x.major,
              name: x.name[0] + '*' + x.name.substring(2),
              rank: rank
            }
          })
          var schoolRank = rows;
          if (rows.length > 0)
            schoolRank = schoolRank.filter(x => x.uid == req.user.id)[0]
          if (schoolRank)
            schoolRank = schoolRank

          if (!schoolRank)
            schoolRank = {
              rank: undefined,
            }

          res.render('commu/circles/circles', {
            user: req.user,
            info: {
              title: '2019 동화제',
              titlehref: '/commu/festival/circles',
              headbar: []
            },
            myinfo: myinfo,
            schoolRank: schoolRank,
            rank: rank
          })
        });
      })
    } else {
      return res.redirect('/commu/festival/circlesInfo')
    }
  })
})


module.exports = router;