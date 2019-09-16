var reorder = function reorder() {
  $(".card").each(function (i, card) {
    $(card).find("td#eventorder").children('input').val(i + 1);
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
    placeholder: "eventHighlight",
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
  <div class="card eventcard">
  <table class="table">
  <thead class="thead-light">
  <tr>
      <th class="eventcontent" scope="col" colspan="3">봉사활동 TEXT</th>
  </tr>
</thead>
<tbody>
<tr>
<td colspan="3" class="eventcontent"><textarea class="form-control" type="text" name="volunteer[${cardlength}][3]" rows="5" autocomplete="off"></textarea></td>
</tr>
</tbody>
      <thead class="thead-light">
          <tr>
              <th class="etitle" scope="col" colspan="2">카드 제목/설명/이미지</th>
              <th class="eventorder" scope="col">순서/삭제</th>
          </tr>
      </thead>
      <tbody>
        </tr>
          <tr class="cardContents">
              <td class="etitle" colspan="2"><input class="form-control" type="text" name="volunteer[${cardlength}][0]" autocomplete="off" placeholder="카드에 표시될 제목" /></td>
              <td class="eventorder" id="eventorder" rowspan="2"><input class="form-control" type="number" name="volunteer[${cardlength}][5]" autocomplete="off" readonly="readonly" /></td>
          </tr>
          <tr>
              <td colspan="2"> <input class="form-control" type="text" name="volunteer[${cardlength}][1]" autocomplete="off" placeholder="카드에 표시될 설명" /></td>
          </tr>
          <tr>
              <td colspan="2">
                  <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="volunteer[${cardlength}][2]" /><label class="custom-file-label" for="inputGroupFile01" data-browse="📂">카드 및 상세보기시 표시될 이미지</label></div>
              </td>
              <td class="eventorder"><input class="form-control" id="id" type="hidden" name="volunteer[${cardlength}][6]" />
                  <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
              </td>
          </tr>
      </tbody>
      <thead class="thead-light">
        <tr>
            <th class="ebtt" scope="col">버튼 유형</th>
            <th class="ebtn" scope="col">버튼 이름</th>
            <th class="ebtv" scope="col">값</th>
        </tr>
      </thead>
      <tbody>
          <tr class="btr">
              <td class="ebtt"><select class="custom-select btype" name="volunteer[${cardlength}][4][0][0]"><option value="null" selected="selected">none</option><option value="osLink">웹 링크</option><option value="phone">전화</option></select></td>
              <td class="ebtn"><input class="form-control" type="text" name="volunteer[${cardlength}][4][0][1]" autocomplete="off" /></td>
              <td class="ebtv"><input class="form-control" type="text" name="volunteer[${cardlength}][4][0][2]" autocomplete="off" /></td>
          </tr>
          <tr class="btr">
              <td class="ebtt"><select class="custom-select btype" name="volunteer[${cardlength}][4][1][0]"><option value="null" selected="selected">none</option><option value="osLink">웹 링크</option><option value="phone">전화</option></select></td>
              <td class="ebtn"><input class="form-control" type="text" name="volunteer[${cardlength}][4][1][1]" autocomplete="off" /></td>
              <td class="ebtv"><input class="form-control" type="text" name="volunteer[${cardlength}][4][1][2]" autocomplete="off" /></td>
          </tr>
          <tr class="btr">
              <td class="ebtt"><select class="custom-select btype" name="volunteer[${cardlength}][4][2][0]"><option value="null" selected="selected">none</option><option value="osLink">웹 링크</option><option value="phone">전화</option></select></td>
              <td class="ebtn"><input class="form-control" type="text" name="volunteer[${cardlength}][4][2][1]" autocomplete="off" /></td>
              <td class="ebtv"><input class="form-control" type="text" name="volunteer[${cardlength}][4][2][2]" autocomplete="off" /></td>
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
  var contents = $('.eventcontent textarea');

  $(contents).each(function (idx, el) {
    let title = $(el).parents('.eventcard').find('.etitle input').val();
    
    
    if (!$(el).val() || !title) {
      alert('최소한으로 필요한 정보(봉사활동 TEXT, 카드 제목)을 입력해주세요');
      return false;
    }
    if (idx + 1 == contents.length) {
      $("#frm").submit();
    }
  })
}



function deleteitem(self) {
  let card = $(self).parents('.card');
  let id = $(card).find("input#id").val();

  var c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/kakao/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=volunteer&val=${id}`
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

