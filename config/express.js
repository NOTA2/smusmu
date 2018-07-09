module.exports = function(){
  var express = require('express');
  var bodyParser = require('body-parser');
  var app = express();

  //템플릿 엔진 설정 및 폴더 설정
  app.set('view engine', 'jade');
  app.set('views', './views');
  app.locals.pretty = true;     //jade로 웹페이지를 만들기 때문에 태그를 깔끔하게 정리해주는 설정
  app.use(express.static('public'));
  app.use(express.static('asset'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));


  return app;
}
