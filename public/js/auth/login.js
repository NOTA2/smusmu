function checkSubmit() {
    var memberId = $('.memberId');
    var memberPw = $('.memberPw');

    if (memberId.val() == '') {
        alert('아이디를 입력해 주세요.');
        return false;
    }
    if (memberPw.val() == '') {
        alert('비밀번호를 입력해 주세요.');
        return false;
    }
    return true;
}