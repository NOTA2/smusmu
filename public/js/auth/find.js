function collegeChange() {
  var selectBox = document.getElementById("college");
  var major = document.getElementById("major");
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;
  if (selectedValue == '인문사회과학대학') {
    major.innerHTML = `
      <option value="역사콘텐츠학과">역사콘텐츠학과</option>
      <option value="지적재산권학과">지적재산권학과</option>
      <option value="문헌정보학과">문헌정보학과</option>
      <option value="한일문화콘텐츠학과">한일문화콘텐츠학과</option>
      <option value="공간환경학부">공간환경학부</option>
      <option value="	공공인재학부">공공인재학부</option>
      <option value="가족복지학과">가족복지학과</option>
      <option value="국가안보학과">국가안보학과</option>
      `
  } else if (selectedValue == '사범대학') {
    major.innerHTML = `
      <option value="국어교육과">국어교육과</option>
      <option value="영어교육과">영어교육과</option>
      <option value="교육학과">교육학과</option>
      <option value="수학교육과">수학교육과</option>
      <option value="불어교육과">불어교육과</option>
      <option value="	일어교육과">일어교육과</option>
      `
  } else if (selectedValue == '경영경제대학') {
    major.innerHTML = `
      <option value="경제금융학부">경제금융학부</option>
      <option value="경영학부">경영학부</option>
      <option value="글로벌경영학과">글로벌경영학과</option>
      <option value="융합경영학과">융합경영학과</option>
      `
  } else if (selectedValue == '융합공과대학') {
    major.innerHTML = `
      <option value="휴먼지능정보공학과">휴먼지능정보공학과</option>
      <option value="전기공학과">전기공학과</option>
      <option value="융합전자공학과">융합전자공학과</option>
      <option value="컴퓨터과학과">컴퓨터과학과</option>
      <option value="생명공학과">생명공학과</option>
      <option value="화학에너지공학과">화학에너지공학과</option>
      <option value="화공신소재학과">화공신소재학과</option>
      <option value="미디어소프트웨어학과">미디어소프트웨어학과</option>
      <option value="게임학과">게임학과</option>
      <option value="화학과">화학과</option>
      <option value="소비자주거학과">소비자주거학과</option>
      `
  } else if (selectedValue == '문화예술대학') {
    major.innerHTML = `
      <option value="식품영양학과">식품영양학과</option>
      <option value="의류학과">의류학과</option>
      <option value="스포츠건강관리학과">스포츠건강관리학과</option>
      <option value="무용예술학과">무용예술학과</option>
      <option value="조형예술학과">조형예술학과</option>
      <option value="생활예술학과">생활예술학과</option>
      <option value="음악학부">음악학부</option>
      `
  }
}
$('#frmid').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});
$('#frmpw').submit(function() {
  var pass = true;

  if(pass == false){
      return false;
  }
  $("#spinner").show();

  return true;
});

function findid() {
  var schoolId = $("#schoolId1").val();

  if (!schoolId) {
    alert('학번 입력하세요');
  } else if (schoolId.length != 9) {
    alert('학번을 제대로 입력해주세요.')
  } else {
    $("#frmid").submit();
  }
}

function findpw() {
  var username = $("#username").val();
  var schoolId = $("#schoolId2").val();

  if (!username) {
    alert('아이디를 입력하세요');
  } else if (!schoolId) {
    alert('학번 입력하세요');
  } else if (schoolId.length != 9) {
    alert('학번을 제대로 입력해주세요.')
  } else {
    $("#frmpw").submit();
  }
}