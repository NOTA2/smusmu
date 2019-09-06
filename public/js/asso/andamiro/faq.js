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
          <tr></tr>
          <th class="question" scope="col">question</th>
          <th class="answer" scope="col">answer</th>
          <th class="faqurl" scope="col">이미지/url/phone</th>
          <th class="faqorder" scope="col">순서/삭제</th>
      </thead>
      <tbody>
          <tr class="cardContents">
              <td class="question" rowspan="3"><textarea class="form-control" type="text" name="faq[${cardlength}][0]" rows="5" autocomplete="off"></textarea></td>
              <td class="answer" rowspan="3"><textarea class="form-control" type="text" name="faq[${cardlength}][1]" rows="5" autocomplete="off"></textarea></td>
              <td>
                  <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="faq[${cardlength}][2]" /><label class="custom-file-label" for="inputGroupFile01" data-browse="📂">답변에 추가할 이미지가 있다면 넣어주세요</label></div>
              </td>
              <td class="faqorder" id="faqorder" rowspan="2"><input class="form-control" type="number" name="faq[${cardlength}][6]" autocomplete="off" readonly="readonly" /></td>
          </tr>
          <tr>
              <td> <input class="form-control" type="text" name="faq[${cardlength}][3]" autocomplete="off" placeholder="버튼으로 추가할 url이 있다면 넣어주세요" /></td>
          </tr>
          <tr>
              <td class="faqurl"><input class="form-control" type="text" name="faq[${cardlength}][4]" autocomplete="off" placeholder="버튼으로 추가할 전화번호가 있다면 넣어주세요" /></td>
              <td class="faqorder"><input class="form-control" id="col" type="hidden" value=${col} name="faq[${cardlength}][5]" /><input class="form-control" id="id" type="hidden" name="faq[${cardlength}][7]" />
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
  var question = $('.question textarea');

  $(question).each(function (idx, el) {
    let answer = $(el).parents('.cardContents').children('.answer').children('textarea').val();

    if (!$(el).val() || !answer) {
      alert('내용을 입력해주세요!');
      return false;
    }
    if (idx + 1 == question.length) {
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
      body: `table=andamiro_faq&val=${id}`
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