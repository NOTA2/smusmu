var scck = 0;

function schoolchange() {
  scck = 0;
}
$('#frm').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});
function schoolIdAjax() {
  scck = 0;
  var schoolId = $("#schoolId").val();
  if (!chkschooId($.trim(schoolId))) {
    $('#schoolId').val('');
    $('#schoolId').focus();
    return false;
  }
  fetch("/auth/register/schoolId", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `schoolId=${schoolId}`
  }).then(function (res) {
    res.json().then(function (data) {

      if (data.status == true) {
        alert("학번이 이미 존재합니다.");
        $("#schoolId").css("background-color", "#dc3545")
        $("#schoolId").css("color", "white")
        $("#schoolId").focus();
        scck = 0;
      } else {
        alert("사용가능한 학번입니다.");
        $("#schoolId").css("background-color", "#28a745")
        $("#schoolId").css("color", "black")
        //아이디가 중복하지 않으면  idck = 1 
        scck = 1;
      }
    })
  }, function (e) {
    alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
  });
}


function chkschooId(str) {
  var idReg = /^[0-9]{9,9}$/g;

  if (str.length == 0) {
    alert('학번 입력하세요');
    return false;
  } else if (!idReg.test(str)) {
    alert('학번을 제대로 입력해주세요.');
    return false;
  }

  return true;
}


function updateschoolId() {
  var password = $("#password").val();
  var schoolId = $("#schoolId").val();

  if (!password) {
    alert('비밀번호를 입력하세요');
  } else if (!schoolId) {
    alert('학번 입력하세요');
  } else if (schoolId.length != 9) {
    alert('학번을 제대로 입력해주세요.')
  } else if (scck == 0) {
    alert('학번 중복체크를 해주세요');
    return false;
  } else {
    $("#frm").submit();
  }
}