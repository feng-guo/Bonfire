const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const express = require('express');
const Datastore = require('nedb');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const port = process.env.PORT || 8000
const users = new Datastore({
  filename: 'data/users.db',
  autoload: true
})
passport.use(new LocalStrategy((username, password, done) => {
    users.findOne({ username }, (err, user) => {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      bcrypt.compare(password, user.password, function(err, res) {
        if (err) { return done(err); }
        if (res === false) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      });
    });
  }
));
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) => {
  users.findOne({ id }, (err, user) => {
    if (err) { return done(err); }
    done(null, user);
  });
});


const app = express()
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-session')({ secret: '89460248-d485-4aa2-bd96-ac157cf2485f', resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
app.get('/signup', (req, res) => res.sendFile(__dirname + '/public/signup.html'));
app.post('/signup', (req, res, next) => {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(req.body.password, salt, null, function(err, password) {
      if (err) return next(err);
      users.insert({ username: req.body.username, password }, (user, err) => res.redirect('/dashboard.html'))
    });
  })
})
app.get('/signin', (req, res) => res.sendFile(__dirname + '/public/signin.html'));
app.post('/signin',
  passport.authenticate('local', { failureRedirect: '/failedsignin.html' }),
  (req, res) => res.redirect('/dashboard.html'));
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.listen(port)

console.log(`Open localhost:${port} in your browser`);
