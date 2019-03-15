// $(document).ready(function () {
//     var str = $('.#description').val();
//     str = str.split('<br>').join("\r\n");
//     $('#description').val(str);
// })

function update() {
    var name = $("#name").val();

    // var str = $('#description').val();
    // str = str.replace(/(?:\r\n|\r|\n)/g, '<br>');
    // $('#description').val(str);

    var email = $("#email").val();
    var assoemail = $("#assoemail").val();
    var emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i; //이메일 정규식


    if (!name) {
        alert('이름을 입력하세요');
    } else if (!email) {
        alert('개인 이메일을 입력하세요');
    } else if (!emailRule.test(email)) {
        alert('개인 이메일을 제대로 입력해주세요.')
    } else if (assoemail.length>0 && !emailRule.test(assoemail)) {
        alert('대표 이메일을 제대로 입력해주세요.')
    } else {
        alert("정보를 수정하였습니다.");
        $("#frm").submit();
    }
}

$('#inputGroupFile01').on('change',function(){
    //get the file name
    var fileName = $(this).val().split('\\');
    fileName = fileName[fileName.length -1];
    //replace the "Choose a file" label
    $(this).next('.custom-file-label').html(fileName);
})