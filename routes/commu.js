var conn = require('../config/db')();
var route = require('express').Router();

route.get('*', (req, res,next) =>{
    var user = req.user;
    
    if(user){
        if(user.token == 'true')
            next();
        else
            res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
    }else {
        res.redirect('/auth/login');
    }

})

route.get('/', (req, res) => {
    
    res.render('commu/index', {user:req.user});

});

route.get('/petition', (req, res) => {

    res.render('commu/petition', {user : req.user});

});

route.get('/petitionanswer', (req, res) => {

    res.render('commu/petitionanswer', {user : req.user});

});


module.exports = route;