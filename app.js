require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var deasync = require('deasync');
var app = express();
var schedule = require('node-schedule');
const fs = require('fs');

var cEat = require('./module/crawling_Eat');
var chEat = require('./module/crawling_Eat_happy');
var cNotice = require('./module/crawling_Notice');
var cNoticeContents = require('./module/crawling_Notice_Contents');
var kmaWeather = require('./module/weather');
var where = require('./module/where');
var rental = require('./module/rental');
var seoulAssembly = require('./module/seoulAssembly');
var calendar = require('./module/calendar');
var phonePeople = require('./module/phone_people');
var user = new Array();
var userCount = 0;

//설명글 텍스트 파일 로드
var explanation = fs.readFileSync('explanation/explanation.txt', 'utf8');
var explanation_eat = fs.readFileSync('explanation/explanation_eat.txt', 'utf8');
var explanation_where = fs.readFileSync('explanation/explanation_where.txt', 'utf8');
var explanation_pn = fs.readFileSync('explanation/explanation_pn.txt', 'utf8');
var explanation_rental = fs.readFileSync('explanation/explanation_rental.txt', 'utf8');
var explanation_notice = fs.readFileSync('explanation/explanation_notice.txt', 'utf8');
var explanation_seoulAssembly = fs.readFileSync('explanation/explanation_seoulAssembly.txt', 'utf8');
var explanation_cal = fs.readFileSync('explanation/explanation_cal.txt', 'utf8');

/*********************************
초기 설정 코드
**********************************/

const MAIN = 10;
const EX = 1;
const EAT = 20;
const EATW = 21;
const NTC = 30;
const NTCL= 31;
const NTCR= 32;
const WTR = 40;
const RNT = 50;
const SAL = 60;
const CAL = 70;
const CALM = 71;
const CALS = 72;
const PHN = 80;  //전화번호 기능
const PHNO = 81;
const PHNP = 82;
const PHNC = 89;
var mode = MAIN;

const mainstr = '스뮤스뮤 사용하기'
const firststr = '처음으로'
const explanationbt = '사용법 확인!'
const eatstr = '학식정보'
const ntcstr = '학교 공지사항'
const wtrstr = '학교 날씨'
const rntstr = '학생회 대여 물품 현황'
const salstr = '서울시 집회정보'
const calstr = '학사일정 검색'
const phstr = '전화번호 검색'
const backstr = '뒤로가기'

var mainbutton = [explanationbt, eatstr, ntcstr, wtrstr, salstr, calstr];
var ntcbutton = ["최근 글 보기", "글 검색하기", firststr];
var calbutton = ["월 별 검색", "일정 검색", firststr];
var phbutton = ["기관 검색", "인명 검색", firststr];
var daystr = ['월', '화', '수', '목', '금', '토', '일'];


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

var eatR = ''; //미백관 식단
var eatT = ''; //밀관 식단
var eatH = ''; //행복기숙사 식단
var weatherResult = ''; //날씨 정보
var seoulAssemblyResult; //집회정보 저장
var rentalResult;
var calendarResult; //학사정보 저장



setResultEat(); //최소 서버 실행시 학식 정보 업데이트
setResultWeather(); //날씨 정보 최초 업데이트
setResultRental(); //대여물품 정보 최초 업데이트
setseoulAssembly();  //시위정보 최초 업데이트
setCalendar();  //학사일정 최초 업데이트
makeweek();

