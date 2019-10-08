const conn = require('../../../config/db');
const async = require('async');
const router = require('express').Router();
const multer = require('multer');

const jobstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/job') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})
const jobupload = multer({
  storage: jobstorage
})


router.get('', (req, res) => {
  let sql = `SELECT * FROM job ORDER BY jobOrder`;

  conn.query(sql, (err, rows) => {
    if (err) {
      throw err;
    }

    rows.forEach(x=>{
      x.params = JSON.parse(x.params).map(y=>{
        return [
          y.name, y.value
        ]
      })
    })

    res.render('asso/kakao/job', {
      user: req.user,
      info: {
        title: '',
        titlehref: '/asso/kakao/job',
        headbar: []
      },
      job: rows
    });
  })
});

router.post('', jobupload.any(), (req, res) => {
  let jobs = req.body.job;

  req.files.forEach(x => {
    let fileIdx = x.fieldname.replace(/[^0-9]/g, '')[0];
    jobs[fileIdx].thumbnail = x.originalname;
  })
  
  //사진이 필수가 아니므로 추가작업 및 파리미터 정리

  jobs = jobs.map(x => {
    return [
      x.title,
      x.description,
      x.thumbnail ? x.thumbnail : null,
      x.url,
      x.jobOrder,
      JSON.stringify(x.params.filter(y => {
        if (y[0] === '')
          return false;
        return true;
      }).map(z => {
        return {
          name: z[0],
          value: z[1] ? z[1] : null,
        }
      })),
      x.id
    ]
  })

  jobs = jobs.filter(x=>true);
  let sql = `SELECT * FROM job WHERE id = ?`;

  async.forEachOf(jobs, function (job, i, inner_callback) {
    conn.query(sql, [job[6]], function (err, rows) {
      if (err) {
        inner_callback(err);
      } else {
        if (rows.length > 0) { //있다면 업데이트
          sql = `UPDATE job 
          SET title = ?, description=?, thumbnail=?, url=?, jobOrder=?, params=?
          WHERE jobOrder = ?`;

          conn.query(sql, job, (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).end();
            }
            inner_callback(null);
          });
        } else { //없다면 추가
          sql = `INSERT INTO job (title, description, thumbnail, url, jobOrder, params)
          VALUES (?, ?, ?, ?, ?, ?)`;

          conn.query(sql, job, (err, rows) => {
            if (err) {
              inner_callback(err);
            }
            inner_callback(null);
          });
        }
      }
    });
  }, function (err) {
    if (err) {
      throw err
    } else {
      res.redirect('/asso/kakao/job')
    }
  });
})

module.exports = router;