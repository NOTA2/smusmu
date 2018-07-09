const fs = require('fs');
var defaultObj = new Object();

defaultObj.MAIN = 10;
defaultObj.EX = 1;
defaultObj.EAT = 20;
defaultObj.EATW = 21;
defaultObj.NTC = 30;
defaultObj.NTCLR= 31;
defaultObj.NTCS= 32;
defaultObj.NTCLS= 33;
defaultObj.NTCR= 34;
defaultObj.WTR = 40;
defaultObj.SAL = 50;
defaultObj.CAL = 60;
defaultObj.CALM = 61;
defaultObj.CALS = 62;
defaultObj.FDMN = 70;

defaultObj.firststr = '처음으로';
defaultObj.explanationbt = '사용법 확인!'
defaultObj.eatstr = '학식정보'
defaultObj.foodMenustr = '학교 근처 식당 메뉴판'
defaultObj.ntcstr = '학교 공지사항'
defaultObj.wtrstr = '학교 날씨'
defaultObj.salstr = '서울시 공사/집회정보'
defaultObj.calstr = '학사일정 검색'
defaultObj.backstr = '뒤로가기'

defaultObj.mainbutton = [defaultObj.explanationbt, defaultObj.eatstr, defaultObj.foodMenustr, defaultObj.ntcstr, defaultObj.wtrstr, defaultObj.salstr, defaultObj.calstr];
defaultObj.ntcbutton = [defaultObj.firststr, "최근 글 보기", "글 검색하기"];
defaultObj.calbutton = [defaultObj.firststr, "월 별 검색", "일정 검색"];

//설명글 텍스트 파일 로드
defaultObj.explanation = fs.readFileSync('./asset/explanation/explanation.txt', 'utf8');
defaultObj.explanation_eat = fs.readFileSync('./asset/explanation/explanation_eat.txt', 'utf8');
defaultObj.explanation_cal = fs.readFileSync('./asset/explanation/explanation_cal.txt', 'utf8');
defaultObj.explanation_seoulAssembly = fs.readFileSync('./asset/explanation/explanation_seoulAssembly.txt', 'utf8');
defaultObj.explanation_notice = fs.readFileSync('./asset/explanation/explanation_notice.txt', 'utf8');

defaultObj.eatResult = new Object();
defaultObj.eatResult.R;  //미백관 식단
defaultObj.eatResult.T; //밀관 식단
defaultObj.eatResult.H; //행복기숙사 식단
defaultObj.weatherResult = '날씨정보가 없습니다.'; //날씨 정보
defaultObj.seoulAssemblyResult = new Object(); //집회정보 저장
defaultObj.calendarResult = new Object(); //학사정보 저장


module.exports = defaultObj;
