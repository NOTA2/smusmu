var cheerio = require('cheerio');
var request = require('request');
var deasync = require('deasync');
var conn = require('../config/db');

exports.search = function () {
  var d = new Date();
  var time = d.toFormat("YYYY-MM-DD HH24:MI:SS");
  var date = d.toFormat("YYYY-MM-DD");

  console.log(time + " 집회정보 업데이트 시작");

  urlt = "https://twitter.com/poltra02"; //트위터 주소
  urld = "http://www.smpa.go.kr/user/nd54882.do" //상세정보를 얻기위한 서울지방 경찰청 주소
  var check = 0;
  var result = new Object();
  var d = new Date();
  result.idx = 0;
  result.detail = new Array();

  request(urld, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //HTML body
      var $ = cheerio.load(body);

      var today = (d.getFullYear() + '').substr(2, 2) + ("00" + (d.getMonth() + 1)).slice(-2) + ("00" + d.getDate()).slice(-2);

      try {
        var boardNo = $("td.subject > a:contains('" + today + "')").attr('href').split('\'');
        boardNo = boardNo[boardNo.length - 2];

        request(urld + "?View&boardNo=" + boardNo, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //HTML body
            var $ = cheerio.load(body);

            $(".reply-content > img").each(function (idx, el) {
              result.detail.push('http://www.smpa.go.kr/' + $(el).attr("src"));
            });

          }
        });
      } catch (e) {
        console.log(e);
      } finally {
        check++;
      }

    }
  });

  while (check != 1) {
    deasync.runLoopOnce();
  }

  request(urlt, function (error, response, body) {
    if (!error && response.statusCode == 200) {

      //HTML body
      var $ = cheerio.load(body);
      d.setDate(d.getDate() - 1);
      var today = d.getDate();


      result.twitter = new Array();

      ele = $(".AdaptiveMediaOuterContainer");

      $(ele).each(function (idx, el) {
        var time = $(el).siblings(".stream-item-header").find('.tweet-timestamp').attr("title");
        time = parseInt(time.split(' ')[3]);

        temptext = $(el).siblings(".js-tweet-text-container").text().replace(/ /gi, "").replace(/\t/g, "").replace(/\n/g, "");

        if (today != time) { //오늘 날짜에 올라온 것인지 판단
          return true;
        }
        //이미지가 있는 노드의 부모의 형제를 찾아감
        var str = $(el).siblings(".js-tweet-text-container").text().trim();
        //이미지가 있는 노드의 자식인 img로 찾아감
        var imgurl = $(el).find("img").attr("src")

        result.twitter[result.idx] = new Object();
        result.twitter[result.idx].str = str.replace('#poltra', '').replace(/pic[./A-Za-z1-9]+/g, '');
        result.twitter[result.idx].buttonUrl = imgurl;

        result.idx++;
      });


      var sql = `SELECT * FROM seoulAssembly WHERE date=?`
      jsondata = JSON.stringify(result);
      var param = {
        "date": date,
        "jsonData": jsondata
      };

      conn.query(sql, [date], function (err, rows) {
        if (err) {
          console.log("query error 발생");
          console.log(err);
          throw err
        }
        if (rows.length > 0) { //이미 있으면 확인 후 UPDATE
          var temp = JSON.parse(rows[0].jsonData);
          
          if (temp.idx > 0 && temp.detail.length > 0) {   //이미 전부다 있으면 업데이트할 필요가 없다.
            return;
          } else {
            sql = `UPDATE seoulAssembly SET jsondata = ? WHERE date=?`
            conn.query(sql, [jsondata, date], function (err, rows) {
              if (!err) {
                console.log('집회/공사 정보 업데이트 완료');
              } else {
                console.log("query error 발생");
                console.log(err);
                throw err
              }
            });
          }
        } else { //없으면 INSERT
          sql = `INSERT INTO seoulAssembly SET ?`
          conn.query(sql, [param], function (err, rows) {
            if (!err) {
              console.log('집회/공사 정보 업데이트 완료');
            } else {
              console.log("query error 발생");
              console.log(err);
              throw err
            }
          });
        }
      })
    }
  });
}