var nick = 0;
var orinick;
function nickchange(){
    nick=0;
}

$(document).ready(function () {
    var selectedValue = $("#college option:selected").val();
    var department = document.getElementById("department");

    if (selectedValue == '인문사회과학') {
        department.innerHTML = `
    <option value="역사콘텐츠학과">역사콘텐츠학과</option>
    <option value="지적재산권학과">지적재산권학과</option>
    <option value="문헌정보학과">문헌정보학과</option>
    <option value="한일문화콘텐츠학과">한일문화콘텐츠학과</option>
    <option value="공간환경학부">공간환경학부</option>
    <option value="	공공인재학부">공공인재학부</option>
    <option value="가족복지학과">가족복지학과</option>
    <option value="국가안보학과">국가안보학과</option>
    `
    } else if (selectedValue == '사범') {
        department.innerHTML = `
    <option value="국어교육과">국어교육과</option>
    <option value="영어교육과">영어교육과</option>
    <option value="교육학과">교육학과</option>
    <option value="수학교육과">수학교육과</option>
    <option value="불어교육과">불어교육과</option>
    <option value="	일어교육과">일어교육과</option>
    `
    } else if (selectedValue == '경영경제') {
        department.innerHTML = `
    <option value="경제금융학부">경제금융학부</option>
    <option value="경영학부">경영학부</option>
    <option value="글로벌경영학과">글로벌경영학과</option>
    <option value="융합경영학과">융합경영학과</option>
    `
    } else if (selectedValue == '융합공과') {
        department.innerHTML = `
    <option value="휴먼지능정보공학과">휴먼지능정보공학과</option>
    <option value="전기공학과">전기공학과</option>
    <option value="융합전자공학과">융합전자공학과</option>
    <option value="컴퓨터과학과">컴퓨터과학과</option>
    <option value="생명공학과">생명공학과</option>
    <option value="화학에너지공학과">화학에너지공학과</option>
    <option value="화공신소재학과">화공신소재학과</option>
    <option value="미디어소프트웨어학과">미디어소프트웨어학과</option>
    <option value="게임학과">게임학과</option>
    <option value="화학과">화학과</option>
    <option value="소비자주거학과">소비자주거학과</option>
    `
    } else if (selectedValue == '문화예술') {
        department.innerHTML = `
    <option value="식품영양학과">식품영양학과</option>
    <option value="의류학과">의류학과</option>
    <option value="스포츠건강관리학과">스포츠건강관리학과</option>
    <option value="무용예술학과">무용예술학과</option>
    <option value="조형예술학과">조형예술학과</option>
    <option value="	생활예술학과">생활예술학과</option>
    <option value="음악학부">음악학부</option>
    `
    }
    document.querySelector(`#department option[value=${depart}]`).selected = 'selected';

    orinick = $("#nickname").val();
});

function collegeChange() {
    var selectBox = document.getElementById("college");
    var department = document.getElementById("department");
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    if (selectedValue == '인문사회과학') {
        department.innerHTML = `
        <option value="역사콘텐츠학과">역사콘텐츠학과</option>
        <option value="지적재산권학과">지적재산권학과</option>
        <option value="문헌정보학과">문헌정보학과</option>
        <option value="한일문화콘텐츠학과">한일문화콘텐츠학과</option>
        <option value="공간환경학부">공간환경학부</option>
        <option value="	공공인재학부">공공인재학부</option>
        <option value="가족복지학과">가족복지학과</option>
        <option value="국가안보학과">국가안보학과</option>
        `
    } else if (selectedValue == '사범') {
        department.innerHTML = `
        <option value="국어교육과">국어교육과</option>
        <option value="영어교육과">영어교육과</option>
        <option value="교육학과">교육학과</option>
        <option value="수학교육과">수학교육과</option>
        <option value="불어교육과">불어교육과</option>
        <option value="	일어교육과">일어교육과</option>
        `
    } else if (selectedValue == '경영경제') {
        department.innerHTML = `
        <option value="경제금융학부">경제금융학부</option>
        <option value="경영학부">경영학부</option>
        <option value="글로벌경영학과">글로벌경영학과</option>
        <option value="융합경영학과">융합경영학과</option>
        `
    } else if (selectedValue == '융합공과') {
        department.innerHTML = `
        <option value="휴먼지능정보공학과">휴먼지능정보공학과</option>
        <option value="전기공학과">전기공학과</option>
        <option value="융합전자공학과">융합전자공학과</option>
        <option value="컴퓨터과학과">컴퓨터과학과</option>
        <option value="생명공학과">생명공학과</option>
        <option value="화학에너지공학과">화학에너지공학과</option>
        <option value="화공신소재학과">화공신소재학과</option>
        <option value="미디어소프트웨어학과">미디어소프트웨어학과</option>
        <option value="게임학과">게임학과</option>
        <option value="화학과">화학과</option>
        <option value="소비자주거학과">소비자주거학과</option>
        `
    } else if (selectedValue == '문화예술') {
        department.innerHTML = `
        <option value="식품영양학과">식품영양학과</option>
        <option value="의류학과">의류학과</option>
        <option value="스포츠건강관리학과">스포츠건강관리학과</option>
        <option value="무용예술학과">무용예술학과</option>
        <option value="조형예술학과">조형예술학과</option>
        <option value="	생활예술학과">생활예술학과</option>
        <option value="음악학부">음악학부</option>
        `
    }

}

function update() {
    var name = $("#name").val();
    var nickname = $("#nickname").val();

    if (!name) {
        alert('이름을 입력하세요');
    } else if (!nickname) {
        alert('닉네임을 입력하세요');
    } else if (nickname!=orinick && nick == 0) {
        alert('닉네임 중복체크를 해주세요');
        return false;
    } else {
        alert("정보를 수정하였습니다.");
        $("#frm").submit();
    }
}


function chNick(){
    var nickname = $("#nickname").val();
    var username = $("#username").val();

    nick = 0;
    
    if (!chkNick($.trim(nickname))) {
        $('#nickname').val('');
        $('#nickname').focus();
        return false;
    }
    fetch("/auth/register/nickname", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `nickname=${nickname}&username=${username}`
    }).then(function (res) {
        res.json().then(function (data) {

            if (data.status == true) {
                alert("닉네임이 이미 존재합니다.");
                $("#nickname").css("background-color", "#dc3545")
                $("#nickname").css("color", "white")
                $("#nickname").focus();
                nick = 0;
            } else {
                alert("사용가능한 닉네임입니다.");
                $("#nickname").css("background-color", "#28a745")
                $("#nickname").css("color", "black")
                //아이디가 중복하지 않으면  idck = 1 
                nick = 1;
            }
        })
    }, function (e) {
        console.log(e);
        
        alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
}


function chkNick(str){
    var idReg = /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]+$/g;
    var check = idReg.test(str);
    
    if (str.length == 0) {
        alert('닉네임을 입력하세요');
        return false;
    } else if (str.length<2 || str.length>10) {
        alert('닉네임은 2자리 ~ 10자리 이내.');
        return false;
    }else if (!check) {
        alert('닉네임은 한글 및 영문자, 숫자만 입력 가능.');
        return false;
    }

    return true;
}