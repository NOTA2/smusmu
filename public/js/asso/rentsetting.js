$('#frm').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});
function formplus(assoId) {
  var rowlength = $(".plusrow").length;
  var str = `
  <tr class="plusrow">
  <td class="name"><input class="form-control" type="text" name="rent[${rowlength}][0]" autocomplete="off" maxlength="20" /></td>
  <td class="now"><input class="form-control" type="number" name="rent[${rowlength}][1]" autocomplete="off" /></td>
  <td class="all"><input class="form-control" type="number" name="rent[${rowlength}][2]" autocomplete="off" /></td>
  <td class="date"><input class="form-control" type="number" name="rent[${rowlength}][3]" autocomplete="off" value=1 /><input class="id form-control" type="hidden" name="rent[${rowlength}][5]" /></td>
  <td class="minus">
    <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
</td><input class="form-control" id="assoId" type="hidden" name="rent[${rowlength}][4]" value="${assoId}"/></tr>
`

$(str).appendTo('tbody').show('slow')
}


function complete() {
  var name = $('.name input');

  $(name).each(function (idx, el) {
    var nowcount = $(el).parents('.plusrow').children('.now').children('input').val();
    var allcount = $(el).parents('.plusrow').children('.all').children('input').val();
    

    if (!$(el).val()) {
      alert('물품 이름을 입력해주세요!');
      return false;
    }else if(parseInt(nowcount) > parseInt(allcount)){
      alert('현재 수량이 전체 수량보다 많습니다.')
      return false;
    }
    if(idx +1 == name.length)
      $("#frm").submit();
  })
}


function deleteitem(self) {
  let itemname = $(self).parents('.plusrow').children('.name').children('input').val();
  let row = $(self).parents('.plusrow');
  let id = $(row).find("input#id").val();

  let c = confirm(`[${itemname}] 대여 물품을 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/rent/setting/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `id=${id}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(row).remove();
          alert('대여물품이 삭제되었습니다.')
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}