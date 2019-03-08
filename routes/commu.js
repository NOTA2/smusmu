var conn = require('../config/db')();
var route = require('express').Router();

route.get('/', (req, res) => {
    if (req.user) { //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
        if(req.user.token == 'true')
            res.render('commu/index');
        else
            res.redirect('/auth/register/commu/email')
    } else {
        res.redirect('/auth/login');
    }
});


module.exports = route;