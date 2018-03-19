require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var deasync = require('deasync');
var app = express();
var schedule = require('node-schedule');
const fs = require('fs');

var cEat = require('./module/crawling_Eat');
var cNotice = require('./module/crawling_Notice');
var cNoticeContents = require('./module/crawling_Notice_Contents');
var kmaWeather = require('./module/weather');
var where = require('./module/where');
var rental = require('./module/rental');
var gwanghwamoon = require('./module/gwanghwamoon');
var calendar = require('./module/calendar');
var user = new Array();
var userCount = 0;

//설명글 텍스트 파일 로드
var explanation = fs.readFileSync('explanation/explanation.txt', 'utf8');
var explanation_eat = fs.readFileSync('explanation/explanation_eat.txt', 'utf8');
var explanation_where = fs.readFileSync('explanation/explanation_where.txt', 'utf8');
var explanation_pn = fs.readFileSync('explanation/explanation_pn.txt', 'utf8');
var explanation_rental = fs.readFileSync('explanation/explanation_rental.txt', 'utf8');
var explanation_notice = fs.readFileSync('explanation/explanation_notice.txt', 'utf8');
var explanation_gwanghwamoon = fs.readFileSync('explanation/explanation_gwanghwamoon.txt', 'utf8');
var explanation_cal = fs.readFileSync('explanation/explanation_cal.txt', 'utf8');

/*********************************
초기 설정 코드
**********************************/

const MAIN = 1;
const EAT = 2;
const EATR = 21;
const EATT = 22;
const NTC = 3;
const NTCR= 31;
const WTR = 4;
const RNT = 5;
const GHM = 6;
const CAL = 7;
const PHN = 8;  //전화번호 기능
var mode = MAIN;

const mainstr = '스뮤스뮤 사용하기'
const eatstr = '학식정보'
const ntcstr = '학교 공지사항'
const wtrstr = '학교 날씨'
const rntstr = '학생회 대여 물품 현황'
const ghmstr = '서울시 집회정보'
const calstr = '학사일정 검색'
const phone = '전화번호 검색'
const backstr = '뒤로가기'

