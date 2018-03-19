var cheerio = require('cheerio');
var request = require('request');


exports.search = function(url) {

  return new Promise(function(resolve, reject) {
    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        //HTML body
        var $ = cheerio.load(body);
        var content = '';

        temp = $("#divView > p").toArray();

        for(var i=0;i<temp.length;i++){
          p = $(temp[i]).text().trim();
          content += p;
          if(p != '') content += '\n\n'
          if(content.length>1500){
            content += '...............\n링크를 통해 나머지 내용을 확인해 주세요.\n\n'
            break;
          }

        }

        if(content == '')
          content = '내용이 없거나 이미지로 구성되어 있습니다.\n링크를 통해 확인하세요\n\n'

        resolve(content);
      }
      reject('결과를 찾을 수 없습니다.\n');
    });
  });
}
