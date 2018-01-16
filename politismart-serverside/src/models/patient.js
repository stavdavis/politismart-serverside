const mongoose = require('mongoose');

// this is our schema to represent a patient
const schema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  dob: {type: Date, required: true}, 
  gender: {type: String, requires: true},
  guardians: {type: String, required: true}
});

// virtuals define object properties that are nicer representations of db properties (via apiRepr below)
schema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`.trim()});

schema.virtual('age').get(function() {
  return `${Date.now() - this.dob / (1000 * 3600 * 24)}`});

//Manipulating the representation of the returned API data:
schema.methods.apiRepr = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    dob: this.dob,
    gender: this.gender,
    guardians: this.guardians
  };
}

const Patient = mongoose.model('Patient', schema);

module.exports = Patient;
