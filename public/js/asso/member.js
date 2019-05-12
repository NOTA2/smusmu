function pass(id){
  var c = confirm(`허가 하시겠습니까?`);

  if (c) {
    fetch("/asso/home/member/passdel", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `pass=y&id=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {

          alert('허가 완료되었습니다.');
          window.location.reload();
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}

function del(id){
  var c = confirm(`삭제 하시겠습니까?`);

  if (c) {
    fetch("/asso/home/member/passdel", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `del=y&id=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {

          alert('삭제 완료되었습니다.');
          window.location.reload();
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}