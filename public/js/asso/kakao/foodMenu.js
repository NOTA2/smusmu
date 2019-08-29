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
  <td class="name"><input class="form-control" type="text" name="foodMenu[${rowlength}][0]" autocomplete="off" /></td>
  <td class="explanation"><input class="form-control" type="text" name="foodMenu[${rowlength}][1]" autocomplete="off" /></td>
  <td class="foodimg">
      <div class="custom-file"><input class="custom-file-input" id="inputGroupFile01" type="file" aria-describedby="inputGroupFileAddon01" name="foodMenu[${rowlength}][2]"/>
      <label class="custom-file-label" for="inputGroupFile01" data-browse="📂"></label></div>
  </td>
  <td class="phone"><input class="form-control" type="text" name="foodMenu[${rowlength}][3]" autocomplete="off" /></td>
  <td class="minus">
      <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
  </td>
</tr>
  `

  $(str).appendTo('tbody').show('slow')
  filechange();
}


function complete() {
  let name = $('.name input');

  $(name).each(function (idx, el) {
    let explanation = $(el).parents('.plusrow').children('.explanation').children('input').val();
    let foodimg = $(el).parents('.plusrow').children('.foodimg').children('input').val();
    let phone = $(el).parents('.plusrow').children('.phone').children('input').val();

    if (!$(el).val() || !explanation || !foodimg || !phone) {
      alert('입력해주세요!');
      return false;
    }
    if (idx + 1 == name.length) {
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
      body: `table=FoodMenu&val=${id}`
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