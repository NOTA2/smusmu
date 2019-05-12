$('#frm').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});

function passwordE() {
  var password = $("#password").val();
  var passwordCheck = $("#passwordCheck").val();
  

  if (!chkPwd2($.trim(password))) {
      $("#passcheck").text('비밀번호 조건에 맞지 않습니다.')
      $("#passcheck").css("color", "#dc3545")
  } else if (password == passwordCheck) {
      $("#passcheck").text('비밀번호가 일치합니다.')
      $("#passcheck").css("color", "#28a745")
  } else if (password != passwordCheck) {
      $("#passcheck").text('비밀번호가 일치하지 않습니다.')
      $("#passcheck").css("color", "#dc3545")
  }
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

function chkPwd2(str) {

    var pw = str;
    var num = pw.search(/[0-9]/g);
    var eng = pw.search(/[a-z]/ig);
    var spe = pw.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if (pw.length < 8 || pw.length > 20)
        return false;
    if (pw.search(/₩s/) != -1)
        return false;
    if (num < 0 || eng < 0 || spe < 0)
        return false;

    return true;
}

function changepassword() {
  var password = $("#password").val();
  var passwordCheck = $("#passwordCheck").val();


  if (!password) {
      alert('비밀번호를 입력하세요');
  } else if (password != passwordCheck) {
      alert('비밀번호가 일치하지 않습니다. 다시 입력해 주세요.')
  } else if (!chkPwd($.trim(password))) {
      $('#password').val('');
      $('#password').focus();
      $('#passwordCheck').val('');
      return false;
  } else {
      $("#frm").submit();
  }
}