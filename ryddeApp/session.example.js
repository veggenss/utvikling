const session = require('express-session');

module.exports = session({
    secret: "your_secret", //endre dette
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*72, //3 dager
        sameSite: "lax",
        secure: false
    }
});