var idck = 0;

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
function passwordE(){
    var password = $("#password").val();
    var passwordCheck = $("#passwordCheck").val();

    if(password == passwordCheck){
        $("#passcheck").text('비밀번호가 일치합니다.')
        $("#passcheck").css("color", "#28a745")
    } else{
        $("#passcheck").text('비밀번호가 일치하지 않습니다.')
        $("#passcheck").css("color", "#dc3545")
    }
}
function register() {
    var username = $("#username").val();
    var password = $("#password").val();
    var name = $("#name").val();
    var schoolId = $("#schoolId").val();
    var passwordCheck = $("#passwordCheck").val();
    var nickname = $("#nickname").val();

    if (!$('#agree11').is(":checked")) {
        alert('회원가입약관의 내용에 동의해주세요.');
    } else if (!$('#agree22').is(":checked")) {
        alert('개인정보처리방침안내 내용에 동의해주세요.');
    } else if (!username) {
        alert('아이디를 입력하세요');
    } else if (!chkId($.trim(username))) {
        $('#username').val('');
        $('#username').focus();
        return false;
    } else if (!password) {
        alert('비밀번호를 입력하세요');
    } else if (password != passwordCheck) {
        alert('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.')
    } else if (!chkPwd($.trim(password))) {
        $('#password').val('');
        $('#password').focus();
        $('#passwordCheck').val('');
        return false;
    } else if (!name) {
        alert('이름을 입력하세요');
    } else if (!schoolId) {
        alert('학번 입력하세요');
    } else if (schoolId.length != 9) {
        alert('학번을 제대로 입력해주세요.')
    } else if (!nickname) {
        alert('닉네임을 입력하세요');
    } else if (idck == 0) {
        alert('아이디 중복체크를 해주세요');
        return false;
    } else {
        alert("회원가입을 축하합니다. 학교메일을 통해서 인증받으세요.");
        $("#frm").submit();
    }
}


function idCheck() {
    var username = $("#username").val();
    if (!chkId($.trim(username))) {
        $('#username').val('');
        $('#username').focus();
        return false;
    }
    fetch("https://smusmu.co.kr/auth/register/username", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `username=${username}`
    }).then(function (res) {
        res.json().then(function (data) {

            if (data.status == true) {
                alert("아이디가 존재합니다. 다른 아이디를 입력해주세요.");
                $("#username").css("background-color", "#dc3545")
                $("#username").css("color", "white")
                $("#username").focus();
            } else {
                alert("사용가능한 아이디입니다.");
                $("#username").css("background-color", "#28a745")
                $("#username").css("color", "black")
                $("#password").focus();
                //아이디가 중복하지 않으면  idck = 1 
                idck = 1;

            }
        })
    }, function (e) {
        console.log(e);
        
        alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
}

function chkPwd(str) {

    var pw = str;
    var num = pw.search(/[0-9]/g);
    var eng = pw.search(/[a-z]/ig);
    var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if (pw.length < 8 || pw.length > 20) {
        alert("비밀번호는 8자리 ~ 20자리 이내로 입력해주세요.");
        return false;
    }

    if (pw.search(/₩s/) != -1) {
        alert("비밀번호는 공백없이 입력해주세요.");
        return false;
    }
    if (num < 0 || eng < 0 || spe < 0) {
        alert("비밀번호에 영문,숫자, 특수문자를 혼합하여 입력해주세요.");
        return false;
    }

    return true;
}

function chkId(str) {

    var id = str;
    var idReg = /^[A-za-z0-9]{3,20}/g;

    if (id.length < 3 || id.length > 20) {
        alert("아이디는 3자리 ~ 20자리 이내로 입력해주세요.");
        return false;
    }

    if (!idReg.test(str)) {
        alert("아이디는 영문자로 시작하는 3~20자 영문자 또는 숫자이어야 합니다");
        return false;
    }
    if (id.search(/₩s/) != -1) {
        alert("아이디는 공백없이 입력해주세요.");
        return false;
    }

    return true;

}