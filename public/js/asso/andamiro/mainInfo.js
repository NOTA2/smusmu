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
    placeholder: "mainInfoHighlight",
    start: function (event, ui) {
      ui.item.data('start_pos', ui.item.index());
    },
    stop: function (event, ui) {
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
              <th class="title" scope="col">제목</th>
              <th class="description" scope="col">설명</th>
              <th class="thumbnail" scope="col">이미지</th>
              <th class="menuorder" scope="col">순서</th>
              <th class="minus" scope="col">삭제</th>
          </tr>
      </thead>
      <tbody>
          <tr class="cardContents">
              <td class="title"><input class="form-control" id="title" type="text" name="mainInfo[${cardlength}][0]" autocomplete="off" maxlength="20" placeholder="최대 20자"/></td>
              <td class="description"><input class="form-control" id="description" type="text" name="mainInfo[${cardlength}][1]" autocomplete="off" maxlength="40" placeholder="최대 40자" /></td>
              <td class="thumbnail">
                  <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="mainInfo[${cardlength}][2]" /><label class="custom-file-label" for="inputGroupFile01" data-browse="📂"></label></div>
              </td>
              <td class="menuorder"><input class="form-control" type="number" name="mainInfo[${cardlength}][3]" autocomplete="off" readonly="readonly" /></td>
              <td>
                <input class="form-control" id="id" type="hidden" name="mainInfo[${cardlength}][4]" />
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

    if (!$(el).val() || !description || !(thumbnail || thumbnailHidden)) {
      alert('내용을 입력해주세요!');
      return false;
    }
    if (idx + 1 == title.length) {
      $("#frm").submit();
    }

  })
}



function deleteitem(self) {
  let card = $(self).parents('.card');
  let id = $(card).find("input#id").val();

  //menuorder
  var c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/andamiro/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=andamiro_info&val=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(card).remove();
          alert('해당 정보가 삭제되었습니다.')
          reorder()
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}