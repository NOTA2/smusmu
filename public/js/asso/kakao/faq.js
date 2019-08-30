$('#frm').submit(function () {
  var pass = true;

  if (pass == false) {
    return false;
  }
  $("#spinner").show();

  return true;
});

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

function formplus() {
  var rowlength = $(".plusrow").length;
  var str = `
  <tr class="plusrow">
  <td class="faqcategory"><input class="form-control" type="text" name="faq[${rowlength}][0]" autocomplete="off" /></td>
  <td class="faqcategory"><input class="form-control" type="text" name="faq[${rowlength}][1]" autocomplete="off" /></td>
  <td class="faqcategory"><input class="form-control" type="text" name="faq[${rowlength}][2]" autocomplete="off" /></td>
  <td class="faqcategory"><input class="form-control" type="text" name="faq[${rowlength}][3]" autocomplete="off" /></td>
  <td class="faqcategory"><input class="form-control" type="text" name="faq[${rowlength}][4]" autocomplete="off" /></td>
  <td class="question" rowspan="2"><textarea class="form-control" type="text" name="faq[${rowlength}][5]" rows="3" autocomplete="off"></textarea></td>
  <td class="answer" rowspan="2"><textarea class="form-control" type="text" name="faq[${rowlength}][6]" rows="3" autocomplete="off"></textarea></td>
  <td class="faqurl"><input class="form-control" type="text" name="faq[${rowlength}][7]" autocomplete="off" /></td>
  <td class="minus" rowspan="2"><input class="form-control" id="id" type="hidden" name="faq[${rowlength}][10]" />
      <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
  </td>
</tr>
<tr>
  <th colspan="3">
    <select class="custom-select" id="auth" name="faq[${rowlength}][9]"><option value="0" selected="selected">미등록</option><option value="1">등록</option></select>
  </th>
  <th colspan="2">
    <input class="form-control" type="number" value="0" disabled="disabled" />
  </th>
  <td>
  <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="faq[${rowlength}][8]" /><label class="custom-file-label" for="inputGroupFile01" data-browse="📂"></label></div>
  </td>
</tr>
  `

  $(str).appendTo('tbody').show('slow')
  filechange();
}


function complete() {
  let faqcategory = $('.faqcategory:first-child input');

  $(faqcategory).each(function (idx, el) {
    
    let question = $(el).parents('.plusrow').children('.question').children('textarea').val();
    let answer = $(el).parents('.plusrow').children('.answer').children('textarea').val();

    if (!$(el).val() || !question || !answer) {
      alert('입력해주세요!');
      return false;
    }
    if (idx + 1 == faqcategory.length) {
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
      body: `table=faq&val=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(row).next().remove();
          $(row).remove();
          alert('해당 정보가 삭제되었습니다.')
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}