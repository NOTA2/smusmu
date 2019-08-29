// var conn = require('../config/db');
var router = require('express').Router();

router.get('/', (req, res) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
        if(req.user.kakaoId)    //일반 학생 계정일 경우
            res.redirect('/commu')
        else                    //학생회 계정일경우
            res.redirect('/asso');
    } else {
        res.redirect('/auth/login');
    }
});

router.get('/ping', (req, res) => {
    res.send('s');
});

module.exports = router;