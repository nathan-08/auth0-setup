module.exports = {
    checkLoggedIn: function (req, res) {
        console.log('checking for logged in user', req.user)
        //check if user has logged in 
        if (req.user) {
            res.status(200).send(req.user)
        } else res.status(401).send('unauthorized')
    }
}