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
const posts = new Datastore({
  filename: 'data/posts.db',
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
passport.deserializeUser((_id, done) => users.findOne({ _id }, (err, user) => {
  if (err) { return done(err); }
  done(null, user);
}));


const app = express()
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/', express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('express-session')({ secret: '89460248-d485-4aa2-bd96-ac157cf2485f', resave: false, saveUninitialized: false }))
app.use(passport.initialize());
app.use(passport.session());
app.get('/signup', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard')
  } else {
    res.sendFile(__dirname + '/public/signup.html')
  }
});
app.post('/signup', (req, res, next) => {
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(req.body.password, salt, null, function(err, password) {
      if (err) return next(err);
      users.insert({ username: req.body.username, password }, (user, err) => res.redirect('/dashboard'))
    });
  })
})
app.get('/signin', (req, res) => {
  if (req.user) {
    res.redirect('/dashboard')
  } else if (req.query.failed) {
    res.sendFile(__dirname + '/public/failedsignin.html')
  } else {
    res.sendFile(__dirname + '/public/signin.html')
  }
});
app.post('/signin', passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/signin?failed=true' }));
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});
app.get('/dashboard', (req, res) => {
  if (req.user) {
    res.sendFile(__dirname + '/public/dashboard.html')
  } else {
    res.redirect('/signin')
  }
})
app.get('/posts', (req, res, next) => posts.find({ x: { $gte: req.query.minx, $lte: req.query.maxx }, y: { $gte: req.query.miny, $lte: req.query.maxy } }, (err, doc) => {
  if (err) {
    return next(err)
  }
  res.send(doc)
}))
app.post('/posts', (req, res, next) => posts.insert(Object.assign({ user: req.user._id, created: new Date(), upvotes: 0 }, req.body), (err, doc) => {
  if (err) {
    return next(err)
  }
  res.send(doc)
}))
app.post('/posts/:post/upvote', (req, res, next) => posts.update({ _id: req.params.post }, { $inc: { upvotes: 1 } }, { returnUpdatedDocs: true }, (err, _, doc) => {
  if (err) {
    return next(err)
  }
  res.send(doc)
}))
app.post('/posts/:post/downvote', (req, res, next) => posts.update({ _id: req.params.post }, { $inc: { upvotes: -1 } }, { returnUpdatedDocs: true }, (err, _, doc) => {
  if (err) {
    return next(err)
  }
  res.send(doc)
}))
app.listen(port)

console.log(`Open localhost:${port} in your browser`);
