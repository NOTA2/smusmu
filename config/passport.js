module.exports = function (app) {
    var conn = require('./db')();
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var hasher = require('pbkdf2-password')();

    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy((username, password, done) => {
        var sql = 'SELECT * FROM assoUser WHERE username=?';
        console.log('dflsdf');
        conn.query(sql, [username], (err, results) => {
            if (err)
                done(null, false);
            var user = results[0];

            console.log(user);
            if (!user)
                return done(null, false);

            hasher({
                password: password,
                salt: user.salt
            }, (err, pass, salt, hash) => {
                console.log(hash);
                
                if (hash === user.password)
                    done(null, user);
                else
                    done(null, false);
            });
        });
    }));

    passport.serializeUser((user, done) => {
        console.log('serializeUser');
        done(null, user.username);
    });

    passport.deserializeUser((username, done) => {
        console.log('deserializeUser');
        var sql = 'SELECT * fROM assoUser WHERE username=?'

        conn.query(sql, [username], (err, results) => {
            if (err) {
                console.log(err);
                return done('There is no user');
            } else
                return done(null, results[0])

        });
    });

    return passport

}