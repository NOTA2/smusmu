var users = new Array();
var count = 0;
var router = require('express').Router();

router.post('*', function (req, res) {
	var message = {
		"version": "2.0",
		"template": {
			"outputs": [{
				"simpleText": {
					"text": '틀렸습니다.\n아래의 퀴즈 버튼을 눌러서 다시 시도해주세요.'
				}
			}]
		}
	};



	var username = req.body.userRequest.user.id;
	var answer = req.body.action.params.answer;
	if(answer == undefined)
		answer = req.body.action.params.quiz;
	
	var idx = users.map(x => x.username).indexOf(username);

	if (idx == -1) {
		var user = {
			'username': username,
			'grade': [false,false, false, false, false]
		};
		var a = users.push(user);
		idx = a - 1;
	}
	var g = users[idx].grade;
	var quiz;

	for(var i = 0; i<g.length;i++){
		if(!users[idx].grade[i]){
			quiz = i;
			break;
		}
	}

	if (quiz == 0) {
		message.template.outputs[0].simpleText.text = '스뮤스뮤 퀴즈모드 입니다.\n문제는 총 4문제입니다.\n아래의 버튼을 눌러서 첫번째 퀴즈부터 맞혀보세요!'
		message.template.quickReplies = [{
			"label": '퀴즈',
			"action": "block",
			"messageText": '퀴즈',
			"blockId": "5c6a81d25f38dd01ebc07bea"
		}];
		users[idx].grade[0] = true;
	}else if(quiz == 1){
		if(answer == '퀴즈'){
			message.template.outputs[0].simpleText.text = '아래의 버튼을 눌러 문제를 확인하세요.'
		}
		if (answer == '학술정보관') {		//정답일 경우
			message.template.outputs[0].simpleText.text = '정답입니다.\n아래의 [퀴즈]버튼을 눌러 2번 문제를 진행해주세요.'
			users[idx].grade[1] = true;
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a6b84384c5541a0ee5a2f"
			}];

		} else { //틀렸을 때
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a81d25f38dd01ebc07bea"
			}]
		}
	}else if(quiz == 2){
		if(answer == '퀴즈'){
			message.template.outputs[0].simpleText.text = '아래의 버튼을 눌러 문제를 확인하세요.'
		}
		if (answer == '김정현') {		//정답일 경우
			message.template.outputs[0].simpleText.text = '정답입니다.\n아래의 [퀴즈]버튼을 눌러 3번 문제를 진행해주세요.'
			users[idx].grade[2] = true;
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a6cc3384c5541a0ee5a35"
			}];

		} else { //틀렸을 때
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a6b84384c5541a0ee5a2f"
			}]
		}
	}else if(quiz == 3){
		if(answer == '퀴즈'){
			message.template.outputs[0].simpleText.text = '아래의 버튼을 눌러 문제를 확인하세요.'
		}
		if (answer == '스뮤스뮤') {		//정답일 경우
			message.template.outputs[0].simpleText.text = '정답입니다.아래의 [퀴즈]버튼을 눌러 4번 문제를 진행해주세요.'
			users[idx].grade[3] = true;
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a749d5f38dd01ebc07b80"
			}];

		} else { //틀렸을 때
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a6cc3384c5541a0ee5a35"
			}]
		}
	}else if(quiz == 4){
		if(answer == '퀴즈'){
			message.template.outputs[0].simpleText.text = '아래의 버튼을 눌러 문제를 확인하세요.'
		}
		if (answer == '학생청원제도') {		//정답일 경우
			count++;
			message.template.outputs[0].simpleText.text = '정답입니다.\n모든 퀴즈를 다 맞혔습니다. 축하합니다.\n당신의 번호는 ' + count + '번 입니다.'
			users[idx].grade[4] = true;
			message.template.quickReplies = [{
				"label" : "스뮤스뮤 사용하기",
				"action" : "block",
				"messageText" : "스뮤스뮤 사용하기",
				"blockId" : "5c25e2e6384c5518d11fce8b"
			},{
				"label" : "도움말",
				"action" : "block",
				"messageText" : "도움말",
				"blockId" : "5c272d6d384c5518d11fd082"
			}]
		} else { //틀렸을 때
			message.template.quickReplies = [{
				"label": '퀴즈',
				"action": "block",
				"messageText": '퀴즈',
				"blockId": "5c6a749d5f38dd01ebc07b80"
			}]
		}
	}else{
		message.template.outputs[0].simpleText.text = '모든 퀴즈를 다 맞혔습니다. 참여할 수 없습니다.'
		message.template.quickReplies = [{
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
	}
	
	return res.json(message);

})


module.exports = router;