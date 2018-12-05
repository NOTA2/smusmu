module.exports = function (passport) {
    var conn = require('../../config/db')();
    var hasher = require('pbkdf2-password')();
    var route = require('express').Router();

    route.get('/register', (req, res) => {
        res.render('auth/register');
    });

    route.post('/register', (req, res) => {

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
                            res.redirect('/home');
                        });
                    });
                }
            });
        });
    });

    route.get('/login', (req, res) => {
        if (req.user) {
            res.redirect('/home');
        } else {
            res.render('auth/login');
        }
    });

    route.post('/login', passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/auth/login',
        failureFlash: false
    }));

    route.get('/logout', (req, res) => {
        req.logout();
        req.session.save(() => {
            res.redirect('/auth/login')
        })
    })

    return route
};