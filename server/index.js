require('dotenv').config()
const bodyParser = require('body-parser')
const massive = require('massive')
const express = require('express')
const session = require('express-session')
const passport = require('passport')
const auth0strategy = require('passport-auth0')
const port = process.env.SERVER_PORT || 4001
const ctrl = require('./controller')

const app = express();

app.use(bodyParser.json());
massive(process.env.CONNECTION_STRING).then(db => {
    console.log('--database connected--')
    app.set('db', db)
    app.listen(port, () => console.log(`0,0 listending on port ${port}`))
})
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
const strategy = new auth0strategy({
    domain: process.env.DOMAIN,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: '/login',
    scope: 'openid email profile'
}, async function (accessToken, refreshToken, extraParams, profile, done) {
    const dbInstance = app.get('db')
    const users = await dbInstance.get_users()
    const match = users.find((el) => el.auth_id === profile.id)
    if (match) {
        done(null, profile.id)
    } else {
        dbInstance.create_user([
            profile.id,
            profile._json.given_name,
            profile._json.family_name,
            profile.picture
        ]).then(_ => done(null, profile.id))
    }
})
passport.use(strategy)
passport.serializeUser(function (user_id, done) {
    console.log('serializing')
    done(null, user_id)
})
passport.deserializeUser(async function (user_id, done) {
    // check for existing user in DB
    // puts user info on req.user
    console.log('deserializing')
    const dbInstance = app.get('db')
    dbInstance.get_user_by_auth_id([user_id]).then(match => {
        console.log('returning this; ', match[0])
        done(null, match[0])
    })
})

// auth endpoint
app.get('/login', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/dashboard',
    failureRedirect: 'http://localhost:3000/#/'
}))
// check endpoint
app.get('/check', ctrl.checkLoggedIn)
// logout endpoint
app.get('/logout', (req, res) => {
    req.logOut()
    return res.redirect('http://localhost:3000/#/')
})