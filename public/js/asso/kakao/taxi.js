$('#frm').submit(function () {
  var pass = true;

  if (pass == false) {
    return false;
  }
  $("#spinner").show();

  return true;
});

function formplus() {
  var rowlength = $(".plusrow").length;
  var str = `
    <tr class="plusrow">
    <td class="title"><input class="form-control" type="text" name="taxi[${rowlength}][0]" autocomplete="off" /></td>
    <td class="description"><input class="form-control" type="text" name="taxi[${rowlength}][1]" autocomplete="off" /></td>
    <td class="auth"><input class="form-control" type="text" name="taxi[${rowlength}][2]" autocomplete="off" /></td>
    <td class="thumbnail">
        <input class="form-control" type="number" autocomplete="off" disabled="disabled" />
    </td>
    <td class="minus"><div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div></td>
</tr>
  `

  $(str).appendTo('tbody').show('slow')
}


function complete() {
  var title = $('.title input');

  $(title).each(function (idx, el) {
    var description = $(el).parents('.plusrow').children('.description').children('input').val();
    var thumbnail = $(el).parents('.plusrow').children('.auth').children('input').val();

    if (!$(el).val() || !description || !thumbnail) {
      alert('입력해주세요!');
      return false;
    }
    if (idx + 1 == title.length) {
      $("#frm").submit();
    }

  })
}



function deleteitem(self) {
  let row = $(self).parents('.plusrow');
  let id = $(row).find("input#id").val();

  //title
  let c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/kakao/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=taxi&val=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(row).remove();
          alert('해당 정보가 삭제되었습니다.')
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}