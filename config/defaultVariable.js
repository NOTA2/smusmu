var defaultObj = new Object();

defaultObj.Qu = [{
  "label": "🏠",
  "action": "block",
  "messageText": "🏠",
  "blockId": "5c25e2e6384c5518d11fce8b"
}]

defaultObj.homeQuickReplies = [{
  "label": "사용법 📖",
  "action": "block",
  "messageText": "사용법",
  "blockId": "5c272d6d384c5518d11fd082"
}, {
  "label": "등록 📝",
  "action": "block",
  "messageText": "등록하기",
  "blockId": "5c2efe76384c5518d11fe678"
}]

defaultObj.eatQuickReplies = [{
  "label": '학식 🍽️',
  "action": "block",
  "messageText": '학식 정보',
  "blockId": "5c271af35f38dd44d86a0dca"
}, {
  "label": '안다미로 🦌',
  "action": "block",
  "messageText": '안다미로',
  "blockId": "5d51522392690d000134f58e"
}, {
  "label": '음식점 🍜',
  "action": "block",
  "messageText": '근처 식당 정보',
  "blockId": "5c275ccf05aaa77182aa5990"
}]

defaultObj.goQuickReplies= [{
  "label" : "집회 📢",
  "action" : "block",
  "messageText" : "집회 정보",
  "blockId" : "5c2791ef05aaa77182aa5a90"
},{
  "label" : "택시 🚕",
  "action" : "block",
  "messageText" : "택시",
  "blockId" : "5d5e008fffa7480001c1a722"
},{
  "label" : "날씨 ⛅",
  "action" : "block",
  "messageText" : "학교 날씨",
  "blockId" : "5c2791c205aaa77182aa5a85"
}]


defaultObj.schoolQuickReplies = [{
  "label": '학사일정 🗓️',
  "action": "block",
  "messageText": '학사일정',
  "blockId": "5c273fd505aaa77182aa595b"
}, {
  "label": '교수 🔎',
  "action": "block",
  "messageText": '교수 검색',
  "blockId": "5d3035feffa748000122d3dc"
}, {
  "label" : "학교정보 🗺️",
  "action" : "block",
  "messageText" : "학교 정보",
  "blockId" : "5c2764db384c5518d11fd17d"
}]

defaultObj.noticeQuickReplies =[{
  "label": '주요공지 📑',
  "action": "message",
  "messageText": '주요 공지사항'
}, {
  "label": '최근공지 📋',
  "action": "message",
  "messageText": '최근 공지사항'
}, {
  "label": '공지 🔎',
  "action": "message",
  "messageText": '공지사항 검색'
}]


defaultObj.faqQuickReplies = [{
  "label": 'FAQ 🙋️',
  "action": "block",
  "messageText": '자주 묻는 질문 🙋️',
  "blockId": "5d6805fcb617ea0001c168ff"
}, {
  "label": '아는게 뭐야? 🤔',
  "action": "block",
  "messageText": '아는게 뭐야? 🤔',
  "blockId": "5d680610b617ea0001c16902"
}]

module.exports = defaultObj;