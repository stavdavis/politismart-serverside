'use strict';

//Reqs for login/registration/JWTs:////////////////////////////////////////////
require('dotenv').config(); //need this for the local .env file
const passport = require('passport');
// Using destructuring assignment with renaming so the two "router" variables (users and auth) have different names:
const { router: usersRouter } = require('./src/users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./src/auth');

//All other server-side reqs://////////////////////////////////////////////////
const express = require('express');
const morgan = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

//Mongoose internally uses a promise-like object, but its better to make it use ES6 promises
mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

app.use(morgan('common'));
// app.use(express.static('./src/public')); //to serve static index.html file. Only used if server side has public facing pages
app.use(bodyParser.json());

// CORS handling via middleware: /////////////////////////////////////////////
//IMPORTANT: App with throw a CORS error if JWT_SECRET is not defined in env-vars (on Heroku for example) - so make sure it's there.
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

//LOGIN/REGISTER PROCESS MANAGEMENT - START /////////////////////////////////////////////
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/users/', usersRouter);
app.use('/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false }); //this is used for all protected endpoints below

///////ENDPOINT ROUTING MANAGEMENT SECTION - START /////////////////////////////////////
//Initial version only has 100 US senators.
//This endpoint is not protected initially. To make it protected - replace with commented line below (adding jwtAuth)
const senateRouter = require('./src/senators/senateRouter');
app.use('/senators', senateRouter);
// app.use('/senators', jwtAuth, senateRouter);    //SWITCH THIS LINE AND PREVIOUS TO RE-ENABLE JWT PROTECTION FOR THIS ENDPOINT!!!!!

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});
///////ENDPOINT ROUTING MANAGEMENT SECTION- END ////////////////////////////////////////

///////CREATING RUNSERVER AND CLOSESERVER (FOR TESTING) SECTION - START //////////////////////
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
//CREATING RUNSERVER AND CLOSESERVER (FOR TESTING) SECTION - END //////////////////////

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer }