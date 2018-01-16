const mongoose = require('mongoose');

// this is our schema to represent a vaccine
const schema = mongoose.Schema({
  vaccineName: {type: String, required: true},
  vaccineStatus: {type: String, required: true}, //"Done" or "Not yet"
  patientName: {type: String},
  patientId: {type: String, required: true},
  relatedDiseases: {type: String, required: true},
  dueDate: {type: Date},
  doneDate: {type: Date}
});

//Manipulating the representation of the returned API data:
schema.methods.apiRepr = function() {
  return {
    id: this._id,
    vaccineName: this.vaccineName,
    vaccineStatus: this.vaccineStatus,
    patientName: this.patientName,
    patientId: this.patientId,
    relatedDiseases: this.relatedDiseases,
    dueDate: this.dueDate,
    doneDate: this.doneDate
  };
}

const Vaccine = mongoose.model('Vaccine', schema);

module.exports = Vaccine;