//매일 마다 학식 정보가 업데이트 되게 한다.
var ruleEat = new schedule.RecurrenceRule();
ruleEat.hour = 6;
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
var ruleseoulAssembly = new schedule.RecurrenceRule();
ruleseoulAssembly.dayOfWeek = [0, new schedule.Range(0,6)];
ruleseoulAssembly.hour = new schedule.Range(5, 10, 1);
ruleseoulAssembly.minute = new schedule.Range(0, 59, 5);
var scheduleEat = schedule.scheduleJob(ruleseoulAssembly, function() {
  setseoulAssembly();
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

app.post('/signIn', function(req, res){
  res.render('home');
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
      mode: 0,
      noticeArr : [],
      phoneArr : []
    }
    idx = userCount;
    userCount++;
    console.log(userCount + "번째 멤버 등록\n");
  }

  user[idx].mode = setMode(_obj.content, user[idx].mode)

  if (user[idx].mode == MAIN) {
    massage = {
      "message": {
        "text": '원하는 버튼을 선택해주스뮤!'
      },
      "keyboard": {
        type: 'buttons',
        buttons: mainbutton
      }
    };
  } else if (user[idx].mode == EX) {
    massage = {
      "message": {
        "text": explanation
      },
      "keyboard": {
        type: 'buttons',
        buttons: mainbutton
      }
    };
  } else if (bigMode(user[idx].mode) == EAT) {
    //일주일 메뉴를 눌렀을 때
    if(_obj.content.indexOf('일주일') != -1 || user[idx].mode == EATW){
      user[idx].mode = EATW
      var thisweek;

      //버튼을 생성하는 과정
      if((_obj.content).indexOf('미래백년관') != -1)
        thisweek = makeweek("미래백년관 - ")
      else if((_obj.content).indexOf('밀레니엄관') != -1)
        thisweek = makeweek("밀레니엄관 - ")
      else
        thisweek = makeweek("홍제기숙사 - ")

      if(_obj.content.indexOf('일주일') != -1)
        result = '원하는 날을 선택해 주세요.'
      else
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
    //처음 학식 정보 버튼을 눌렀을때 혹은 오늘의 메뉴 버튼을 누른경
    else{
      if (_obj.content.indexOf('오늘') != -1)
        result = setResult(_obj.content, user[idx].mode);
      else
        result = explanation_eat;

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: ["미래백년관(오늘)", "미래백년관(일주일)","밀레니엄관(오늘)","밀레니엄관(일주일)","홍제기숙사(오늘)","홍제기숙사(일주일)", firststr]
        }
      };
    }
  } else if (bigMode(user[idx].mode) == NTC) {
    if(user[idx].mode == NTC || user[idx].mode == NTCL){
      //글 검색하기 버튼을 누른 경우
      if (_obj.content == '글 검색하기') {
        massage = {
          "message": {
            "text": "검색할 키워드를 입력해 주세요."
          }
        };
      } else {
        //공지사항 확인을 들어온 경우.
        if (user[idx].mode == NTC){
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

          //글 검색하기에서 검색결과가 없을 경우
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
          //글 검색하기에서 검색결과가 있을 경우 혹은 최신글 보기를 누른 경우
          else {
            user[idx].noticeArr = result;
            user[idx].mode = NTCR;
            massage = {
              "message": {
                "text": user[idx].noticeArr[3]
              },
              "keyboard": {
                type: 'buttons',
                buttons: user[idx].noticeArr[0]
              }
            };
          }
        }
      }
    }
    //공지사항 글 클릭시 상세 내용을 출력
    else if(user[idx].mode == NTCR){
      resultstr=resultSetDetailNotice(_obj.content, user[idx].noticeArr);

      massage = {
        "message": {
          "text": resultstr
        },
        "keyboard": {
          type: 'buttons',
          buttons: user[idx].noticeArr[0]
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
            buttons: ["대여 물품 목록", "대여 물품 현황", firststr]
          }
        };
      }
  } else if(user[idx].mode == SAL) {
    if (_obj.content == salstr){
      result = explanation_seoulAssembly;

      if(seoulAssemblyResult == '집회정보가 없습니다.'){
        seoulAssemblyResult = new Array();
        seoulAssemblyResult[0] = new Array();
      }

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: seoulAssemblyResult[0].concat([firststr])
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
          buttons: seoulAssemblyResult[0].concat([firststr])
        }
      };
    }
  } else if(bigMode(user[idx].mode) == CAL) {
    if(user[idx].mode == CAL){
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
    else{
      if(_obj.content == "월 별 검색"){

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
      else if(user[idx].mode == CALM){
        result = setResult(_obj.content, user[idx].mode)

        massage = {
          "message" : {
            "text" : result
          },
          "keyboard" : {
            type : 'buttons',
            buttons : calendarResult[0]
          }
        };
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
        };
      }
    }
  } else if(bigMode(user[idx].mode) == PHN){
    if(_obj.content == phstr){
      result = explanation_pn;

      massage = {
        "message" : {
          "text" : result
        },
        "keyboard" : {
          type : 'buttons',
          buttons : phbutton
        }
      }
    }
    else if(_obj.content == "기관 검색" || _obj.content == "인명 검색"){
      k = ''
      if(_obj.content == "기관 검색"){
        k = '기관';
        user[idx].mode = PHNO;
      }
      else{
        k = '사람';
        user[idx].mode = PHNP
      }

      massage = {
        "message" : {
          "text" : "검색할 "+k+"을 입력해 주세요."
        }
      }
    }
    else if(user[idx].mode == PHNO || user[idx].mode == PHNP){
      result = setResult(_obj.content, user[idx].mode)

      if(result == '검색결과가 없습니다.'){
        user[idx].mode = PHN;
        massage = {
          "message" : {
            "text" : result
          },
          "keyboard" : {
            type : 'buttons',
            buttons : phbutton
          }
        }
      }
      else{
        user[idx].phoneArr = result;
        user[idx].mode = PHNC;
        massage = {
          "message" : {
            "text" : '검색 결과입니다.\n원하는 검색 결과를 선택하세요.'
          },
          "keyboard" : {
            type : 'buttons',
            buttons : user[idx].phoneArr[0]
          }
        }
      }
    }
    else if(user[idx].mode == PHNC){
      result = getphonecontent(_obj.content, user[idx].phoneArr)
      user[idx].mode = PHN;
      massage = {
        "message" : {
          "text" : result
        },
        "keyboard" : {
          type : 'buttons',
          buttons : phbutton
        }
      }
    }
  }

  res.set({
    'content-type': 'application/json'
  }).send(JSON.stringify(massage));
});

