var conn = require('../config/db')();
var route = require('express').Router();


route.get('*', (req, res,next) =>{
    var user = req.user;
    
    if(user && user.grade){
        if(user.token == 'true')
            next();
        else
            res.render('asso/wait', {user : req.user})
    }else if(user && user.kakaoId){
        res.redirect('/commu');
    } else{
        res.redirect('/auth/login');
    }

})


route.get('/', (req, res) => {

    res.render('asso/index', {user : req.user});

});



module.exports = route;