$('#frm').submit(function () {
    var pass = true;
  
    if (pass == false) {
      return false;
    }
    $("#spinner").show();
  
    return true;
  });
  
  function formplus(il) {
  
    var rowlength = $(".plusrow").length;
    var str = `
    <tr class="plusrow">
    <td class="category">
      <input class="form-control" type="text" name="schoolInfo[${rowlength}][0]" autocomplete="off">
    </td>
    <td class="keyword">
      <input class="form-control" type="text" name="schoolInfo[${rowlength}][1]" autocomplete="off">
    </td>
    <td class="phoneNumber">
      <input class="form-control" type="text" name="schoolInfo[${rowlength}][2]" autocomplete="off">
    </td>
    <td class="faxNumber">
      <input class="form-control" type="text" name="schoolInfo[${rowlength}][3]" autocomplete="off">
    </td>
    <td class="img">
      <select class="custom-select btype" name="schoolInfo[${rowlength}][4]">
        <option selected=""></option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="G">G</option>
        <option value="H">H</option>
        <option value="I">I</option>
        <option value="J">J</option>
        <option value="K">K</option>
        <option value="L">L</option>
        <option value="M">M</option>
        <option value="N">N</option>
        <option value="O">O</option>
        <option value="R">R</option>
        <option value="S">S</option>
        <option value="T">T</option>
        <option value="U">U</option>
        <option value="all">all</option>
        <option value="계">계</option>
        <option value="어">어</option>
      </select>
    </td>
    <td class="explanation">
      <input class="form-control" type="text" name="schoolInfo[${rowlength}][5]" autocomplete="off">
    </td>
    <td class="minus">
      <div class="btn btn-primary" id="pbt" onclick="deleteitem(this)"><i class="fas fa-minus"></i></div>
    </td>
  </tr>
    `
  
    $(str).appendTo('tbody').show('slow')
  }
  
  
  function complete() {
    var category = $('.category input');
  
    $(category).each(function (idx, el) {
      var keyword = $(el).parents('.plusrow').children('.keyword').children('input').val();
  
      if (!$(el).val() || !keyword) {
        alert('입력해주세요!');
        return false;
      }
      if (idx + 1 == category.length) {
        $("#frm").submit();
      }
    })
  }
  
  
  
  function deleteitem(self) {
    let row = $(self).parents('.plusrow');
    let id = $(row).find("input#id").val();
    
    var c = confirm(`해당 정보를 목록에서 삭제하시겠습니까?`);
  
    if (c) {
      fetch("/asso/kakao/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `table=schoolInfo&val=${id}`
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