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
  <td class="month"><input class="form-control" type="text" name="calendar[${rowlength}][0]" autocomplete="off" /></td>
  <td class="date"><input class="form-control" type="text" name="calendar[${rowlength}][1]" autocomplete="off" /></td>
  <td class="content"><input class="form-control" type="text" name="calendar[${rowlength}][2]" autocomplete="off" /></td>
  <td class="homonym"><input class="form-control" type="text" name="calendar[${rowlength}][3]" autocomplete="off" /></td>
  <td class="minus">
      <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
  </td>
</tr>
  `

  $(str).appendTo('tbody').show('slow')
}


function complete() {
  var title = $('.month input');

  $(title).each(function (idx, el) {
    var date = $(el).parents('.plusrow').children('.date').children('input').val();
    var content = $(el).parents('.plusrow').children('.content').children('input').val();

    if (!$(el).val() || !date || !content) {
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
  var c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/kakao/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=academicCalendar&val=${id}`
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