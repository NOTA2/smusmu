module.exports = function(){
  var express = require('express');
  var bodyParser = require('body-parser');
  var session = require('express-session');
  var MySQLSessionStore = require('express-mysql-session')(session);
  const fs = require('fs');
  const dbKey = fs.readFileSync('key/dbKey', 'utf-8');
  var compression = require('compression');
  var helmet = require('helmet');
  const cookieParser = require('cookie-parser');

  var app = express();
  //템플릿 엔진 설정 및 폴더 설정
  app.set('view engine', 'pug');
  // app.set('views', 'views');
  app.locals.pretty = true;     //jade로 웹페이지를 만들기 때문에 태그를 깔끔하게 정리해주는 설정
  
  app.use(express.static('public'));
  app.use(compression());
  app.use(helmet());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  
  app.use(session({
    secret : '##@)^#*#^(#^#*^#^%$###@#@!@#$%rlaehdgusdmsanjsrkfmfgkfwnfdksmsshadlesdk)',
    resave : false,
    saveUninitialized : true,
    store : new MySQLSessionStore({
      host : 'smusmutest.cew1lcmxgnch.ap-northeast-2.rds.amazonaws.com',
      port : 3306,
      user : 'smusmu',
      password : dbKey,
      database : 'smusmutest'
    })
  }));


  return app;
}
