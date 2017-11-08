var request = require('request');
var jsonfile = require('jsonfile');
var file = './asset/stock.json';
var result = new Array(3);
result[0] = '';           //대여 물품 목록을 보여주기 위한 문자열 저장
result[1] = new Array();  //학생회 이름을 배열로 넣어서 버튼으로 사용
result[2] = new Array();  //2차원 배열로 만들어서 이름과 내용을 추가


exports.search = function() {
  return new Promise(function(resolve, reject) {

    jsonfile.readFile(file, function(err, stock) {

      var list = stock.list;

      for(i in list){
        var listName = list[i].name;
        if(i!=0)
          result[0] +='--------------------';
        result[0] += '['+listName+']' + '\n' + list[i].ex + '\n';
        result[0] += list[i].location + '에 위치하고 있습니다.\n';

        result[1].push(listName);     //버튼 목록 추가

        result[2][i] = new Array(2);  //2차원 배열로 하기위해서
        result[2][i][0] = listName;   //첫번째에는 학생회 이름
        result[2][i][1] = '['+listName+']\n'  //처음에 학생회 이름을 넣어준다.

        for(j in stock[listName]){
          things = stock[listName][j];
          result[0] += '   - ' + things.name +'('+things.totalCount+'개)\n'

          result[2][i][1] += ' - ' + things.name + ' : ' + things.count + '/' + things.totalCount +'\n'
        }
        result[0] += '\n'
      }

      resolve(result);
    });
  });
}
