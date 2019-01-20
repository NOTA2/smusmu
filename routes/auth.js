module.exports = function (passport) {
    var conn = require('../config/db')();
    var hasher = require('pbkdf2-password')();
    var route = require('express').Router();

    route.get('/register', (req, res) => {
        res.render('auth/register');
    });

    route.get('/register/asso', (req, res) => {
        res.render('auth/registerAsso');
    });

    route.get('/register/comm', (req, res) => {
        res.render('auth/registerComm');
    });

    route.post('/register/asso', (req, res) => {

        hasher({
            password: req.body.password
        }, (err, pass, salt, hash) => {
            var user = {
                username: req.body.username,
                password: hash,
                salt: salt
            }

            var sql = 'INSERT INTO assoUser SET ?';
            conn.query(sql, user, (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                } else {
                    req.login(user, (err) => {
                        req.session.save(() => {
                            res.redirect('/asso');
                        });
                    });
                }
            });
        });
    });

    route.post('/register/comm', (req, res) => {

        hasher({
            password: req.body.password
        }, (err, pass, salt, hash) => {
            var user = {
                username: req.body.username,
                password: hash,
                salt: salt
            }

            var sql = 'INSERT INTO user SET ?';
            conn.query(sql, user, (err, results) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                } else {
                    req.login(user, (err) => {
                        req.session.save(() => {
                            res.redirect('/comm');
                        });
                    });
                }
            });
        });
    });



    route.get('/login', (req, res) => {
        if (req.user) {         //로그인 정보가 있을 때(세션이 유지가 되어 있을 때)
            //일반 학생 계정일 경우

            //학생회 계정일경우
            res.render('asso/index');
        } else {
            res.render('auth/login');
        }
    });

    route.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: false
    }));

    route.get('/logout', (req, res) => {
        req.logout();
        req.session.save(() => {
            res.redirect('/auth/login');
        })
    })

    return route;
};