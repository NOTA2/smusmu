history.pushState(null, null, location.href);
    window.onpopstate = function () {
        history.go(1);
};

function mail(){
    alert("메일을 다시 보냈습니다. 학교메일을 통해서 인증받으세요.");
    $("#frm").submit();
}