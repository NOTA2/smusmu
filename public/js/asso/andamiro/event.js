$('.custom-file-input').on('change', function () {
  var fileName = $(this).val().split('\\')
  fileName = fileName[fileName.length - 1]
  $(this).next('.custom-file-label').html(fileName);
})

$('#frm').submit(function () {
  var pass = true;
  if (pass == false) {
    return false;
  }
  $("#spinner").show();
  return true;
});


function complete() {
  let title = $('#title').val();
  let description =  $('#description').val();
  let thumbnail =  $('#inputGroupFile01').val();
  let thumbnailHidden =  $('#thumbnailHidden').val();

  let img =  $('#inputGroupFile02').val();
  let imgHidden =  $('#imgHidden').val();
  let eventcontent =  $('#eventcontent').val();
  
  if (!title || !description || !(thumbnail || thumbnailHidden)) {
    alert('메인에 표시될 내용을 모두 입력해주세요!');
  } else if(!(img || imgHidden) && !eventcontent){
    alert('이벤트의 이미지 혹은 내용을 입력해주세요');
  }  else {
    $("#frm").submit();
  }

}