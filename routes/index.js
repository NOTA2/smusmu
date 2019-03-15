// var conn = require('../config/db')();
var route = require('express').Router();

route.get('/', (req, res) => {
    console.log(req.user);

    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
        //일반 학생 계정일 경우
        if(req.user.kakaoId)
            res.redirect('/commu')

        //학생회 계정일경우
        else
            res.redirect('/asso');
    } else {
        res.redirect('/auth/login');
    }
});

route.get('/ping', (req, res) => {
    res.send('s');
});

module.exports = route;