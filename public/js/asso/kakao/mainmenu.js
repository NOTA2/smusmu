var reorder = function reorder() {
  $(".card").each(function (i, card) {
    $(card).find("td.menuorder").children('input').val(i + 1);
  });
}
$('.custom-file-input').on('change',function(){
  var fileName = $(this).val().split('\\')
  fileName = fileName[fileName.length -1]
  $(this).next('.custom-file-label').html(fileName);
})
function filechange(){
  $('.custom-file-input').on('change',function(){
    var fileName = $(this).val().split('\\')
    fileName = fileName[fileName.length -1]
    $(this).next('.custom-file-label').html(fileName);
  })
}
$('#frm').submit(function () {
  var pass = true;

  if (pass == false) {
    return false;
  }
  $("#spinner").show();

  return true;
});

$(function () {

  $("#sortable").sortable({
    placeholder: "itemBoxHighlight",
    start: function (event, ui) {

      ui.item.data('start_pos', ui.item.index());

    },

    stop: function (event, ui) {
      // var spos = ui.item.data('start_pos');
      // var epos = ui.item.index();

      reorder();
    }
  });
});


$(document).ready(reorder);

function formplus() {
  var cardlength = $(".card").length;
  var str = `
  <div class="card">
  <table class="table table-striped">
      <thead class="thead-light">
          <tr>
              <th class="title" scope="col">title</th>
              <th class="description" scope="col">description</th>
              <th class="auth" scope="col">등록여부</th>
              <th class="thumbnail" scope="col">thumbnail</th>
              <th class="menuorder" scope="col">menuorder</th>
          </tr>
      </thead>
      <tbody>
          <tr class="cardContents">
              <td class="title"><input class="form-control" id="title" type="text" name="menu[${cardlength}][title]" autocomplete="off" maxlength="20" /></td>
              <td class="description"><input class="form-control" id="description" type="text" name="menu[${cardlength}][description]" autocomplete="off" maxlength="40" /></td>
              <td class="auth"><select class="custom-select" id="auth" name="menu[${cardlength}][auth]"><option value="0" selected="selected">바로 사용가능</option><option value="1">등록한 사람만 사용</option></select></td>
              <td class="thumbnail">
                  <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="menu[${cardlength}][thumbnail]" />
                  <label class="custom-file-label" for="inputGroupFile01" data-browse="📂"></label></div>
              </td>
              <td class="menuorder"><input class="form-control" type="number" name="menu[${cardlength}][menuorder]" autocomplete="off" readonly /></td>
          </tr>
      </tbody>
      <thead class="thead-light">
          <tr>
              <th class="code" scope="col">버튼 유형</th>
              <th class="title" scope="col">버튼 이름</th>
              <th class="description" scope="col" colspan="3">값</th>
          </tr>
      </thead>
      <tbody>
          <tr class="btr">
              <td><select class="custom-select btype" name="menu[${cardlength}][buttons][0][0]"><option value="null" selected="selected">none</option><option value="block">block</option><option value="webLink">webLink</option><option value="osLink">osLink</option><option value="message">message</option><option value="phone">phone</option><option value="share">share</option></select></td>
              <td><input class="form-control" type="text" name="menu[${cardlength}][buttons][0][1]" autocomplete="off" /></td>
              <td class="bvalue" colspan="3"><input class="form-control" name="menu[${cardlength}][buttons][0][2]" type="text" autocomplete="off" /></td>
          </tr>
          <tr class="btr">
              <td><select class="custom-select btype" name="menu[${cardlength}][buttons][1][0]"><option value="null" selected="selected">none</option><option value="block">block</option><option value="webLink">webLink</option><option value="osLink">osLink</option><option value="message">message</option><option value="phone">phone</option><option value="share">share</option></select></td>
              <td><input class="form-control" type="text" name="menu[${cardlength}][buttons][1][1]" autocomplete="off" /></td>
              <td class="bvalue" colspan="3"><input class="form-control" name="menu[${cardlength}][buttons][1][2]" type="text" autocomplete="off" /></td>
          </tr>
          <tr class="btr">
              <td><select class="custom-select btype" name="menu[${cardlength}][buttons][2][0]"><option value="null" selected="selected">none</option><option value="block">block</option><option value="webLink">webLink</option><option value="osLink">osLink</option><option value="message">message</option><option value="phone">phone</option><option value="share">share</option></select></td>
              <td><input class="form-control" type="text" name="menu[${cardlength}][buttons][2][1]" autocomplete="off" /></td>
              <td class="bvalue" colspan="3"><input class="form-control" name="menu[${cardlength}][buttons][2][2]" type="text" autocomplete="off" /></td>
          </tr>
          <tr>
              <td colspan="6">
                  <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
              </td>
          </tr>
      </tbody>
  </table>
</div>
`

  $(str).appendTo('#sortable').show('slow')
  reorder();
  filechange();
}


function complete() {
  var title = $('.title input');

  $(title).each(function (idx, el) {
    var description = $(el).parents('.cardContents').children('.description').children('input').val();
    var thumbnail = $(el).parents('.cardContents').children('.thumbnail').find('input').val();
    var thumbnailHidden = $(el).parents('.cardContents').children('.thumbnail').find('.thumbnailHidden').val();

    if (!$(el).val() && !description && !(thumbnail || thumbnailHidden)) {
      alert('하나 이상 입력해주세요!');
      return false;
    }
    if (idx + 1 == title.length) {
      // let obj = $('#frm').serializeObject()

      $("#frm").submit();
    }

  })
}



function deleteitem(self) {
  let card = $(self).parents('.card');
  let id = $(card).find("input#id").val();

  //menuorder
  var c = confirm(`해당 카드를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/kakao/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=mainMenu&val=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(card).remove();
          alert('해당 카드가 삭제되었습니다.')
          reorder()
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}