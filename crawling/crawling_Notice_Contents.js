var client = require('cheerio-httpcli');

exports.search = function(url) {

  return new Promise(function(resolve, reject) {

    client.fetch(url, function (err, $, res) {
      if (err) {
        console.log(err);
        resolve(false);
      }
      var result = new Object();
      result.str = '';
      result.url = url;
      try{
        if($(".board-view-title-wrap h4").length > 0) {
          result.str += $('.board-view-title-wrap h4').text().trim()+'\n\n';
          
          $(".fr-view p").each(function () {
  
            str = $(this).text().trim();
            img = $(this).find('img').attr('src');
            if(img){
              result.img = 'http://www.smu.ac.kr'+img.replace('https://www.smu.ac.kr', '')
            };
            
            if(str.replace(/\s/g,"") != "")
              result.str += str +'\n';
          })
        }else{
          result = false;
        }
        resolve(result);
      }catch(e){
        console.log(err);
        resolve(false);
      }
    });
  });
}
