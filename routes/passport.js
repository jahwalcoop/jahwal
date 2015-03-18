var memberData = require('./model/member');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

module.exports = init;
function init(app) {
    console.log('init');
    app.use(passport.initialize()); // Add passport initialization
    app.use(passport.session());    // Add passport initialization

    passport.use(new LocalStrategy({
            usernameField: 'pid',
            passwordField: 'password'
        },
        function (pid, password, done) {
            var date = new Date();
            console.log('pid:' + pid + password + ' date:'+date.toDateString());

            memberData.findByPid(pid.toLowerCase(), function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Unknown user ' + pid });
                }
                user.comparePassword(password, function (err, isMatch) {
                    if (err) return done(err);
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Invalid password' });
                    }
                });
            });
        }
    ));

// Serialized and deserialized methods when got from session
    passport.serializeUser(function (user, done) {
        console.log('serializeUser:'+user.Pid)
        done(null, user.Pid);
    });

    passport.deserializeUser(function (pid, done) {
        console.log('de-serializeUser:'+pid)
        memberData.findByPid(pid, function (err, user) {
            done(err, user);
        });
    });
}