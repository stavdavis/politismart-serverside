const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const Vaccine = require('../models/vaccine');
//Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// GET requests to /vaccines
router.get('/', jsonParser, (req, res) => {
  Vaccine
    .find()
    .then(vaccines => {
      res.json({
        vaccines: vaccines.map(
          (vaccine) => vaccine.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// can also request by patientId
router.get('/byPatient/:patientId', (req, res) => {
  Vaccine
    .find({patientId: req.params.patientId})
    .then(vaccines => {
      res.json({
        vaccines: vaccines.map(
          (vaccine) => vaccine.apiRepr())
      });
    })
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

//ADDING A POST ENDPOINT
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['vaccineName', 'vaccineStatus', 'patientId', 'relatedDiseases'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Vaccine
    .create({
      vaccineName: req.body.vaccineName,
      vaccineStatus: req.body.vaccineStatus,
      patientName: req.body.patientName,
      patientId: req.body.patientId,
      relatedDiseases: req.body.relatedDiseases,
      dueDate: req.body.dueDate,
      doneDate: req.body.doneDate})
    .then(
      restaurant => res.status(201).json(restaurant.apiRepr()))
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
  const updateableFields = ['vaccineStatus', 'dueDate', 'doneDate'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Vaccine
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(vaccine => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

//ADDING DELETE ENDPOINT
router.delete('/:id', (req, res) => {
  Vaccine
    .findByIdAndRemove(req.params.id)
    .then(vaccine => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
