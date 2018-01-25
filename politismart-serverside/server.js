'use strict';
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Mongoose internally uses a promise-like object, but its better to make it use ES6 promises
mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

app.use(morgan('common'));
app.use(express.static('./src/public')); //to serve static index.html file. Only used if server side has public facing pages
app.use(bodyParser.json());

///////LOGIN PROCESS MANAGEMENT - START
/*   //UNCOMMENT THIS BLOCK TO RE-ENABLE JWT PROTECTIONS. ALSO UNCOMMENT WHAT USED TO BE LINE 49 BELOW (MIDDLEWARE FOR ENDPOINT)
require('dotenv').config(); //need this for the local .env file
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('./src/auth');
const { router: usersRouter } = require('./src/users');

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false }); //This is used for all endpoint (routed) below
*/
///////LOGIN PROCESS MANAGEMENT - END

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

///////ENDPOINT ROUTING MANAGEMENT SECTION - START
//Initial version only has 100 US senators.
const senateRouter = require('./src/routers/senateRouter');
app.use('/senators', senateRouter);
// app.use('/senators', jwtAuth, senateRouter);    //SWITCH THIS LINE AND NEXT TO RE-ENABLE JWT PROTECTION FOR THIS ENDPOINT!!!!!

//Future versions will have other lawmaker routers, starting with congress reps
//const congressRepsRouter = require('./src/routers/congressRepsRouter');
//app.use('/congressReps', jwtAuth, congressRepsRouter);

////Future versions will have other lawmakers, starting with congress reps
//const congressRepsRouter = require('./src/routers/congressRepsRouter');
//app.use('/congressReps', jwtAuth, congressRepsRouter);

///////ENDPOINT ROUTING MANAGEMENT SECTION- END

///////CREATING RUNSERVER AND CLOSESERVER (FOR TESTING) SECTION - START
// closeServer needs a server object (assigned in `runServer`)
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

///////CREATING RUNSERVER AND CLOSESERVER (FOR TESTING) SECTION - START
// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};