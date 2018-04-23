require('date-utils');
var express = require('express');
var bodyParser = require('body-parser');
var deasync = require('deasync');
var app = express();
var schedule = require('node-schedule');
var cheerio = require('cheerio');
var request = require('request');
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
var ipadd;


function setIp(){
  request("http://ip.ojj.kr/", function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      ipadd = $("body > center > h1 > font:nth-child(2)").text().trim()
    }
  });
  while (ipadd == undefined) {
    deasync.runLoopOnce();
  }
  if(ipadd ==  '52.78.69.176'){
    console.log(ipadd);
    mainstr = '공가미 사용하기';
    firstmsg = '원하는 버튼을 선택해주세요.';
    explanation = '상명대(서울) 공대 학우들을 위한 정보!\n공가미입니다.\n\n' + explanation;
    console.log('공가미 서버');
  }
  else{
    console.log(ipadd);
    mainstr = '스뮤스뮤 사용하기';
    firstmsg = '원하는 버튼을 선택해주스뮤!';
    explanation = '상명대(서울) 학우들을 위한 정보!\n스뮤스뮤입니다.\n\n' + explanation;
    console.log('스뮤스뮤 서버');
  }
}



/*********************************
초기 설정 코드
**********************************/

//템플릿 엔진 설정 및 폴더 설정
app.set('view engine', 'jade');
app.set('views', './views');
app.locals.pretty = true;     //jade로 웹페이지를 만들기 때문에 태그를 깔끔하게 정리해주는 설정
app.use(express.static('public'));
app.use(express.static('asset'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


const MAIN = 10;
const EX = 1;
const EAT = 20;
const EATW = 21;
const NTC = 30;
const NTCLR= 31;
const NTCS= 32;
const NTCLS= 33;
const NTCR= 34;
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
const FDMN = 100;

var mainstr;
var firstmsg;
setIp();
const firststr = '처음으로'
const explanationbt = '사용법 확인!'
const eatstr = '학식정보'
const foodMenustr = '학교 근처 식당 메뉴판'
const ntcstr = '학교 공지사항'
const wtrstr = '학교 날씨'
const salstr = '서울시 집회/공사정보'
const calstr = '학사일정 검색'

const rntstr = '학생회 대여 물품 현황'
const phstr = '전화번호 검색'
const backstr = '뒤로가기'

var mainbutton = [explanationbt, eatstr, foodMenustr, ntcstr, wtrstr, salstr, calstr];
var ntcbutton = [firststr, "최근 글 보기", "글 검색하기"];
var calbutton = [firststr, "월 별 검색", "일정 검색"];
var phbutton = [firststr, "기관 검색", "인명 검색"];
var daystr = ['월', '화', '수', '목', '금', '토', '일'];
var foodMenubutton = foodMenuBtMake();


//설명글 텍스트 파일 로드
var explanation = fs.readFileSync('./asset/explanation/explanation.txt', 'utf8');
var explanation_eat = fs.readFileSync('./asset/explanation/explanation_eat.txt', 'utf8');
var explanation_where = fs.readFileSync('./asset/explanation/explanation_where.txt', 'utf8');
var explanation_pn = fs.readFileSync('./asset/explanation/explanation_pn.txt', 'utf8');
var explanation_rental = fs.readFileSync('./asset/explanation/explanation_rental.txt', 'utf8');
var explanation_notice = fs.readFileSync('./asset/explanation/explanation_notice.txt', 'utf8');
var explanation_seoulAssembly = fs.readFileSync('./asset/explanation/explanation_seoulAssembly.txt', 'utf8');
var explanation_cal = fs.readFileSync('./asset/explanation/explanation_cal.txt', 'utf8');


console.log('APIs initialize');

//서버를 계속 유지
app.listen(80, function() {
  console.log('Connect 80 port');
});

var eat = new Object();
eat.R;  //미백관 식단
eat.T; //밀관 식단
eat.H; //행복기숙사 식단
var weatherResult = '날씨정보가 없습니다.'; //날씨 정보
var seoulAssemblyResult; //집회정보 저장
var calendarResult; //학사정보 저장
var rentalResult;




//최소 서버 실행시
setResultEat(); //학식 정보 업데이트
if(ipadd !=  '52.78.151.4')     //테스트 서버일 땐 하지 않습니다.
  setResultWeather(); //날씨 정보 최초 업데이트
setseoulAssembly();  //시위정보 최초 업데이트
setCalendar();  //학사일정 최초 업데이트

//setResultRental(); //대여물품 정보 최초 업데이트


//매일 마다 학식 정보가 업데이트 되게 한다.
var ruleEat = new schedule.RecurrenceRule();
ruleEat.hour = new schedule.Range(6, 11, 1);
ruleEat.minute = new schedule.Range(0, 59, 19);
var scheduleEat = schedule.scheduleJob(ruleEat, function() {
  setResultEat();
});

//22분 마다 날씨 업데이트
if(ipadd !=  '52.78.151.4'){     //테스트 서버일 땐 하지 않습니다.
  var ruleWeather = new schedule.RecurrenceRule();
  ruleWeather.minute = new schedule.Range(0, 59, 22);
  var scheduleEat = schedule.scheduleJob(ruleWeather, function() {
    setResultWeather();
  });
}
//매일 6~9시에 5분 마다 집회정보 업데이트
var ruleseoulAssembly = new schedule.RecurrenceRule();
ruleseoulAssembly.dayOfWeek = [0, new schedule.Range(0,6)];
ruleseoulAssembly.hour = new schedule.Range(5, 10, 1);
ruleseoulAssembly.minute = new schedule.Range(0, 59, 5);
var scheduleEat = schedule.scheduleJob(ruleseoulAssembly, function() {
  setseoulAssembly();
});

//stock.json 파일이 변경 될때마다 대여 물품 정보를 가져오는 함수를 실행한다.
// fs.watch('/home/ubuntu/stock.json', function(){
//   setResultRental();
// });



/*********************************
*********************************
여기서 부터는 웹 관련
**********************************
*********************************/



//jade의 index파일로 연결
app.get('/', function(req, res){
  var loginFail='';
  if(req.query.mode == 1){
    loginFail = '다시 입력해주세요.'
  }

  res.render('index', {loginFail:loginFail});
});

app.post('/signIn', function(req, res){
  var memberId = req.body.memberId;
  var memberPw = req.body.memberPw;

  if(checkMember(memberId, memberPw)){   //아이디와 비밀번호가 일치하면
    res.redirect('/home');
  }
  else{   //일치하지 않으면
    console.log('redirect');
    res.redirect(301, '/?mode=1');
  }
});


app.get('/home', function(req, res){
  res.render('home');
});


function checkMember(id, pw){
  if(id == 'a')
    return true;
  else
    return false;
}


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
      noticeObj : {page : 1, mode : NTC, keyword : ''},
      phoneArr : []
    }
    idx = userCount;
    userCount++;
    console.log(userCount + "번째 멤버 등록\n");
  }

  user[idx].mode = setMode(_obj.content, user[idx].mode);

  if (user[idx].mode == MAIN) {
    massage = {
      "message": {
        "text": firstmsg
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
        weekbt = eat.R.bt;
      else if((_obj.content).indexOf('밀레니엄관') != -1)
        weekbt = eat.T.bt;
      else
        weekbt = eat.H.bt;

      if(_obj.content.indexOf('일주일') != -1)
        result = '원하는 날을 선택해 주세요.'
      else
        result = setResult(_obj.content, user[idx]);

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: weekbt
        }
      };
    }
    //처음 학식 정보 버튼을 눌렀을때 혹은 오늘의 메뉴 버튼을 누른경
    else{
      if (_obj.content.indexOf('오늘') != -1)
        result = setResult(_obj.content, user[idx]);
      else
        result = explanation_eat;

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: [firststr, "미래백년관(오늘)", "미래백년관(일주일)","밀레니엄관(오늘)","밀레니엄관(일주일)","홍제기숙사(오늘)","홍제기숙사(일주일)"]
        }
      };
    }
  } else if (bigMode(user[idx].mode) == NTC) {
    //공지사항 글 클릭시 상세 내용을 출력
    if(user[idx].mode == NTCR){
      resultstr=resultSetDetailNotice(_obj.content, user[idx].noticeObj);

      user[idx].mode = user[idx].noticeObj.mode;

      massage = {
        "message": {
          "text": resultstr
        },
        "keyboard": {
          type: 'buttons',
          buttons: user[idx].noticeObj.bt
        }
      };
    }
    else{
      //글 검색하기 버튼을 누른 경우
      if (user[idx].mode == NTCS) {     //NTCS 모드
        massage = {
          "message": {
            "text": "검색할 키워드를 입력해 주세요."
          }
        };
      } else {
        //공지사항 확인을 들어온 경우.
        if (user[idx].mode == NTC){       //NTC 모드
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
        else if((user[idx].mode == NTCLR || user[idx].mode == NTCLS) && (_obj.content =='>' || _obj.content=='<')){

          if(_obj.content=='>')
            user[idx].noticeObj.page++;
          else if(_obj.content=='<')
            user[idx].noticeObj.page--;

          result = setResult(_obj.content, user[idx]);

          user[idx].noticeObj = result;

          massage = {
            "message": {
              "text": user[idx].noticeObj.explan
            },
            "keyboard": {
              type: 'buttons',
              buttons: user[idx].noticeObj.bt
            }
          };

        }
        else{             //NTCLR or NTCLS 모드를 처음 들어올때
          user[idx].noticeObj.page = 1;

          user[idx].noticeObj.mode = user[idx].mode;
          user[idx].noticeObj.keyword = _obj.content;

          result = setResult(_obj.content, user[idx]);

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
          //글 검색하기에서 검색결과가 있을 경우 혹은 최신글 보기를 누른 경우 글의 목록을 보여준다.
          else {
            user[idx].noticeObj = result;

            massage = {
              "message": {
                "text": user[idx].noticeObj.explan
              },
              "keyboard": {
                type: 'buttons',
                buttons: user[idx].noticeObj.bt
              }
            };
          }
        }
      }
    }

  } else if (user[idx].mode == WTR) {
    result = setResult(_obj.content, user[idx]);

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
      var buttonlist = setResult(_obj.content, user[idx]);

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
          result = setResult(_obj.content, user[idx]);

        massage = {
          "message": {
            "text": result,
          },
          "keyboard": {
            type: 'buttons',
            buttons: [firststr, "대여 물품 목록", "대여 물품 현황"]
          }
        };
      }
  } else if(user[idx].mode == SAL) {
    if (_obj.content == salstr){
      result = explanation_seoulAssembly;

      massage = {
        "message": {
          "text": result
        },
        "keyboard": {
          type: 'buttons',
          buttons: seoulAssemblyResult.bt
        }
      };
    }
    else{
      result = setResult(_obj.content, user[idx]);

      massage = {
        "message": {
          "text": result.str,
          "photo": {
            "url": result.img,
            "width": 640,
            "height": 480
          }
        },
        "keyboard": {
          type: 'buttons',
          buttons: result.bt
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
            buttons : calendarResult.monthbt
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
        result = setResult(_obj.content, user[idx])

        massage = {
          "message" : {
            "text" : result
          },
          "keyboard" : {
            type : 'buttons',
            buttons : calendarResult.monthbt
          }
        };
      }
      else{
        result = setResult(_obj.content, user[idx])

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
      result = setResult(_obj.content, user[idx])

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
  } else if(user[idx].mode == FDMN){

    if(_obj.content == foodMenustr){
      massage = {
        "message": {
          "text": '보고싶은 메뉴판을 누르뮤!'
        }
      };
    }

    else{
      result = setResult(_obj.content, user[idx]);

      massage = {
        "message": {
          "text": result.str,
          "photo": {
            "url": result.img1,
            "width": 480,
            "height": 640
          }
        }
      };
    }

    massage.keyboard = {
      type: 'buttons',
      buttons: foodMenubutton
    };
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
  else if (content == ntcbutton[1])
    mode = NTCLR;
  else if (content == ntcbutton[2])
    mode = NTCS;
  else if (mode == NTCS)
    mode = NTCLS;
  else if (mode == NTCLR && (content == '>' || content == '<'))
    mode = NTCLR;
  else if (mode == NTCLS && (content == '>' || content == '<'))
    mode = NTCLS;
  else if (mode == NTCLR || mode == NTCLS)
    mode = NTCR;
  else if (content == wtrstr)
    mode = WTR;
  else if (content == rntstr)
    mode = RNT;
  else if(content == salstr)
    mode = SAL;
  else if(content == calstr)
    mode = CAL;
  else if (content == calbutton[1])
    mode = CALM
  else if (content == calbutton[2])
    mode = CALS
  else if(content == phstr)
    mode = PHN;
  else if(content == foodMenustr)
    mode = FDMN;

  return mode;
}

//뒤로가기를 누르거나 크게봤을때 어느 모드인지 정하기 위해
function bigMode(mode){
  return parseInt((mode)/10)*10
}

//이번주 버튼 배열 생성  (기준은 월요일)
function makeweek(keyword){
  var thisweek = new Array();
  var dt = new Date();

  if(dt.getDay())
    dt.setDate(dt.getDate() - (dt.getDay()-1));
  else
    dt.setDate(dt.getDate() - 6);


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
function setResult(keyword, selectUser) {

  mode = selectUser.mode;
  noticePage = selectUser.noticeObj.page;
  noticeMode = selectUser.noticeObj.mode;
  noticeKeyword = selectUser.noticeObj.keyword;

  var result;

  if (bigMode(mode) == EAT) {
    result = getResultEat(keyword, mode);
  } else if (bigMode(mode) == NTC) {
    cNotice.search(keyword, noticePage, noticeMode, noticeKeyword)
      .then(temp => {
        if (temp == '[등록된 게시물이 없습니다.]\n')
          result = temp;
        else
          result = resultSetNotice(keyword, temp, mode);
      });
  } else if (bigMode(mode) == WTR) {
    result = weatherResult;
  } else if (bigMode(mode) == RNT) {
    result = getRentalResult(keyword, rentalResult);
  } else if (bigMode(mode) == SAL){
    result = seoulAssemblyResult;
  } else if (bigMode(mode) == CAL){
    result = getclaendar(keyword);
  } else if (bigMode(mode) == PHN){
    result = getphonearr(mode, keyword);
  } else if (bigMode(mode) == FDMN){
    result = getfoodMenu(keyword);
  }

  while (result == undefined)
    deasync.runLoopOnce();

  return result;
}


//일주일치 학식정보를 업데이트
async function setResultEat() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("학식 정보를 업데이트 합니다\n");

  //변수의 변화를 감지해야 하기 때문에 과거의 값을 저장해 둔다.
  var teatR = undefined;
  var teatT = undefined;
  var teatH = undefined;

  cEat.search('미래백년관 - ')
    .then(temp1 => {
      teatR = temp1;
    });

  cEat.search('밀레니엄관 - ')
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

  eat.R = teatR;
  eat.T = teatT;
  eat.H = teatH;
  console.log(eat.R.bt);
  console.log(eat.T.bt);
  console.log(eat.H.bt);
}

//요청한 학식 정보를 반환한다.
function getResultEat(keyword, mode) {
  var d = new Date();
  var day;
  var eatResult;

  if(keyword.indexOf('미래백년관') != -1)
    eatResult = eat.R.contents;
  else if(keyword.indexOf('밀레니엄관') != -1)
    eatResult = eat.T.contents;
  else if(keyword.indexOf('홍제기숙사') != -1)
    eatResult = eat.H.contents;

  if(mode == EAT){    //오늘의 메뉴인 경우
    day = d.getDay() - 1;
    if(day == -1)
      day = 6

    keyword = ("00" + (d.getMonth() + 1)).slice(-2) + '/' + ("00" + d.getDate()).slice(-2);

    idx = eatResult.findIndex(function(ele, i){
      return (ele.indexOf(this) != -1);
    }, keyword);


    if (idx == -1){
      if(day < 5)
        return '메뉴가 올라와 있지 않습니다.'
      return '오늘은 식당을 운영하지 않습니다.'
    }

  }
  else{
    keyword = keyword.split(' - ')[1].trim();

    idx = eatResult.findIndex(function(ele, i){
      return (ele.indexOf(this) != -1);
    }, keyword);
  }

  return eatResult[idx];
}


//날씨 정보를 업데이트
async function setResultWeather() {
  var dt = new Date();
  var time = dt.toFormat("YYYY-MM-DD HH24:MI:SS");

  console.log(time);
  console.log("날씨 정보를 업데이트 합니다\n");

  kmaWeather.search()
    .then(temp => {
      weatherResult = temp;
    });
}


//공지사항의 글 목록을 리턴
function resultSetNotice(keyword, noticeObj, mode) {
  if (mode == NTCLR){
    noticeObj.explan = '최근 게시글 '+noticeObj.page;
  }
  else{
    noticeObj.explan = noticeObj.keyword + '(으)로 검색한 게시글 '+noticeObj.page;
  }

  noticeObj.explan += '페이지입니다.\n버튼을 눌러 상세 내용을 확인하세요.\n뒤로가기를 누르면 뒤로 돌아갑니다.';
  noticeObj.bt.unshift(backstr);

  return noticeObj;
}

//공지사항 글 클릭시 상세 내용을 출력해주기 위해 세부 내용 리턴
function resultSetDetailNotice(keyword, noticeobj) {

  notice_idx = noticeobj.contents.map(x => x.title).indexOf(keyword)

  var content = '';
  var url = noticeobj.contents[notice_idx].pc;
  var resultstr;

  cNoticeContents.search(url)
    .then(temp => {
      content = temp
    });

  while (content == '') {
    deasync.runLoopOnce();
  }

  resultstr = '[제목]\n'+noticeobj.contents[notice_idx].title+'\n\n';
  resultstr += '[본문]\n'+ content;
  resultstr += '[PC 링크]\n' + noticeobj.contents[notice_idx].pc;
  resultstr += '\n\n[모바일 링크]\n※ 첨부파일 확인 불가\n' + noticeobj.contents[notice_idx].mobile;

  return resultstr;
}


//집회 정보 업데이트
async function setseoulAssembly(){
  console.log("집회/공사 정보 업데이트");

  var result = new Object();
  result.bt = new Array()

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

    result.bt.push(firststr);

    if(seoulAssemblyResult.check == true){    //오늘 데이터가 있었으면
      result.bt.push(day);
      result.str = seoulAssemblyResult.str;
      result.img = seoulAssemblyResult.img;
    }
    seoulAssemblyResult = result;
}


//학사정보 업데이트
async function setCalendar(){
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
  var calresultstr = '';
  var ch = 0

  if(calendarResult.monthbt.indexOf(keyword) != -1){   //달 검색일 경우
    keyword = keyword.substring(0, keyword.length-1);
    var selectMonth = keyword.split('년 ')[0] + '.' + keyword.split('년 ')[1];

    for(var i =0;i<calendarResult.contents.length;i++){
      if(calendarResult.contents[i].date.indexOf(selectMonth) != -1){
        calresultstr += calendarResult.contents[i].date+'\n'
        calresultstr += calendarResult.contents[i].content+'\n\n'
      }
    }
  }
  else{          //일정명 검색일 경우
    for(var i = 0; i<calendarResult.contents.length;i++){
      if(calendarResult.contents[i].content.indexOf(keyword) != -1){
        calresultstr += calendarResult.contents[i].date+'\n'
        calresultstr += calendarResult.contents[i].content+'\n\n'
        ch++;
      }
    }
    if(ch == 0)
      calresultstr = '검색 결과가 없습니다.'
  }

  calresultstr = calresultstr.trim();

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
        phonearr = temp;
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

function foodMenuBtMake(){
  var foodMenuJSON = fs.readFileSync('./asset/foodMenu.json', 'utf8');
  var foodMenudatas = JSON.parse(foodMenuJSON);

  return [firststr].concat(Object.keys(foodMenudatas));
}

function getfoodMenu(keyword){
  var foodMenuJSON = fs.readFileSync('./asset/foodMenu.json', 'utf8');
  var foodMenudatas = JSON.parse(foodMenuJSON);

  var menuResult = new Object();

  menuResult.str = foodMenudatas[keyword].str

  menuResult.img1 = 'http://' + ipadd +foodMenudatas[keyword].img1;
  menuResult.str += '앞 장 : '+menuResult.img1;


  if(foodMenudatas[keyword].img2 != "none"){
    menuResult.img2 = 'http://' + ipadd +foodMenudatas[keyword].img2;
    menuResult.str += '\n'+'뒷 장 : '+menuResult.img2;
  }

  return menuResult;
}
