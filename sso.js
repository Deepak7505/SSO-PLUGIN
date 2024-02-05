const express = require('express');
const session = require('express-session');
const passport = require('passport');
const ShopifyStrategy = require('passport-shopify').Strategy;
const { API_KEY, API_SECRET_KEY, SESSION_SECRET } = require('./constat');

 
 
const app = express();

app.use(session({ secret: SESSION_SECRET, resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session()); 


// 
 
passport.use(
  new ShopifyStrategy(
    {
      clientID: API_KEY,
      clientSecret: API_SECRET_KEY,
      callbackURL: 'http://localhost:7000/auth/shopify/callback', 
      shop:'testpppp23.myshopify.com',
      scope: ['read_products'],
      accessMode: 'offline', 
    },
    (accessToken, refreshToken, profile, done) => {
      
      console.log(accessToken ,' profile is ' ,profile);
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);


passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};



app.get('/', (req, res) => {
  res.send('Hello! Please <a href="/auth/shopify">Log in with Shopify</a>.');
});

app.get('/login', (req, res) => {
  res.send('Please log in first: <a href="/auth/shopify">Log in with Shopify</a>.');
});

app.get('/auth/shopify', passport.authenticate('shopify') );

app.get('/auth/shopify/callback', passport.authenticate('shopify', { failureRedirect: '/login' }), (req, res) => {
  
  res.redirect('/secure');
});

app.get('/secure', isAuthenticated, (req, res) => {
  res.send(`Authenticated! Access Token: ${req.user.accessToken} `);
});


const port = 7000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