var mainbutton = [eatstr, ntcstr, wtrstr, ghmstr, calstr];
var ntcbutton = ["최근 글 보기", "글 검색하기", backstr]
var calbutton = ["월 별 검색", "일정 검색", backstr]
var daystr = ['월', '화', '수', '목', '금'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//템플릿 엔진 설정 및 폴더 설정
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;     //jade로 웹페이지를 만들기 때문에 태그를 깔끔하게 정리해주는 설정

console.log('APIs initialize');

//서버를 계속 유지
app.listen(80, function() {
  console.log('Connect 80 port');
});

var eatR = '' //미백관 식단
var eatT = '' //밀관 식단
var weatherResult = ''; //날씨 정보
var gwanghwamoonResult; //집회정보 저장
var rentalResult;
var calendarResult; //학사정보 저장
var thisweek = new Array();


setResultEat(); //최소 서버 실행시 학식 정보 업데이트
setResultWeather(); //날씨 정보 최초 업데이트
setResultRental(); //대여물품 정보 최초 업데이트
setgwanghwamoon();  //시위정보 최초 업데이트
setCalendar();  //학사일정 최초 업데이트
makeweek();

//매주 일요일 마다 학식 정보가 업데이트 되게 한다.
var ruleEat = new schedule.RecurrenceRule();
ruleEat.dayOfWeek = 0;
ruleEat.hour = 0;
ruleEat.minute = 1;
var scheduleEat = schedule.scheduleJob(ruleEat, function() {
  setResultEat();
});

//22분 마다 날씨 업데이트
var ruleWeather = new schedule.RecurrenceRule();
ruleWeather.minute = new schedule.Range(0, 59, 22);
var scheduleEat = schedule.scheduleJob(ruleWeather, function() {
  setResultWeather();
});

//매일 6~9시에 5분 마다 집회정보 업데이트
var rulegwanghwamoon = new schedule.RecurrenceRule();
rulegwanghwamoon.dayOfWeek = [0, new schedule.Range(0,6)];
rulegwanghwamoon.hour = new schedule.Range(5, 10, 1);
rulegwanghwamoon.minute = new schedule.Range(0, 59, 5);
var scheduleEat = schedule.scheduleJob(rulegwanghwamoon, function() {
  setgwanghwamoon();
});

//stock.json 파일이 변경 될때마다 대여 물품 정보를 가져오는 함수를 실행한다.
fs.watch('/home/ubuntu/asset/stock.json', function(){
  setResultRental();
});



/*********************************
*********************************
여기서 부터는 웹 관련
**********************************
*********************************/



//jade의 index파일로 연결
app.get('/', function(req, res){
  res.render('index');
});

app.get('/login', function(req, res){
  fs.readFile('./web/index.html', function(err, data){
    if(err){
      console.log(err);
    } else{
      res.writeHead(200, {'Content-Type':'text/html'});
      res.end(data);
    }
  });
});


/*********************************
여기서 부터는 카카오톡 응답 관련 코드
**********************************/

app.get('/keyboard', (req, res) => {

  const menu = {
    type: 'buttons',
    buttons: [mainstr]
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


  if (_obj.content == mainstr)
    user[idx].mode = MAIN;
  else if (_obj.content == eatstr)
    user[idx].mode = EAT;
  else if (_obj.content == ntcstr)
    user[idx].mode = NTC;
  else if (_obj.content == wtrstr)
    user[idx].mode = WTR;
  else if (_obj.content == rntstr)
    user[idx].mode = RNT;
  else if(_obj.content == ghmstr)
    user[idx].mode = GHM;
  else if(_obj.content == calstr)
    user[idx].mode = CAL;
  else if (_obj.content == backstr)
    user[idx].mode = MAIN;

  if (user[idx].mode == MAIN) {
    massage = {
      "message": {
        "text": explanation
      },
      "keyboard": {
        type: 'buttons',
        buttons: mainbutton
      }
    };
  } else if (user[idx].mode == EAT || user[idx].mode == EATR || user[idx].mode == EATT) {
    if (_obj.content == eatstr || _obj.content.indexOf('오늘') != -1){
      if(_obj.content == eatstr)
      result = explanation_eat;

      else
        result = setResult(_obj.content, user[idx].mode);

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: ["미래백년관(오늘)", "미래백년관(일주일)","밀레니엄관(오늘)","밀레니엄관(일주일)", backstr]
        }
      };
    }

    else if(_obj.content.indexOf('일주일') != -1){
      if(_obj.content.indexOf('미래백년관') != -1)
        user[idx].mode = EATR;
      else
        user[idx].mode = EATT;

      massage = {
        "message": {
          "text": '원하는 날을 선택해 주세요.'
        },
        "keyboard": {
          type: 'buttons',
          buttons: thisweek
        }
      };
    }
    else{
      result = setResult(_obj.content, user[idx].mode);
      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: thisweek
        }
      };
    }
  } else if (user[idx].mode == NTC || user[idx].mode == NTCR) {
    if(user[idx].mode == NTC){
      if (_obj.content == '글 검색하기') {
        massage = {
          "message": {
            "text": "검색할 키워드를 입력해 주세요."
          }
        };
      } else {
        if (_obj.content == ntcstr){
            result = explanation_notice;

            massage = {
              "message": {
                "text": result
              },
              "keyboard": {
                type: 'buttons',
                buttons: ntcbutton
              }
            };
        }
        else{
          result = setResult(_obj.content, user[idx].mode);

          if (result == '[등록된 게시물이 없습니다.]\n'){
            massage = {
              "message": {
                "text": result
              },
              "keyboard": {
                type: 'buttons',
                buttons: ntcbutton
              }
            };
          }
          else {
            user[idx].mode = NTCR;
            massage = {
              "message": {
                "text": result[3]
              },
              "keyboard": {
                type: 'buttons',
                buttons: result[0]
              }
            };
          }
        }
      }
    }
    else if(user[idx].mode == NTCR){

      resultstr=resultSetDetailNotice(_obj.content, result);

      massage = {
        "message": {
          "text": resultstr
        },
        "keyboard": {
          type: 'buttons',
          buttons: result[0]
        }
      };
    }

  } else if (user[idx].mode == WTR) {
    result = setResult(_obj.content, user[idx].mode);

    massage = {
      "message": {
        "text": result
      },
      "keyboard": {
        type: 'buttons',
        buttons: mainbutton
      }
    };
    user[idx].mode = MAIN;
  } else if (user[idx].mode == RNT) {
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
      if (_obj.content == rntstr)
          result = explanation_rental;

        else
          result = setResult(_obj.content, user[idx].mode);

        massage = {
          "message": {
            "text": result,
          },
          "keyboard": {
            type: 'buttons',
            buttons: ["대여 물품 목록", "대여 물품 현황", backstr]
          }
        };
      }
  } else if(user[idx].mode == GHM) {
    if (_obj.content == ghmstr){
      result = explanation_gwanghwamoon;

      if(gwanghwamoonResult == '집회정보가 없습니다.'){
        gwanghwamoonResult = new Array();
        gwanghwamoonResult[0] = new Array();
      }

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: gwanghwamoonResult[0].concat([backstr])
        }
      };
    }
    else{
      result = setResult(_obj.content, user[idx].mode);

      massage = {
        "message": {
          "text": result[1][0],
          "photo": {
            "url": result[1][1],
            "width": 640,
            "height": 480
          }
        },
        "keyboard": {
          type: 'buttons',
          buttons: gwanghwamoonResult[0].concat([backstr])
        }
      };
    }
  } else if(user[idx].mode == CAL) {
    if(_obj.content == calstr){
      result = explanation_cal;

      massage = {
        "message" : {
          "text" : result
        },
        "keyboard" : {
          type : 'buttons',
          buttons : calbutton
        }
      }
    }
    else if(_obj.content == "월 별 검색"){

      massage = {
        "message" : {
          "text" : "검색할 달을 선택해 주세요."
        },
        "keyboard" : {
          type : 'buttons',
          buttons : calendarResult[0]
        }
      }
    }
    else if(_obj.content == "일정 검색"){
      massage = {
        "message" : {
          "text" : "검색할 일정을 입력해 주세요."
        }
      }
    }
    else{
      result = setResult(_obj.content, user[idx].mode)

      massage = {
        "message" : {
          "text" : result
        },
        "keyboard" : {
          type : 'buttons',
          buttons : calbutton
        }
      }
    }
  }

  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(massage));
});


