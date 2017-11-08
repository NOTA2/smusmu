require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var deasync = require('deasync');
var app = express();
var schedule = require('node-schedule');
const fs = require('fs');

var cEat = require('./module/crawling_Eat');
var cNotice = require('./module/crawling_Notice');
var kmaWeather = require('./module/weather');
var where = require('./module/where');
var rental = require('./module/rental');
var mode = 0;
var user = new Array();
var userCount = 0;

//설명글 텍스트 파일 로드
var explanation = fs.readFileSync('explanation/explanation.txt', 'utf8');
var explanation_eat = fs.readFileSync('explanation/explanation_eat.txt', 'utf8');
var explanation_where = fs.readFileSync('explanation/explanation_where.txt', 'utf8');
var explanation_pn = fs.readFileSync('explanation/explanation_pn.txt', 'utf8');
var explanation_rental = fs.readFileSync('explanation/explanation_rental.txt', 'utf8');
var explanation_notice = fs.readFileSync('explanation/explanation_notice.txt', 'utf8');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

console.log('APIs initialize');

//서버를 계속 유지
app.listen(80, function() {
  console.log('Connect 80 port');
});

var eatR = '' //미백관 식단
var eatT = '' //밀관 식단
var weatherResult = ''; //날씨 정보
var rentalResult;

//매주 일요일 마다 학식 정보가 업데이트 되게 한다.
var ruleEat = new schedule.RecurrenceRule();
ruleEat.dayOfWeek = 0;
ruleEat.hour = 0;
ruleEat.minute = 1;
var scheduleEat = schedule.scheduleJob(ruleEat, function() {
  setResultEat();
});

//매시간 41분 날씨 업데이트
var ruleWeather = new schedule.RecurrenceRule();
ruleWeather.minute = 41;
var scheduleEat = schedule.scheduleJob(ruleWeather, function() {
  setResultWeather();
});

//stock.json 파일이 변경 될때마다 대여 물품 정보를 가져오는 함수를 실행한다.
fs.watch('./asset/stock.json', function(){
  setResultRental();
});

setResultEat(); //최소 서버 실행시 학식 정보 업데이트
setResultWeather(); //날씨 정보 최초 업데이트
setResultRental(); //대여물품 정보 최초 업데이트

app.get('/keyboard', (req, res) => {
  const menu = {
    type: 'buttons',
    buttons: ["스뮤스뮤 사용하기"]
  };

  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(menu));
});

app.post('/message', (req, res) => {
  const _obj = {
    user_key: req.body.user_key,
    type: req.body.type,
    content: req.body.content
  };
  var massage;
  var idx = user.findIndex(x => x.user_key == _obj.user_key);;
  if (idx == -1) {
    user[userCount] = {
      user_key: _obj.user_key,
      mode: 0
    }
    idx = userCount;
    userCount++;
    console.log(userCount + "번째 멤버 등록\n");
  }


  if (_obj.content == '스뮤스뮤 사용하기')
    user[idx].mode = 0;
  else if (_obj.content == '오늘 학식은 뭐에요?')
    user[idx].mode = 1;
  else if (_obj.content == '학교에 특별한 일 있나요?')
    user[idx].mode = 2;
  else if (_obj.content == '오늘 학교 날씨!')
    user[idx].mode = 3;
  else if (_obj.content == '빌릴 수 있나요?')
    user[idx].mode = 4;
  else if (_obj.content == '뒤로가기')
    user[idx].mode = 0;

  if (user[idx].mode == 0) {
    massage = {
      "message": {
        "text": explanation
      },
      "keyboard": {
        type: 'buttons',
        buttons: ["오늘 학식은 뭐에요?",
          "학교에 특별한 일 있나요?",
          "오늘 학교 날씨!",
          "빌릴 수 있나요?"
        ]
      }
    };
  } else if (user[idx].mode == 1) {
    if (_obj.content == '오늘 학식은 뭐에요?')
      result = explanation_eat;
    else
      result = setResult(_obj.content, user[idx].mode);

    massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: ["미래백년관", "밀레니엄관", "뒤로가기"]
      }
    };
  } else if (user[idx].mode == 2) {
    if (_obj.content == '글 검색하기') {
      massage = {
        "message": {
          "text": "검색할 키워드를 입력해 주세요."
        }
      };
    } else {
      if (_obj.content == '학교에 특별한 일 있나요?')
        result = explanation_notice;
      else
        result = setResult(_obj.content, user[idx].mode);

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: ["최근 글 보기", "글 검색하기", "뒤로가기"]
        }
      };
    }
  } else if (user[idx].mode == 3) {
    result = setResult(_obj.content, user[idx].mode);

    massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: ["오늘 학식은 뭐에요?",
          "학교에 특별한 일 있나요?",
          "오늘 학교 날씨!",
          "빌릴 수 있나요?"
        ]
      }
    };
  } else if (user[idx].mode == 4) {
    if(_obj.content == '대여 물품 현황'){
      var buttonlist = setResult(_obj.content, user[idx].mode);

      massage = {
        "message": {
          "text": '현황을 확인할 학생회를 선택해 주세요!'
        },
        "keyboard": {
          type: 'buttons',
          buttons: buttonlist
        }
      };
    } else{
      if (_obj.content == '빌릴 수 있나요?')
          result = explanation_rental;

        else
          result = setResult(_obj.content, user[idx].mode);

        massage = {
          "message": {
            "text": result
          },
          "keyboard": {
            type: 'buttons',
            buttons: ["대여 물품 목록",
              "대여 물품 현황",
              "뒤로가기"
            ]
          }
        };
      }

  }

  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(massage));
});