//받은 메시시를 바탕으로 모드를 정한다.
function setMode(content, mode){
  if (content == backstr)
    mode = bigMode(mode);
  else if (content == mainstr || content == firststr)
    mode = MAIN;
  else if (content == explanationbt)
    mode = EX;
  else if (content == eatstr)
    mode = EAT;
  else if (content == ntcstr)
    mode = NTC;
  else if (content == ntcbutton[0] || content == ntcbutton[1])
    mode = NTCL
  else if (content == wtrstr)
    mode = WTR;
  else if (content == rntstr)
    mode = RNT;
  else if(content == salstr)
    mode = SAL;
  else if(content == calstr)
    mode = CAL;
  else if (content == calbutton[0])
    mode = CALM
  else if (content == calbutton[1])
    mode = CALS
  else if(content == phstr)
    mode = PHN;

  return mode;
}

//뒤로가기를 누르거나 크게봤을때 어느 모드인지 정하기 위해
function bigMode(mode){
  return parseInt((mode)/10)*10
}

//이번주 버튼 배열 생성
function makeweek(keyword){
  var thisweek = new Array();
  var dt = new Date();
  dt.setDate(dt.getDate() - (dt.getDay()-1));
  var time = dt.toFormat("MM/DD");

  thisweek.push(backstr)

  for(var i=0;i<7;i++){
    time += ' ('+daystr[i]+')'
    thisweek.push(keyword + time);
    dt.setDate(dt.getDate() +1)
    time = dt.toFormat("MM/DD");
  }
  return thisweek;
}


//사용자에게 보내는 메세지 결과를 만들어 준다.
function setResult(keyword, mode) {

  var result;

  if (bigMode(mode) == EAT) {
    result = getResultEat(keyword, mode);
  } else if (bigMode(mode) == NTC) {
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
  } else if (mode == SAL){
    result = getseoulAssembly(keyword);
  } else if (bigMode(mode) == CAL){
    result = getclaendar(keyword);
  } else if (bigMode(mode) == PHN){
    result = getphonearr(mode, keyword);
  }

  while (result == undefined)
    deasync.runLoopOnce();

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
  var teatH;

  cEat.search('R')
    .then(temp1 => {
      teatR = temp1;
    });

  cEat.search('T')
    .then(temp2 => {
      teatT = temp2;
    });

  chEat.search()
    .then(temp3 => {
      teatH = temp3;
    })

  while (teatR == undefined || teatT == undefined || teatH == undefined) {
    deasync.runLoopOnce();
  }

  eatR = teatR;
  eatT = teatT;
  eatH = teatH;
  console.log(eatR);
  console.log(eatT);
  console.log(eatH);
}