//사용자에게 보내는 메세지 결과를 만들어 준다.
function setResult(keyword, mode) {

  var result;

  if (mode == EAT || mode == EATR || mode == EATT) {
    result = getResultEat(keyword, mode);
  } else if (mode == NTC) {
    cNotice.search(keyword)
      .then(temp => {
        if (temp == '[등록된 게시물이 없습니다.]\n')
          result = temp;
        else
          result = resultSetNotice(keyword, temp);
      });
  } else if (mode == WTR) {
    result = weatherResult;
  } else if (mode == RNT) {
    result = getRentalResult(keyword, rentalResult);
  } else if (mode == GHM){
    result = getgwanghwamoon(keyword);
  } else if (mode == CAL){
    result = getclaendar(keyword);
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


//일주일치 학식정보를 업데이트
function setResultEat() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("학식 정보를 업데이트 합니다\n");

  //변수의 변화를 감지해야 하기 때문에 과거의 값을 저장해 둔다.
  var teatR;
  var teatT;

  cEat.search('R')
    .then(temp1 => {
      teatR = temp1;
    });
  cEat.search('T')
    .then(temp2 => {
      teatT = temp2;
    });

  while (teatR == undefined || teatT == undefined) {
    deasync.runLoopOnce();
  }

  eatR = teatR;
  eatT = teatT;
  console.log(eatR);
  console.log(eatT);
}

//오늘의 학식 정보를 반환한다.
function getResultEat(keyword, mode) {
  var d = new Date();
  var day;
  var eatResult = '';



  if(mode == EAT){
    day = d.getDay() - 1;

    if (day == -1 || day == 5) //일요일과 토요일은 운영되지 않는다.
      return '오늘은 식당이 운영되지 않습니다.'

    if (keyword == '미래백년관(오늘)')
      eatResult = eatR[day];
    else if (keyword == '밀레니엄관(오늘)')
      eatResult = eatT[day];
  }
  else{
    day = daystr.indexOf(keyword[7])

    if(mode == EATR)
      eatResult = eatR[day]
    else if(mode == EATT)
      eatResult = eatT[day]
  }

  return eatResult;
}


function makeweek(){
  thisweek = [];
  var dt = new Date();
  dt.setDate(dt.getDate() - (dt.getDay()-1));
  var time = dt.toFormat("MM/DD");

  thisweek.push(backstr)

  for(var i=0;i<5;i++){
    time += ' ('+daystr[i]+')'
    dt.setDate(dt.getDate() +1)
    thisweek.push(time);
    time = dt.toFormat("MM/DD");
  }

}

//날씨 정보를 업데이트
function setResultWeather() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("날씨 정보를 업데이트 합니다\n");

  kmaWeather.search()
    .then(temp => {
      weatherResult = temp;
    });
}

