const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const Senator = require('../models/senator');  

//Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// GET requests to /senators
// (1) General get request - gets all senators in the database
router.get('/', jsonParser, (req, res) => {
  Senator
    .find()
    .then(senators => {
      res.json({
        senators: senators.map(
          (senator) => senator.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

//(2) An endpoint that allows for a request such as: /senators/standsFor?gunControl=100&proLife=100
router.get('/standsFor', (req, res) => {
    const filters = {};
    //ADD ANY NEW SEARCHABLE FIELDS HERE:
    const queryableFields = ['gunControl', 'proLife', 'gayMarriage', 'cleanEnergy', 'smallGovernment']; 
    queryableFields.forEach(field => {
        if (req.query[field]) {
          //50=user doesn't care, so return all. Ex: gunControl=50 --> returns all senators with score > -1
          if (req.query[field] == 50) {
            filters[field] = {$gt : -1} //if user doesn't care about this metric (=50) then return all results
          }
          else {filters[field] = req.query[field]}
        }
    });
    console.log(req);
    console.log(filters);
    Senator
        .find(filters)
        .sort({impact: -1})//+1=ascending order; -1=descending order
        .then(senators => {
          res.json({
            senators: senators.map(
              (senator) => senator.apiRepr())
          });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
});

// (3) An endpoint that allows for a request such as: /senators/party/dem
router.get('/party/:party', (req, res) => {
  Senator
    .find({party: req.params.party})
    .then(senators => {
      res.json({
        senators: senators.map(
          (senator) => senator.apiRepr())
      });
    })
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

//ADDING A POST ENDPOINT
router.post('/', jsonParser, (req, res) => {
  const requiredFields = [
    'name', 
    'active',
    'state', 
    'party', 
    'effectiveness', 
    'gunControl', 
    'proLife', 
    'gayMarriage', 
    'cleanEnergy', 
    'smallGovernment'
  ];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Senator
    .create({
      name: req.body.name,
      active: req.body.active,
      state: req.body.state,
      party: req.body.party,
      effectiveness: req.body.effectiveness,
      gunControl: req.body.gunControl,
      proLife: req.body.proLife,
      gayMarriage: req.body.gayMarriage,
      cleanEnergy: req.body.cleanEnergy,
      smallGovernment: req.body.smallGovernment})
    .then(
      senator => res.status(201).json(senator.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

//ADDING PUT ENDPOINT
router.put('/:id', jsonParser, (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }
  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = [
    'name', 
    'active', 
    'state', 
    'party', 
    'effectiveness', 
    'gunControl', 
    'proLife', 
    'gayMarriage', 
    'cleanEnergy', 
    'smallGovernment'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Senator
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(senator => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

//ADDING DELETE ENDPOINT
router.delete('/:id', (req, res) => {
  Senator
    .findByIdAndRemove(req.params.id)
    .then(vaccine => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
