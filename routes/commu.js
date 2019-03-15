var conn = require('../config/db')();
var route = require('express').Router();

route.get('/', (req, res, next) => {
    if (req.user) {
        if (req.user.token == 'true') next();
        else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
    } else
        res.redirect('/auth/login');
}, (req, res) => {
    res.render('commu/index', {
        user: req.user,
        info: {
            title: 'HOME',
            headbar: []
        }
    });
});

route.get('/myinfo', (req, res, next) => {
    if (req.user) {
        if (req.user.token == 'true') next();
        else res.redirect(`/auth/register/commu/email?kakaoId=${req.user.kakaoId}`)
    } else
        res.redirect('/auth/login');
}, (req, res) => {
    req.user.phone = req.user.phone.split('-');

    res.render('commu/myinfo', {
        user: req.user,
        info: {
            title: '내 정보',
            headbar: []
        }
    });
});

route.post('/myinfo', (req, res) => {

    var param = [
        req.body.name,
        req.body.college,
        req.body.department,
        req.body.nickname,
        req.body.phone1 + '-' + req.body.phone2 + '-' + req.body.phone3,
        req.body.id
    ]

    var sql = 'UPDATE users SET name=?, college=?, department=?, nickname=?, phone=? WHERE id=?'
    conn.query(sql, param, (err, results) =>{
        if (err) {
            console.log(err);
            res.status(500).end();
        }else{
            req.user.name = req.body.name
            req.user.college = req.body.college
            req.user.department = req.body.department
            req.user.nickname = req.body.nickname
            req.user.phone = [req.body.phone1 , req.body.phone2 , req.body.phone3]

            res.render('commu/myinfo', {
                user: req.user,
                info: {
                    title: '내 정보',
                    headbar: []
                }
            });
        }
    })
});


route.get('/petition', (req, res) => {

    res.render('commu/petition', {
        user: req.user
    });

});

route.get('/petitionanswer', (req, res) => {

    res.render('commu/petitionanswer', {
        user: req.user
    });

});


module.exports = route;