//집회 정보 업데이트
function setgwanghwamoon(){
  console.log("집회 정보 업데이트");

  var result = new Array();
  result[0] = new Array()
  var d = new Date();
  var day = new Array();
  var time = d.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);

  beforegwanghwamoonResult = gwanghwamoonResult;
  gwanghwamoon.search()
    .then(temp => {
      gwanghwamoonResult = temp;
    });

    while (gwanghwamoonResult == beforegwanghwamoonResult) {
      deasync.runLoopOnce();
    }

    day[0] = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

    if(gwanghwamoonResult.length != 0){
      result[0].push(day[0]);
      result[1] = new Array();
      result[1].push(gwanghwamoonResult[0]);
      result[1].push(gwanghwamoonResult[1]);
    }

    if(!result[0].length){
      result = '집회정보가 없습니다.'
    }

    gwanghwamoonResult = result;
}

//집회 정보를 정리해서 가져온다.
function getgwanghwamoon(keyword){
  var result;

  for(i=1;i<gwanghwamoonResult.length;i++){
    if(gwanghwamoonResult[0].indexOf(keyword) != -1){
      result = gwanghwamoonResult;
    }
  }
  return result;
}

//공지사항의 글 목록을 리턴
function resultSetNotice(keyword, temp) {
  var noticestr = '';

  if (keyword == '최근 글 보기')
    noticestr += '공지사항의 최근 게시글 목록입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 처음으로 돌아갑니다.\n'
  else
    noticestr += keyword + '(으)로 검색한 최근 게시글 목록입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 처음으로 돌아갑니다.\n'

  temp.push(noticestr);
  temp[0].unshift(backstr);

  return temp;
}

//공지사항 글 클릭시 상세 내용을 출력해주기 위해 세부 내용 리턴
function resultSetDetailNotice(keyword, resultarr) {
  notice_idx = resultarr[0].indexOf(''+keyword) -1;

  var content ='';
  var url = resultarr[2][notice_idx];
  var resultstr;

  cNoticeContents.search(url)
    .then(temp => {
      content = temp
      console.log(temp);
    });

  while (content == '') {
    deasync.runLoopOnce();
  }

  resultstr = '[제목]\n'+resultarr[0][notice_idx+1]+'\n\n';
  resultstr += '[본문]\n'+ content;
  resultstr += '[PC 링크]\n' + resultarr[2][notice_idx];
  resultstr += '\n\n[모바일 링크]\n※ 첨부파일 확인 불가\n' + resultarr[1][notice_idx];

  return resultstr;
}


function setCalendar(){
  var calendartemp;
  console.log('학사정보 업데이트');
  calendar.crawling()
    .then(temp => {
      calendartemp = temp
    });

  while (calendartemp == undefined) {
    deasync.runLoopOnce();
  }

  calendarResult = calendartemp;
}

function getclaendar(keyword){
  calidx = calendarResult[0].indexOf(keyword);
  calresultstr = '';
  var ch = 0

  if(calidx != -1){
    calidx--;
    for(var i =0;i<calendarResult[1][calidx].length;i+=2){
      calresultstr += calendarResult[1][calidx][i]+'\n'
      calresultstr += calendarResult[1][calidx][i+1]+'\n\n'
    }
  }else{
    for(var i = 0; i<calendarResult[1].length;i++){
      for(var j = 1; j<calendarResult[1][i].length; j+=2){
        if(calendarResult[1][i][j].indexOf(keyword) != -1){
          calresultstr += calendarResult[1][i][j-1] +'\n';
          calresultstr += calendarResult[1][i][j] + '\n\n'
          ch++
        }
      }
    }
    if(ch == 0)
      calresultstr = '검색 결과가 없습니다.'
  }

  return calresultstr

}
