var defaultObj = new Object();

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
defaultObj.eatbutton = [defaultObj.firststr, "미래백년관(오늘)", "미래백년관(일주일)", "밀레니엄관(오늘)", "밀레니엄관(일주일)", "홍제기숙사(오늘)", "홍제기숙사(일주일)"]
defaultObj.ntcbutton = [defaultObj.firststr, "최근 글 보기", "글 검색하기"];
defaultObj.calbutton = [defaultObj.firststr, "월 별 검색", "일정 검색"];


defaultObj.Qu = [{
    "label" : "처음으로",
    "action" : "block",
    "messageText" : "처음으로",
    "blockId" : "5c25e2e6384c5518d11fce8b"
  },{
    "label" : "도움말",
    "action" : "block",
    "messageText" : "도움말",
    "blockId" : "5c272d6d384c5518d11fd082"
  }]



defaultObj.eatResult = new Object();
defaultObj.eatResult.R;  //미백관 식단
defaultObj.eatResult.T; //밀관 식단
defaultObj.eatResult.H; //행복기숙사 식단
defaultObj.weatherResult = '날씨정보가 없스뮤.'; //날씨 정보
defaultObj.seoulAssemblyResult = new Object(); //집회정보 저장
defaultObj.calendarResult = new Object(); //학사정보 저장


module.exports = defaultObj;
