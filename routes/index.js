module.exports = function () {
    var conn = require('../config/db')();
    var route = require('express').Router();

    route.get('/', (req, res) => {
        if (req.user) {         //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
            //일반 학생 계정일 경우

            //학생회 계정일경우
            res.render('asso/index');
        } else {
            res.redirect('/auth/login');
        }
    });


    return route;
};