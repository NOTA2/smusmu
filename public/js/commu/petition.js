var pastcomment;

$("textarea#tw_contents").on('keydown keyup', function () {
  // $(this).height(46).height( +1 );	 
  // $('#submit').height(46).height( $(this).prop('scrollHeight')+1 );	

  $('.submit').css('height', $(this).prop('scrollHeight'));
  // $(this).height( this.scrollHeight -1 );
});



autosize($('textarea'));


function like(pid, uid, tid, targetType, self) {

  if (uid == tid) {
    alert("자신의 글에는 추천할 수 없습니다.");
  } else {
    var c =true;

    if(targetType==1)
      c = confirm("해당 청원을 추천 하시겠습니까?");

    if (c) {
      fetch("/commu/petition/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `pid=${pid}&uid=${uid}&tid=${tid}&targetType=${targetType}`
      }).then(function (res) {
        res.json().then(function (data) {

          if (data.status) {
            alert("이미 추천하였습니다.");
          } else {
            alert("추천이 완료되었습니다.");
            if (targetType == 1)
              $('.lik span').html(parseInt($('.lik span').html(), 10) + 1)
            else {
              console.log($(self).find('span').html());
              $(self).find('span').html(' ' + (parseInt($(self).find('span').html(), 10) + 1))
            }
          }
        })
      }, function (e) {
        console.log(e);

        alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
      });
    }

  }
}

function answerok(pid) {
  var content = $("#answercontent");

  if (content.length == 0) {
    alert("답변이 작성되지 않았습니다. 답변을 작성하고 진행해주세요.");
    return false;
  }

  var c = confirm("답변 완료 게시판으로 옮기시겠습니까?");

  if (c) {
    fetch("/commu/petition/answerok", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `pid=${pid}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          alert("답변 완료 하였습니다.");
          location.reload();
        }
      })
    }, function (e) {
      console.log(e);
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}

function deletetopic(pid) {
  var c = confirm("게시글을 삭제하시겠습니까?");
  var pc = 1;
  if (c) {
    fetch("/commu/petition/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `pc=${pc}&pid=${pid}`
    }).then(function (res) {
      res.json().then(function (data) {

        if (data.status) {
          alert("게시글을 삭제 하였습니다.");
          window.location.replace("/commu/petition");
        }
      })
    }, function (e) {
      console.log(e);
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}


function comment() {
  var tw_contents = $("#tw_contents").val();


  if (!tw_contents) {
    alert('내용을 입력하세요');
  } else if(len_chk()){

  }else {
    $("#frm").submit();
  }

}

function recomment(self, pid, uid, ruid, rcid) {

  if (self == pastcomment) {
    $('#maincomment').css('display', 'block');
    $('#subcomment').remove();
    pastcomment = undefined;
  } else {
    pastcomment = self;
    $('#maincomment').css('display', 'none');
    $('#subcomment').remove();

    var str = `
    <div id="subcomment" class="Reply_area_write">
    <div class="Reply_area_write_pg">
      <form id="frm" name="frm" action="/commu/petition/comment" method="post">
        <input type="hidden" name="pid" value="${pid}" />
        <input type="hidden" name="uid" value="${uid}" />
        <input type="hidden" name="ruid" value="${ruid}" />
        <input type="hidden" name="rcid" value="${rcid}" />
        <textarea class="petitionsReply_write form-control" id="tw_contents" name="body" required="" placeholder="최대 100자까지 적을 수 있습니다."></textarea>
        <input class="submit btn btn-warning form-control" type="button" value="등록" onclick="comment()" />
      </form>
    </div>
  </div>
  `

    $(self).parents('.comment').append(str);
  }

}


function deletecomment(pid) {
  var c = confirm("댓글을 삭제하시겠습니까?");
  var pc = 2;
  if (c) {
    fetch("/commu/petition/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `pc=${pc}&pid=${pid}`
    }).then(function (res) {
      res.json().then(function (data) {

        if (data.status) {
          alert("댓글을 삭제 하였습니다.");
          window.location.reload();
        }
      })
    }, function (e) {
      console.log(e);
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}


function len_chk() {
  var frm = document.frm.body;

  if (frm.value.length > 200) {
    alert("글자수는 100자로 제한됩니다.!");
    frm.value = frm.value.substring(0, 200);
    frm.focus();
    return true;
  }else{
    return false;
  }

}