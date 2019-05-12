var idck = 0;

function idchange() {
  idck = 0;
}

$('#frm').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});

// function gradeChange() {
//   var gradeBox = document.getElementById("grade");
//   var selectCollege = document.getElementById("selectcollege");
//   var selectAsso = document.getElementById("selectasso");
//   var phone = document.getElementById("phone");
//   var grade = gradeBox.options[gradeBox.selectedIndex].value;

//   if (grade == '99') {
//     selectCollege.innerHTML = '';
//     selectAsso.innerHTML = '';
//     phone.innerHTML = ``;

//     selectCollege.classList.add('hiddens');
//     selectAsso.classList.add('hiddens');
//     phone.classList.add('hiddens');
//   } else {
//     selectCollege.classList.remove('hiddens');
//     selectAsso.classList.remove('hiddens');
//     phone.classList.remove('hiddens');


//     fetch("/auth/register/assolist", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded"
//       }
//     }).then(function (res) {
//       res.json().then(function (data) {

//         if (grade == '1') {
//           var str = `
//           <div class="input-group-prepend"><span class="input-group-text" style="color:red;">*</span>
//               <label class="input-group-text" for="college">학생회 소속</label>
//           </div>
//           <select class="custom-select" id="college" name="college">
//             <option value="총학생회">총학생회</option>
//             <option value="인문사회과학대학">인문사회과학대학</option>
//             <option value="사범대학">사범대학</option>
//             <option value="경영경제대학">경영경제대학</option>
//             <option value="융합공과대학">융합공과대학</option>
//             <option value="문화예술대학">문화예술대학</option>
//           </select>
//             `

//           selectCollege.innerHTML = str;
//           selectasso.innerHTML = `
//                     <div class="input-group-prepend"><span class="input-group-text" style="color:red;">*</span><span class="input-group-text">학생회 이름</span></div>
//             <input class="form-control" id="name" type="text" name="name" placeholder="학생회 이름" autocomplete="off" />
//                     `
//           phone.innerHTML = `
//           <div class="input-group mb-3">
//             <div class="input-group-prepend"><span class="input-group-text">학생회 대표번호</span></div>
//             <input class="form-control" type="tel" name="phone1" placeholder="010" autocomplete="off" value="010" maxlength="3" />
//             <input class="form-control" type="tel" name="phone2" autocomplete="off" maxlength="4" />
//             <input class="form-control" type="tel" name="phone3" autocomplete="off" maxlength="4" />
//           </div>
//           `
//           for (var i = 0; i < data.college.length; i++)
//             document.querySelector(`#college option[value=${data.college[i]}]`).disabled = true;

//           option = document.querySelectorAll('#college option')
//           for (var i = 0; i < option.length; i++) {
//             if (option[i].disabled == false) {
//               option[i].selected = 'selected';
//               break;
//             }
//           }


//         } else if (grade == '3') {
//           if (data.status == false) {
//             alert("현재 등록된 학생회가 없습니다.");
//             selectCollege.innerHTML = ''
//             selectAsso.innerHTML = ''
//             phone.innerHTML = '';

//             selectCollege.classList.add('hiddens');
//             selectAsso.classList.add('hiddens');
//             phone.classList.add('hiddens');
//             $("#grade").val("99").prop("selected", true);
//           } else {
//             var str = `
//               <div class="input-group-prepend"><span class="input-group-text" style="color:red;">*</span>
//                   <label class="input-group-text" for="college">학생회 소속</label>
//               </div>
//               <select class="custom-select" id="college" name="college">`

//             for (var i = 0; i < data.college.length; i++) {
//               if (data.college[i] == '총학생회')
//                 str += `<option value="${data.college[i]}">${data.college[i]}</option>`
//               else
//                 str += `<option value="${data.college[i]}">${data.college[i]}대학</option>`
//             }
//             str += `</select>`;
//             selectasso.innerHTML = '';
//             phone.innerHTML = '';
//             selectAsso.classList.add('hiddens');
//             phone.classList.add('hiddens');
//             selectCollege.innerHTML = str

//           }
//         }
//       })
//     }, function (e) {
//       alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
//     });

//   }
// }

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

function register() {
  var username = $("#username").val();
  var password = $("#password").val();
  var name = $("#name").val();
  var passwordCheck = $("#passwordCheck").val();
  
  var email = $("#assoemail").val();
  var emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;//이메일 정규식

  var collegeBox = document.getElementById("college");
  var college = collegeBox.options[collegeBox.selectedIndex].value;

  if (!username) {
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
  } else if (!email) {
    alert('이메일을 입력하세요');
  } else if (!emailRule.test(email)) {
    alert('이메일을 제대로 입력해주세요.')
  } else if (college == 'none') {
    alert('대표하는 단과대를 선택해 주세요.')
  } else if (!name) {
    alert('이름을 입력하세요');
  } else if (idck == 0) {
    alert('아이디 중복체크를 해주세요');
    return false;
  } else {
    $("#frm").submit();
  }
}


function idCheck() {
  idck = 0;
  var username = $("#username").val();
  if (!chkId($.trim(username))) {
    $('#username').val('');
    $('#username').focus();
    return false;
  }
  fetch("/auth/register/username", {
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
        idck = 0;
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