const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');
const Patient = require('../models/patient');
//Mongoose internally uses a promise-like object,
// but its better to make Mongoose use built in es6 promises
mongoose.Promise = global.Promise;

// GET requests to /patients
router.get('/', jsonParser, (req, res) => {
  Patient
    .find()
    .then(patients => {
      res.json({
        patients: patients.map(
          (patient) => patient.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

// can also request by guardians field
router.get('/byGuardianName/:guardians', (req, res) => {
  Patient
    .find({guardians: req.params.guardians})
    .then(patients => {
      res.json({
        patients: patients.map(
          (patient) => patient.apiRepr())
      });
    })
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

// can also request by patient ID
router.get('/byPatientId/:id', (req, res) => {
  Patient
    .findById(req.params.id)
    .then(patient =>res.json(patient.apiRepr()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

//ADDING A POST ENDPOINT
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'dob', 'gender', 'guardians'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  Patient
    .create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dob: req.body.dob,
      gender: req.body.gender,
      guardians: req.body.guardians})
    .then(
      patient => res.status(201).json(patient.apiRepr()))
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
  const updateableFields = ['guardians'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });
  Patient
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(patient => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

//ADDING DELETE ENDPOINT
router.delete('/:id', (req, res) => {
  Patient
    .findByIdAndRemove(req.params.id)
    .then(patient => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

module.exports = router;
