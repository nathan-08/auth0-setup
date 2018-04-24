const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const session = require('express-session')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const port = process.env.SERVER_PORT || 4001;
const ctrl = require('./controller')
const users = require('./users')
const massive = require('massive');

const app = express();
// middleware
app.use(bodyParser.json());
massive('postgres://ntmhfkzbkuovpc:9452b1dd472f8144fda8e5fa073324fedb1dfde224f81f8b12cdaaf0ea3e3c52@ec2-50-17-235-5.compute-1.amazonaws.com:5432/dbdi2s6lksp5og?ssl=true').then(db => {
    console.log('--database connected--')
    app.set('db', db)
})
app.use(session({
    secret: 'asdfASDFasdfASDF',
    resave: true,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
// auth0 strategy
const strategy = new Auth0Strategy({
    domain: process.env.DOMAIN,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/login',
},
    function (accessToken, refreshToken, extraParams, profile, done) {
        console.log('profile', profile)
        // get name and other relevant data
        const user = {
            auth_id: profile.id,
            first_name: profile._json.given_name,
            last_name: profile._json.family_name,
            img_url: profile.picture
        }
        return done(null, user)
    }
)
passport.use(strategy)
passport.serializeUser(function (user, done) {
    console.log('serializing user to session: user: ', user)
    done(null, user)
})
passport.deserializeUser(async function (user, done) {
    console.log('deserializing user: ', user)
    const dbInstance = app.get('db')
    let users = await dbInstance.get_users().then(users => {
        return users
    })
    // find user by id
    const match = users.find((el) => el.auth_id === user.auth_id)
    if (match) return done(null, match)
    // no user found; create user
    console.log('no match found, creating user')
    const { auth_id, first_name, last_name, img_url } = user;
    let newUser = await dbInstance.create_user([auth_id, first_name, last_name, img_url]).then(user => user[0])
    console.log('created new user: ', newUser)
    return done(null, newUser)
})
// ENDPOINTS
// auth endpoint
app.get('/login', passport.authenticate('auth0', {
    successRedirect: "http://localhost:3000/#/dashboard",
    failureRedirect: "/"
}))
// check for logged in user
app.get('/check', ctrl.checkLoggedIn)
//logout
app.get('/logout', function (req, res) {
    console.log('loggin out')
    req.session.destroy(function () { res.send(200) })
})

app.listen(port, _ => console.log(`0,0 listening on port ${port}`))
