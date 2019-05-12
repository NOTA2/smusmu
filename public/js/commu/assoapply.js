$('#frm').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});

function apply() {
  var collegeBox = document.getElementById("college");
  var college = collegeBox.options[collegeBox.selectedIndex].value;

  if (college == "none") {
    alert('대표하는 단과대를 선택해 주세요.')
  } else {

    alert("신청하였습니다.");
      $("#frm").submit();
  }
}

function del() {
  var c = confirm('정말 탈퇴 하시겠습니까?')
  if(c){
    alert("처리 되었습니다.");
    $("#frm").submit();
  }

}

function gradeCollege(){
  var collegeBox = document.getElementById("college");
  var college = collegeBox.options[collegeBox.selectedIndex].value;

  if(college != "none"){
    $("#name").val(asso2[college][0]);
    $("#assoId").val(asso2[college][1]);
  }
  else{
    $("#name").val("");
    $("#assoId").val(null);
  }
}