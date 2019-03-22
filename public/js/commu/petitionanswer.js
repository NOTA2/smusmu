ClassicEditor
.create( document.querySelector( '#editor1' ) , {
  language:'ko',
  ckfinder: {
    uploadUrl: '/commu/upload'
  }
})
.then( editor => {
} )
.catch( error => {
  console.error( error );
} );


// function autolink(id) {
// }
// autolink('.ck-editor__editable')


function submitwrite(){
  var abc = $(".ck-editor__editable").val();

  var container = document.querySelector('.ck-editor__editable');
  var doc = container.innerHTML;
  
  var regURL = new RegExp("(http|https|ftp|telnet|news|irc)://([-/.a-zA-Z0-9_~#%$?&=:200-377()]+)","gi");
  var regEmail = new RegExp("([xA1-xFEa-z0-9_-]+@[xA1-xFEa-z0-9-]+\.[a-z0-9-]+)","gi");
  container.innerHTML = doc.replace(regURL,"<a href='$1://$2' target='_blank'>$1://$2</a>").replace(regEmail,"<a href='mailto:$1'>$1</a>");

  $("#frm").submit();
  
}