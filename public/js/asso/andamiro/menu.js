var reorder = function reorder() {
  $(".card").each(function (i, card) {
    $(card).find("td#faqorder").children('input').val(i + 1);
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
  <div class="card faqcard">
  <table class="table">
    <thead class="thead-light">
      <tr>
        <th scope="col">제목/설명/이미지</th>
        <th scope="col">순서/삭제</th>
      </tr>
    </thead>
    <tbody>
      <tr class="cardContents">
        <td class="title">
          <input class="form-control" type="text" name="menu[${cardlength}][0]" autocomplete="off" placeholder="제목" /></td>
        <td class="faqorder" id="faqorder" rowspan="2">
          <input class="form-control" type="number" name="menu[${cardlength}][5]" autocomplete="off" readonly="readonly" />
        </td>
      </tr>
      <tr>
        <td class="description">
          <input class="form-control" type="text" name="menu[${cardlength}][1]" autocomplete="off" placeholder="설명" />
        </td>
      </tr>
      <tr>
        <td class="thumbnail">
          <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file"
              aria-describedby="inputGroupFileAddon01" name="menu[${cardlength}][2]" /><label class="custom-file-label"
              for="inputGroupFile01" data-browse="📂">추가할 이미지가 있다면 넣어주세요</label></div>
        </td>
        <td class="faqorder">
          <input class="form-control" id="col" value=${col} type="hidden" name="menu[${cardlength}][3]" />
          <input class="form-control" id="infoId" value=${infoId} type="hidden" name="menu[${cardlength}][4]" />
          <input class="form-control" id="id" type="hidden" name="menu[${cardlength}][6]" />
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
    let description = $(el).parents('.cardContents').children('.description').children('input').val();
    let thumbnail = $(el).parents('.cardContents').children('.thumbnail').find('input').val();
    var thumbnailHidden = $(el).parents('.cardContents').children('.thumbnail').find('.thumbnailHidden').val();

    if (!$(el).val() && !description && !(thumbnail || thumbnailHidden)) {
      alert('내용을 한 카드에 하나라도 입력해주세요!');
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

  //faqorder
  var c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/andamiro/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=andamiro_menu&val=${id}`
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