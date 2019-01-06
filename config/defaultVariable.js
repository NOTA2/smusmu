var defaultObj = new Object();

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

module.exports = defaultObj;