//요청한 학식 정보를 반환한다.
function getResultEat(keyword, mode) {
  var d = new Date();
  var day;
  var eatResult = '';

  if(mode == EAT){
    day = d.getDay() - 1;
    if(day == -1)
      day = 6

    if (keyword == '미래백년관(오늘)')
      eatResult = eatR[day];
    else if (keyword == '밀레니엄관(오늘)')
      eatResult = eatT[day];
    else if (keyword == '홍제기숙사(오늘)')
      eatResult = eatH[day];
  }
  else{
    day = daystr.indexOf(keyword[15])
    if(keyword.indexOf('미래백년관') != -1)
      eatResult = eatR[day]
    else if(keyword.indexOf('밀레니엄관') != -1)
      eatResult = eatT[day]
    else if(keyword.indexOf('홍제기숙사') != -1)
      eatResult = eatH[day]
  }

  return eatResult;
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
function setseoulAssembly(){
  console.log("집회 정보 업데이트");

  var result = new Array();
  result[0] = new Array()
  var d = new Date();
  var day;
  var time = d.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);

  beforeseoulAssemblyResult = seoulAssemblyResult;
  seoulAssembly.search()
    .then(temp => {
      seoulAssemblyResult = temp;
    });

    while (seoulAssemblyResult == beforeseoulAssemblyResult) {
      deasync.runLoopOnce();
    }

    day = (d.getMonth() + 1) + '월 ' + d.getDate() +'일';

    if(seoulAssemblyResult.length != 0){
      result[0].push(day);
      result[1] = new Array();
      result[1].push(seoulAssemblyResult[0]);
      result[1].push(seoulAssemblyResult[1]);
    }

    if(!result[0].length){
      result = '집회정보가 없습니다.'
    }

    seoulAssemblyResult = result;
}

//집회 정보를 정리해서 가져온다.
function getseoulAssembly(keyword){
  var result;

  for(i=1;i<seoulAssemblyResult.length;i++){
    if(seoulAssemblyResult[0].indexOf(keyword) != -1){
      result = seoulAssemblyResult;
    }
  }
  return result;
}

//공지사항의 글 목록을 리턴
function resultSetNotice(keyword, temp) {
  var noticestr = '';

  if (keyword == '최근 글 보기')
    noticestr += '공지사항의 최근 게시글 목록입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 뒤로 돌아갑니다.\n'
  else
    noticestr += keyword + '(으)로 검색한 최근 게시글 목록입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 뒤로으로 돌아갑니다.\n'

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

//학사정보 업데이트
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

  if(calidx != -1){   //달 검색일 경우
    calidx--;
    for(var i =0;i<calendarResult[1][calidx].length;i+=2){
      calresultstr += calendarResult[1][calidx][i]+'\n'
      calresultstr += calendarResult[1][calidx][i+1]+'\n\n'
    }
  }else{          //일정명 검색일 경우
    for(var i = 0; i<calendarResult[1].length;i++){
      for(var j = 1; j<calendarResult[1][i].length; j+=2){
        if(calendarResult[1][i][j].indexOf(keyword) != -1){
          calresultstr += calendarResult[1][i][j-1] +'\n';
          calresultstr += calendarResult[1][i][j] + '\n\n';
          ch++
        }
      }
    }
    calresultstr = calresultstr.trim();
    if(ch == 0)
      calresultstr = '검색 결과가 없습니다.'
  }

  return calresultstr
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


//검색한 전화번호 배열을 가져온다.
function getphonearr(mode, keyword){
  var phonearr;

  if(mode == PHNO){
    phonearr = '검색결과가 없습니다.';
  }

  else if(mode == PHNP){
    phonePeople.search(keyword)
      .then(temp => {
        phonearr = temp
      });
  }

  while (phonearr == undefined) {
    deasync.runLoopOnce();
  }

  return phonearr;
}

//선택한 전화번호를 보여준다.
function getphonecontent(keyword, phArr){
  var pidx = phArr[0].indexOf(''+keyword);
  var phoneResultStr = '';

  var temp = phArr[0][pidx].split(' / ')
  phoneResultStr += '성명 : ' + temp[0] +'\n';
  phoneResultStr += '기관명 : ' + temp[1] +'\n';
  phoneResultStr += '직위/직급 : ' + temp[2] +'\n';
  phoneResultStr += '전화번호	: ' + phArr[1][pidx];

  return phoneResultStr;

}