//사용자에게 보내는 메세지 결과를 만들어 준다.
function setResult(keyword, mode) {

  var result;

  if (mode == 1) {
    result = getResultEat(keyword);
  } else if (mode == 2) {
    cNotice.search(keyword)
      .then(temp => {
        if (temp == '[등록된 게시물이 없습니다.]\n')
          result = temp;
        else
          result = resultSetNotice(keyword, temp);
      });
  } else if (mode == 3) {
    result = weatherResult;
  } else if (mode == 4) {
    result = getRentalResult(keyword, rentalResult);
  }

  while (result == undefined)
    deasync.runLoopOnce();

  return result;
}

//대여 관련 정보를 받아온다.
function setResultRental() {
  var peatRental = rentalResult;

  rental.search()
    .then(temp => {
      rentalResult = temp
    });

  while (rentalResult == peatRental) {
    deasync.runLoopOnce();
  }
}

//대여 정보를 각 분기에 따라서 다른 결과로 저장한다.
function getRentalResult(keyword, rentalResult){
  if(keyword =='대여 물품 목록')
    result = rentalResult[0];
  else if(keyword =='대여 물품 현황')
    result = rentalResult[1];
  else {
    temp = rentalResult[2];
    for(i in temp){
      if(temp[i][0] == keyword){
        result = temp[i][1];
        break;
      }
    }
  }

  return result;
}



//매주 일요일 마다 학식 정보를 받아온다.
function setResultEat() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("학식 정보를 업데이트 합니다\n");

  //변수의 변화를 감지해야 하기 때문에 과거의 값을 저장해 둔다.
  var peatR = eatR;
  var peatT = eatT;

  cEat.search('R')
    .then(temp1 => {
      eatR = temp1;
    });
  cEat.search('T')
    .then(temp2 => {
      eatT = temp2;
    });

  while (eatR == peatR || eatT == peatT) {
    deasync.runLoopOnce();
  }
}

//학식 정보를 반환한다.
function getResultEat(keyword) {
  var d = new Date();
  var day = d.getDay() - 1;
  var eatResult = '';

  if (day == -1 || day == 5) //일요일과 토요일은 운영되지 않는다.
    return '오늘은 식당이 운영되지 않습니다.'
  if (keyword == '미래백년관')
    eatResult = eatR[day];
  else if (keyword == '밀레니엄관')
    eatResult = eatT[day];

  return eatResult;
}

//매 시간 40분 마다 날씨 정보를 업데이트 한다.
function setResultWeather() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("날씨 정보를 업데이트 합니다\n");

  kmaWeather.search()
    .then(temp => {
      weatherResult = temp;
      console.log(weatherResult);
    });

  return weatherResult;

}

//공지사항 글을 보기 좋게 정리해서 리턴
function resultSetNotice(keyword, temp) {
  var noticeResult = '';

  if (keyword == '최근 글 보기')
    noticeResult += '가장 최근 4개의 게시글 입니다.\n\n'
  else
    noticeResult += keyword + '(으)로 검색한 최근 게시글 입니다.\n\n'

  for (i = 0; i < 4 && i < temp.length; i++) {
    noticeResult += temp[i][0] + "\n";
    noticeResult += temp[i][1] + "\n\n";
  }

  return noticeResult;
}
