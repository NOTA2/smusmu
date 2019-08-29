module.exports = function (app) {
  var conn = require('./db');
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var hasher = require('pbkdf2-password')();

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy((username, password, done) => {
    var sql = 'SELECT * FROM users WHERE username=?';
    conn.query(sql, [username], (err, results) => {
      if (err)
        done(null, false);
      var user = results[0];

      if (!user) {
        var sql = 'SELECT * FROM assoUser WHERE username=?';
        conn.query(sql, [username], (err, results) => {
          if (err)
            done(null, false);
          var user = results[0];

          if (!user)
            return done(null, false);

          hasher({
            password: password,
            salt: user.salt
          }, (err, pass, salt, hash) => {

            if (hash === user.password)
              done(null, user);
            else
              done(null, false);
          });
        })
      } else {
        hasher({
          password: password,
          salt: user.salt
        }, (err, pass, salt, hash) => {

          if (hash === user.password)
            done(null, user);
          else
            done(null, false);
        });
      }


    });
  }));

  passport.serializeUser((user, done) => {
    console.log('serializeUser');
    done(null, user.username);
  });

  passport.deserializeUser((username, done) => {
    console.log('deserializeUser');
    var sql = `SELECT users.id as id, username, kakaoId, token, email, majorId, major.college, major.major, schoolId, name, nickname,
    assoname, phone, grade, assoId, assocollege, location, logo, description, assoemail, assophone
    fROM users
    LEFT JOIN asso ON users.assoId=asso.id
    LEFT JOIN major ON users.majorId=major.id
    WHERE username=?`

    conn.query(sql, [username], (err, results) => {
      if (err) {
        console.log(err);
        return done('There is no user');
      } else {
        if (results.length > 0) {
          var user = results[0];
          return done(null, user)
        } else {
          sql = `
          SELECT assoUser.id as id, username, token,grade,assoId,assocollege,assoname,location,logo,description,assophone,assoemail
          from assoUser 
          LEFT JOIN asso ON assoUser.assoId=asso.id 
          WHERE username=?`

          conn.query(sql, [username], (err, results) => {
            if (err) {
              console.log(err);
              return done('There is no user');
            } else {
              if (results.length > 0) {

                var user = results[0];
                return done(null, user)
              }
            }
          })
        }
      }

    });
  });

  return passport

}