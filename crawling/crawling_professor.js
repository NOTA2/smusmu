var client = require('cheerio-httpcli');

exports.search = function (keyword) {
  return new Promise(function (resolve, reject) {

    var url = `https://www.smu.ac.kr/search/search.do?menu=교수검색&qt=${keyword}`;
    url = encodeURI(url)
  
    client.fetch(url, function (err, $, res) {
      if (err) {        
        console.log(err);
        resolve(false);
      }
      var result = new Array();

      try {
        $("#Result_교수검색 li").each((idx, el) => {
          result[idx] = new Object();
          result[idx].name = $(el).find('p:nth-child(1)').text().trim().replace(/\s/g, "");
          result[idx].mail = $(el).find('p:nth-child(1) a').attr('href')
          result[idx].position = $(el).find('p:nth-child(2)').text().trim().split('\n')[0];
          result[idx].phone = $(el).find('p:nth-child(3)').text().trim().replace(/[^0-9.-]/g, "");
          result[idx].homepage = $(el).find('p:nth-child(4)').text().trim().replace(/홈페이지 :|\s/g, "");
          result[idx].office = $(el).find('p:nth-child(5)').text().trim();
        })
        resolve(result);
      } catch (e) {
        resolve(false);
      }
    });
  });
}