module.exports = function () {
    var conn = requrie('../../config/db')();
    var route = require('express').Router();

    route.get('/', (req, res) => {
        if (req.user) {         //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
            //일반 학생 계정일 경우
            res.render('comm/index');
        } else {
            res.redirect('/auth/login');
        }
    });


    return route;
};