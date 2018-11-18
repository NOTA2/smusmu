var cheerio = require('cheerio');
var request = require('request');


exports.search = function(url) {

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);
        var content = '';

        temp = $("#divView p").each(function(idx, el){
          p = $(el).text().trim();
          content += p;
          if(p != '') content += '\n\n'
          if(content.length>1500){
            content += '...............\n링크를 통해 나머지 내용을 확인해 주세요.\n\n'
            return false;
          }
        });


        if(content == ''){
          var img = $("#divView img");
          if(img.length)
            content = '내용 없이 이미지로만 구성되어 있습니다.\n\n[이미지 보기]\n'+$(img).attr('src')+'\n'
          else
            content = '내용이 없거나 이미지로 구성되어 있습니다.\n링크를 통해 확인하세요\n\n'
        }


        resolve(content);
      }
      reject('결과를 찾을 수 없습니다.\n');
    });
  });
}
