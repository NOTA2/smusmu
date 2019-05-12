function serchschoolId() {

  var schoolIds = $("#schoolIds").val();

  fetch("/asso/rent/now/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `schoolId=${schoolIds}`
  }).then(function (res) {
    res.json().then(function (data) {
      if (data.status) {

        $("#username").val(data.user.name);
        $("#schoolId").val(data.user.schoolId);
        $("#major").val(data.user.major);
        $("#phone").val(data.user.phone);
      } else {
        alert('검색결과가 없습니다. 학번을 확인해주세요.')
      }
    })
  }, function (e) {
    alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
  });

}


function complete() {
  var rentitem = $("#rentitem").val();
  var username = $("#username").val();
  var schoolId = $("#schoolId").val();
  var major = $("#major").val();
  var phone = $("#phone").val();

  if(!rentitem){
    alert('물건을 선택해 주세요');
    return false;
  }if (!username) {
    alert('이름을 입력하세요');
    return false;
  } else if (!schoolId) {
    alert('학번 입력하세요');
    return false;
  } else if (schoolId.length != 9) {
    alert('학번을 제대로 입력해주세요.')
    return false;
  } else if (!major) {
    alert('학과를 입력해주세요');
    return false;
  } else if (!phone) {
    alert('전화번호를 입력해주세요');
    return false;
  } else if (phone.length != 13) {
    alert('"-"를 넣어서 정확하게 전화번호를 입력해주세요');
    return false;
  } else {
    alert("대여 완료되었습니다.");
    $("#frm").submit();
  }
}

function rentreturn(sid, rid) {
  var c = confirm(`반납 확인 되었나요?`);

  if (c) {

    fetch("/asso/rent/now/return", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `sid=${sid}&rid=${rid}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          alert('반납 완료되었습니다.');
          window.location.reload();
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}