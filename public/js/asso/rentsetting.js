var itemid = 0;

$(function () {

  $('.code').each(function (idx, el) {
    itemid = parseInt($(el).val()) +1;
  })
});

function formplus() {
  var str = `
  <tr class="plusrow">
  <td class="name">
    <input class="form-control" type="text" name="name" autocomplete="off" maxlength="20" />
  </td>
  <td class="now">
    <input class="form-control" type="number" value="0" name="nowcount" autocomplete="off" />
  </td>
  <td class="all">
    <input class="form-control" type="number" value="0" name="allcount" autocomplete="off" />
  </td>
  <td class="date">
    <input class="form-control" type="number" value="1" name="day" autocomplete="off" />
    <input class="code form-control" type="hidden" name="code" value="${getitemid()}" />
  </td>
  <td class="minus"><i class="fas fa-minus-square" onclick="deleteitem(this)"></i></td>
</tr>
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


function getitemid() {
  $('.code').each(function (idx, el) {
    itemid = parseInt($(el).val()) +1;
  })
  return itemid;
}

function deleteitem(self) {
  var itemname = $(self).parents('.plusrow').children('.name').children('input').val();
  var itemcode = $(self).parents('.plusrow').children('.date').children('.code').val();
  var assoId = $('#assoId').val();

  var c = confirm(`[${itemname}] 대여 물품을 목록에서 삭제하시겠습니까?`);

  if (c) {
    fetch("/asso/rent/setting/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `code=${itemcode}&assoId=${assoId}`
    }).then(function (res) {
      res.json().then(function (data) {
        if (data.status) {
          $(self).parents('.plusrow').remove();
          alert('대여물품이 삭제되었습니다.')
        }
      })
    }, function (e) {
      alert("잠시 문제가 생겼습니다. 다시 시도해주세요");
    });
  }
}