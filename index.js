/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");

// Configure body-parser middleware for parsing URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// set the app to use ejs for rendering
app.set('view engine', 'ejs');

// set location of static files
app.use(express.static(__dirname + '/public'));

// Serve static files from 'node_modules' folder
app.use('/node_modules', express.static('node_modules'));

// Session middleware setup
app.use(session({
    secret: 'my-article-blog', // Secret key for session encryption
    resave: false, // Do not save the session if unmodified
    saveUninitialized: false, // Do not save new sessions that have not been modified
    cookie: { 
        secure: false, // Cookie is not secure (not using HTTPS)
        maxAge: 30 * 60 * 1000 // Session expires after 30 minutes of inactivity
    }
}));

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

// Handle requests to the intial home page 
app.get('/', (req, res) => {
    res.render('index.ejs')
});

// Add all the route handlers in authorRoutes to the app under the path /author
const authorRoutes = require('./routes/author');
app.use('/author', authorRoutes);

// Add all the route handlers in readerRoutes to the app under the path /reader
const readerRoutes = require('./routes/reader');
app.use('/reader', readerRoutes);

// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

