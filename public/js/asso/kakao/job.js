var reorder = function reorder() {
  $(".card").each(function (i, card) {
    $(card).find("td.jobOrder").children('input').val(i + 1);
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
          <th class="url" scope="col">url</th>
          <th class="thumbnail" scope="col">thumbnail</th>
          <th class="jobOrder" scope="col">jobOrder</th>
        </tr>
      </thead>
      <tbody>
        <tr class="cardContents">
          <td class="title"><input class="form-control" type="text" name="job[${cardlength}][title]" autocomplete="off"
              maxlength="20" /></td>
          <td class="description"><input class="form-control" type="text" name="job[${cardlength}][description]"
              autocomplete="off" maxlength="40" /></td>
          <td class="url"><input class="form-control" type="text" name="job[${cardlength}][url]" autocomplete="off" />
          </td>
          <td class="thumbnail">
            <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file"
                aria-describedby="inputGroupFileAddon01" name="job[${cardlength}][thumbnail]" /><label
                class="custom-file-label" for="inputGroupFile01" data-browse="📂"></label></div>
          </td>
          <td class="jobOrder"><input class="form-control" type="number" name="job[${cardlength}][jobOrder]"
              autocomplete="off" readonly="readonly" /></td>
        </tr>
      </tbody>
      <thead class="thead-light">
        <tr>
          <th class="code" scope="col">name</th>
          <th class="title" scope="col">val</th>
          <th scope="col" colspan="2"></th>
          <th class="del" scope="col">삭제</th>
        </tr>
      </thead>
      <tbody id="parambody">
        <tr class="param">
          <td><input class="form-control" type="text" name="job[${cardlength}][params][0][0]"
              autocomplete="off" /></td>
          <td><input class="form-control" type="text" name="job[${cardlength}][params][0][1]"
              autocomplete="off" /></td>
          <td></td>
          <td colspan="2"></td>
        </tr>
      </tbody>
      <tr>
        <td> 파라미터 추가
          <div class="btn btn-danger" id="pbt" onclick="paramplus(this)"><i class="fas fa-plus"></i></div>
        </td>
        <td colspan="2"></td>
        <td colspan="2"> 해당 카드 삭제
          <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
        </td>
      </tr>
    </table>
  </div>
`

  $(str).appendTo('#sortable').show('slow')
  reorder();
  filechange();
}

function paramplus(that) {
  var cardIdx = $('.card').index($(that).parents('.card'));
  var paramslength = $(that).closest('table').find('#parambody').find('.param').length;
  
  var str = `
  <tr class="param">
  <td><input class="form-control" type="text" name="job[${cardIdx}][params][${paramslength}][0]" autocomplete="off" /></td>
  <td><input class="form-control" type="text" name="job[${cardIdx}][params][${paramslength}][1]" autocomplete="off" /></td>
  <td>
      <div class="btn btn-primary" id="pbt" onclick="deleteparam(this)"><i class="fas fa-minus"></i></div>
  </td>
  <td colspan="2"></td>
</tr>
`

  $(str).appendTo($(that).closest('table').find('#parambody')).show('slow')
}


function complete() {
  let title = $('.jobtitle input');
  console.log('aaaa');

  $(title).each(function (idx, el) {
    let description = $(el).parents('.cardContents').children('.jobdescription').children('input').val();
    let url = $(el).parents('.cardContents').children('.joburl').children('input').val();

    if (!$(el).val() && !description && !url) {
      alert('하나 이상 입력해주세요!');
      return false;
    }
    if (idx + 1 == title.length) {
      console.log('aaaa');
      
      $("#frm").submit();
    }

  })
}



function deleteitem(self) {
  let card = $(self).parents('.card');
  let id = $(card).find("input#id").val();

  //jobOrder
  let c = confirm(`해당 카드를 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/kakao/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `table=job&val=${id}`
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

function deleteparam(self) {
  let param = $(self).parents('.param');

  //jobOrder
  let c = confirm(`해당 파라미터를 삭제하시겠습니까?`);

  if (c) {
    $(param).remove();
  }
}

